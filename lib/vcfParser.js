// VCF parser — reads variant call format files and pulls out the PGx-relevant stuff

import { GENE_VARIANT_MAP } from "./pharmacoKB";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// VCF files are annoyingly inconsistent with delimiters so we try all of them
function splitVCFLine(line) {
    const tabFields = line.split("\t");
    if (tabFields.length >= 8) return tabFields;

    const multiSpaceFields = line.split(/\s{2,}/);
    if (multiSpaceFields.length >= 8) return multiSpaceFields;

    const anyWhitespaceFields = line.split(/\s+/);
    if (anyWhitespaceFields.length >= 8) return anyWhitespaceFields;

    // fallback: return whichever split gave the most fields
    if (tabFields.length >= multiSpaceFields.length && tabFields.length >= anyWhitespaceFields.length) {
        return tabFields;
    }
    return anyWhitespaceFields.length >= multiSpaceFields.length ? anyWhitespaceFields : multiSpaceFields;
}

// build a quick lookup so we can match rsIDs without looping every time
function buildRsidLookup() {
    const lookup = {};
    for (const [gene, data] of Object.entries(GENE_VARIANT_MAP)) {
        for (const [rsid, info] of Object.entries(data.variants)) {
            lookup[rsid] = { gene, ...info };
        }
    }
    return lookup;
}

const RSID_LOOKUP = buildRsidLookup();

// pull genotype out of the FORMAT/SAMPLE columns
function parseGenotype(formatStr, sampleStr) {
    if (!formatStr || !sampleStr) return null;

    const formatFields = formatStr.split(":");
    const sampleFields = sampleStr.split(":");
    const gtIndex = formatFields.indexOf("GT");

    if (gtIndex === -1 || gtIndex >= sampleFields.length) return null;

    const gt = sampleFields[gtIndex];
    const phased = gt.includes("|");
    const separator = phased ? "|" : "/";
    const alleles = gt.split(separator).map((a) => (a === "." ? -1 : parseInt(a, 10)));

    if (alleles.length < 2) return null;

    return {
        allele1: alleles[0],
        allele2: alleles[1],
        phased,
        raw: gt,
    };
}

// INFO field is semicolon-separated key=value pairs
function parseInfoField(infoStr) {
    if (!infoStr || infoStr === ".") return {};

    const info = {};
    const parts = infoStr.split(";");
    for (const part of parts) {
        const eqIndex = part.indexOf("=");
        if (eqIndex > 0) {
            const key = part.substring(0, eqIndex).trim();
            const value = part.substring(eqIndex + 1).trim();
            info[key] = value;
        } else {
            info[part.trim()] = true; // flag field
        }
    }
    return info;
}

// main entry point
export function parseVCF(vcfContent) {
    const result = {
        metadata: {
            fileFormat: null,
            source: null,
            reference: null,
            infoFields: {},
            sampleIds: [],
        },
        allVariants: [],
        pharmacogenomicVariants: [],
        qualityMetrics: {
            vcf_parsing_success: false,
            total_variants_parsed: 0,
            pharmacogenomic_variants_found: 0,
            genes_with_variants: [],
            parsing_errors: [],
        },
    };

    if (!vcfContent || typeof vcfContent !== "string") {
        result.qualityMetrics.parsing_errors.push("Empty or invalid VCF content");
        return result;
    }

    const byteSize = new Blob([vcfContent]).size;
    if (byteSize > MAX_FILE_SIZE) {
        result.qualityMetrics.parsing_errors.push(
            `File size (${(byteSize / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed (5 MB)`
        );
        return result;
    }

    const lines = vcfContent.split(/\r?\n/);
    let columnHeaders = [];
    let headerParsed = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // meta-information lines
        if (line.startsWith("##")) {
            const metaMatch = line.match(/^##(\w+)=(.+)$/);
            if (metaMatch) {
                const key = metaMatch[1];
                const value = metaMatch[2];

                if (key === "fileformat") {
                    result.metadata.fileFormat = value;
                } else if (key === "source") {
                    result.metadata.source = value;
                } else if (key === "reference") {
                    result.metadata.reference = value;
                } else if (key === "INFO") {
                    const infoMatch = value.match(/<ID=(\w+),/);
                    if (infoMatch) {
                        result.metadata.infoFields[infoMatch[1]] = value;
                    }
                }
            }
            continue;
        }

        // column header line
        if (line.startsWith("#CHROM") || line.startsWith("#chrom")) {
            columnHeaders = splitVCFLine(line.substring(1));
            headerParsed = true;

            // grab sample IDs (everything after FORMAT)
            const formatIndex = columnHeaders.indexOf("FORMAT");
            if (formatIndex >= 0 && formatIndex < columnHeaders.length - 1) {
                result.metadata.sampleIds = columnHeaders.slice(formatIndex + 1);
            }
            continue;
        }

        if (line.startsWith("#")) continue;

        // data lines
        if (!headerParsed) {
            columnHeaders = ["CHROM", "POS", "ID", "REF", "ALT", "QUAL", "FILTER", "INFO", "FORMAT", "SAMPLE"];
            headerParsed = true;
        }

        const fields = splitVCFLine(line);
        if (fields.length < 8) {
            result.qualityMetrics.parsing_errors.push(`Line ${i + 1}: insufficient columns (${fields.length})`);
            continue;
        }

        const variant = {
            chrom: fields[0],
            pos: parseInt(fields[1], 10),
            id: fields[2] || ".",
            ref: fields[3],
            alt: fields[4],
            qual: fields[5] === "." ? null : parseFloat(fields[5]),
            filter: fields[6],
            info: parseInfoField(fields[7]),
            genotype: null,
            lineNumber: i + 1,
        };

        if (fields.length >= 10) {
            variant.genotype = parseGenotype(fields[8], fields[9]);
        }

        result.allVariants.push(variant);

        const pgxVariant = identifyPGxVariant(variant);
        if (pgxVariant) {
            result.pharmacogenomicVariants.push(pgxVariant);
        }
    }

    // quality metrics
    result.qualityMetrics.vcf_parsing_success = result.qualityMetrics.parsing_errors.length === 0;
    result.qualityMetrics.total_variants_parsed = result.allVariants.length;
    result.qualityMetrics.pharmacogenomic_variants_found = result.pharmacogenomicVariants.length;

    const geneSet = new Set(result.pharmacogenomicVariants.map((v) => v.gene));
    result.qualityMetrics.genes_with_variants = [...geneSet];

    if (result.allVariants.length > 0) {
        result.qualityMetrics.vcf_parsing_success = true;
    }

    return result;
}

