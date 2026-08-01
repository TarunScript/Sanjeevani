// risk assessment logic

import {
    GENE_VARIANT_MAP,
    DRUG_GENE_MAP,
    RISK_MATRIX,
    DOSING_RECOMMENDATIONS,
    CPIC_REFERENCES,
    classifyPhenotype,
    normalizeDrugName,
} from "./pharmacoKB";


export function assessRisk(pgxVariants, drugName) {
    const normalizedDrug = normalizeDrugName(drugName);

    const drugInfo = DRUG_GENE_MAP[normalizedDrug];
    if (!drugInfo) {
        return buildUnknownResult(normalizedDrug, "Drug not found in knowledge base");
    }

    const targetGene = drugInfo.gene;
    const geneData = GENE_VARIANT_MAP[targetGene];
    if (!geneData) {
        return buildUnknownResult(normalizedDrug, `Gene ${targetGene} not found in knowledge base`);
    }

    const geneVariants = pgxVariants.filter((v) => v.gene === targetGene);
    const diplotype = buildDiplotype(geneVariants, geneData, targetGene);
    const activityScore = diplotype.allele1.activityValue + diplotype.allele2.activityValue;
    const phenotypeResult = classifyPhenotype(targetGene, activityScore);

    const riskData = RISK_MATRIX[normalizedDrug];
    const riskEntry = riskData ? (riskData[phenotypeResult.code] || riskData.NM) : null;

    const dosingData = DOSING_RECOMMENDATIONS[normalizedDrug];
    const dosingEntry = dosingData ? (dosingData[phenotypeResult.code] || dosingData.NM) : null;

    // TODO: confidence calc could probably be better, this is pretty rough
    const confidence = calculateConfidence(geneVariants, diplotype, phenotypeResult, targetGene);
    const references = CPIC_REFERENCES[targetGene] || [];

    return {
        drug: normalizedDrug,
        risk_assessment: {
            risk_label: riskEntry ? riskEntry.risk : "Unknown",
            confidence_score: confidence.score,
            severity: riskEntry ? riskEntry.severity : "unknown",
        },
        pharmacogenomic_profile: {
            primary_gene: targetGene,
            diplotype: `${diplotype.allele1.allele}/${diplotype.allele2.allele}`,
            phenotype: phenotypeResult.code,
            phenotype_label: phenotypeResult.label,
            activity_score: activityScore,
            detected_variants: geneVariants.map((v) => ({
                rsid: v.rsid,
                star_allele: v.starAllele,
                zygosity: v.zygosity,
                function: v.function,
                ref: v.ref,
                alt: v.alt,
                description: v.description,
            })),
        },
        clinical_recommendation: {
            action: dosingEntry ? dosingEntry.action : "CONSULT",
            recommendation: dosingEntry
                ? dosingEntry.recommendation
                : "Consult clinical pharmacogenomics specialist for guidance.",
            cpic_guideline_level: dosingEntry ? dosingEntry.cpicLevel : "N/A",
            source: dosingEntry ? dosingEntry.source : "N/A",
            mechanism: drugInfo.mechanism,
            pathway: drugInfo.pathway,
        },
        confidence_details: confidence.details,
        references,
        _riskExplanation: riskEntry ? riskEntry.explanation : "",
    };
}