// tries multiple strategies to identify PGx variants
// TODO: should probably also check chromosomal position as a fallback
function identifyPGxVariant(variant) {
    let gene = null;
    let starAllele = null;
    let rsid = null;
    let matchMethod = null;
    let variantInfo = null;

    // check INFO GENE tag
    if (variant.info.GENE) {
        const geneTag = variant.info.GENE.toUpperCase();
        if (GENE_VARIANT_MAP[geneTag]) {
            gene = geneTag;
            matchMethod = "INFO_GENE_TAG";
        }
    }

    // check rsID from ID column or INFO RS tag
    const candidateRsids = [];
    if (variant.id && variant.id !== "." && variant.id.startsWith("rs")) {
        candidateRsids.push(variant.id);
    }
    if (variant.info.RS) {
        candidateRsids.push(variant.info.RS);
    }

    for (const rid of candidateRsids) {
        if (RSID_LOOKUP[rid]) {
            rsid = rid;
            gene = RSID_LOOKUP[rid].gene;
            variantInfo = RSID_LOOKUP[rid];
            starAllele = RSID_LOOKUP[rid].allele;
            matchMethod = matchMethod ? `${matchMethod}+RSID` : "RSID_MATCH";
            break;
        }
    }

    // check INFO STAR tag
    if (variant.info.STAR) {
        starAllele = variant.info.STAR;
        matchMethod = matchMethod ? `${matchMethod}+STAR_TAG` : "INFO_STAR_TAG";

        if (!gene) {
            for (const [geneName, geneData] of Object.entries(GENE_VARIANT_MAP)) {
                for (const vInfo of Object.values(geneData.variants)) {
                    if (vInfo.allele === starAllele) {
                        gene = geneName;
                        variantInfo = vInfo;
                        break;
                    }
                }
                if (gene) break;
            }
        }
    }

    if (!gene) return null;

    // figure out zygosity
    let zygosity = "unknown";
    let isVariant = true;

    if (variant.genotype) {
        const { allele1, allele2 } = variant.genotype;
        if (allele1 === 0 && allele2 === 0) {
            zygosity = "homozygous_ref";
            isVariant = false;
        } else if (allele1 === allele2) {
            zygosity = "homozygous_alt";
        } else if (allele1 === 0 || allele2 === 0) {
            zygosity = "heterozygous";
        } else {
            zygosity = "compound_heterozygous";
        }
    } else if (variant.alt && variant.alt !== "." && variant.ref !== variant.alt) {
        // no genotype info available, just guess het
        zygosity = "inferred_heterozygous";
    }

    if (!isVariant) return null;

    return {
        gene,
        rsid: rsid || variant.id,
        starAllele: starAllele || (variantInfo ? variantInfo.allele : null),
        chrom: variant.chrom,
        pos: variant.pos,
        ref: variant.ref,
        alt: variant.alt,
        zygosity,
        genotype: variant.genotype ? variant.genotype.raw : null,
        function: variantInfo ? variantInfo.function : "unknown",
        activityValue: variantInfo ? variantInfo.activityValue : null,
        description: variantInfo ? variantInfo.description : null,
        matchMethod,
        quality: variant.qual,
    };
}

// quick sanity check
export function validateVCF(content) {
    const errors = [];

    if (!content || typeof content !== "string") {
        errors.push("File content is empty or invalid");
        return { valid: false, errors };
    }

    const byteSize = new TextEncoder().encode(content).length;
    if (byteSize > MAX_FILE_SIZE) {
        errors.push(`File size (${(byteSize / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit`);
    }

    if (!content.includes("##fileformat=VCF") && !content.includes("##fileformat=vcf")) {
        errors.push("Warning: Missing ##fileformat=VCF header. File may not be standard VCF format.");
    }

    if (!content.includes("#CHROM") && !content.includes("#chrom")) {
        errors.push("Missing #CHROM column header line");
    }

    return { valid: errors.filter(e => !e.startsWith("Warning")).length === 0, errors };
}