// builds the diplotype from whatever variants we found
// no variants = wildtype (*1/*1)
function buildDiplotype(geneVariants, geneData, geneName) {
    const defaultAllele = geneData.defaultAllele;

    if (geneVariants.length === 0) {
        return {
            allele1: defaultAllele,
            allele2: defaultAllele,
            method: "default_wildtype",
        };
    }

    // special case: TPMT *3A is actually *3B + *3C together
    if (geneName === "TPMT") {
        const has3B = geneVariants.some((v) => v.starAllele === "*3B");
        const has3C = geneVariants.some((v) => v.starAllele === "*3C");
        if (has3B && has3C) {
            const allBothHet = geneVariants.filter(
                (v) => v.starAllele === "*3B" || v.starAllele === "*3C"
            );
            const allHet = allBothHet.every((v) => v.zygosity === "heterozygous");
            if (allHet) {
                return {
                    allele1: { allele: "*3A", function: "no_function", activityValue: 0, description: "Combined *3B+*3C, no enzyme activity" },
                    allele2: defaultAllele,
                    method: "tpmt_3a_composite",
                };
            }
        }
    }

    // sort worst variants first
    const sorted = [...geneVariants].sort(
        (a, b) => (a.activityValue ?? 1) - (b.activityValue ?? 1)
    );

    const primaryVariant = sorted[0];

    if (primaryVariant.zygosity === "homozygous_alt") {
        const alleleInfo = {
            allele: primaryVariant.starAllele || "unknown",
            function: primaryVariant.function || "unknown",
            activityValue: primaryVariant.activityValue ?? 0,
            description: primaryVariant.description || "",
        };
        return {
            allele1: alleleInfo,
            allele2: alleleInfo,
            method: "homozygous_variant",
        };
    }

    if (primaryVariant.zygosity === "heterozygous" || primaryVariant.zygosity === "inferred_heterozygous") {
        const allele1 = {
            allele: primaryVariant.starAllele || "unknown",
            function: primaryVariant.function || "unknown",
            activityValue: primaryVariant.activityValue ?? 0,
            description: primaryVariant.description || "",
        };

        const isHet = (z) => z === "heterozygous" || z === "inferred_heterozygous";

        // compound het - second variant present
        if (sorted.length > 1 && isHet(sorted[1].zygosity)) {
            const allele2 = {
                allele: sorted[1].starAllele || "unknown",
                function: sorted[1].function || "unknown",
                activityValue: sorted[1].activityValue ?? 0,
                description: sorted[1].description || "",
            };
            return {
                allele1,
                allele2,
                method: primaryVariant.zygosity === "inferred_heterozygous" ? "inferred_compound_heterozygous" : "compound_heterozygous",
            };
        }

        // single het - pair with wildtype
        return {
            allele1: allele1,
            allele2: defaultAllele,
            method: primaryVariant.zygosity === "inferred_heterozygous" ? "inferred_heterozygous_with_wildtype" : "heterozygous_with_wildtype",
        };
    }

    return {
        allele1: defaultAllele,
        allele2: defaultAllele,
        method: "fallback_wildtype",
    };
}

// rough confidence score, not super scientific but gives an idea
function calculateConfidence(geneVariants, diplotype, phenotypeResult, gene) {
    let score = 0;
    const details = [];

    if (geneVariants.length > 0) {
        score += 0.30;
        details.push("Pharmacogenomic variant(s) detected in VCF (+0.30)");
    } else {
        score += 0.15;
        details.push("No variants detected — assuming wildtype reference (+0.15)");
    }

    const hasStar = geneVariants.some((v) => v.starAllele);
    if (hasStar) {
        score += 0.20;
        details.push("Star allele successfully mapped (+0.20)");
    }

    if (diplotype.allele1.allele && diplotype.allele2.allele) {
        score += 0.20;
        details.push("Diplotype fully resolved (+0.20)");
    }

    if (phenotypeResult && phenotypeResult.code) {
        score += 0.20;
        details.push(`Phenotype classified as ${phenotypeResult.label} (+0.20)`);
    }

    // well-studied variants with strong CPIC evidence
    const wellStudiedRsids = [
        "rs3892097", "rs4244285", "rs4986893", "rs12248560",
        "rs1799853", "rs1057910", "rs4149056",
        "rs1800462", "rs1800460", "rs1142345",
        "rs3918290", "rs55886062", "rs67376798",
    ];
    const hasWellStudied = geneVariants.some((v) =>
        wellStudiedRsids.includes(v.rsid)
    );
    if (hasWellStudied) {
        score += 0.10;
        details.push("Well-studied variant with strong CPIC evidence (+0.10)");
    }

    return {
        score: Math.min(1.0, parseFloat(score.toFixed(2))),
        details,
    };
}

function buildUnknownResult(drug, reason) {
    return {
        drug,
        risk_assessment: {
            risk_label: "Unknown",
            confidence_score: 0,
            severity: "unknown",
        },
        pharmacogenomic_profile: {
            primary_gene: "N/A",
            diplotype: "N/A",
            phenotype: "Unknown",
            phenotype_label: "Unknown",
            activity_score: null,
            detected_variants: [],
        },
        clinical_recommendation: {
            action: "CONSULT",
            recommendation: `${reason}. Consult a clinical pharmacogenomics specialist.`,
            cpic_guideline_level: "N/A",
            source: "N/A",
            mechanism: "Unknown",
            pathway: "Unknown",
        },
        confidence_details: [reason],
        references: [],
        _riskExplanation: reason,
    };
}

export function analyzeMultipleDrugs(pgxVariants, drugNames) {
    return drugNames.map((drug) => assessRisk(pgxVariants, drug));
}
