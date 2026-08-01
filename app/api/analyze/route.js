
import { NextResponse } from "next/server";
import { parseVCF, validateVCF } from "@/lib/vcfParser";
import { assessRisk } from "@/lib/riskEngine";
import { generateExplanation } from "@/lib/llmExplainer";
import { normalizeDrugName, isDrugSupported } from "@/lib/pharmacoKB";

export async function POST(request) {
    try {
        const formData = await request.formData();

        const vcfFile = formData.get("vcf");
        const drugsInput = formData.get("drugs");
        const geminiKey = formData.get("geminiKey") || formData.get("apiKey") || process.env.GEMINI_API_KEY || "";
        const groqKey = formData.get("groqKey") || process.env.GROQ_API_KEY || "";

        if (!vcfFile) {
            return NextResponse.json(
                { error: "No VCF file provided", details: "Please upload a .vcf file" },
                { status: 400 }
            );
        }

        if (!drugsInput) {
            return NextResponse.json(
                { error: "No drug name(s) provided", details: "Please enter at least one drug name" },
                { status: 400 }
            );
        }

        let vcfContent;
        if (typeof vcfFile === "string") {
            vcfContent = vcfFile;
        } else {
            vcfContent = await vcfFile.text();
        }

        const validation = validateVCF(vcfContent);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    error: "Invalid VCF file",
                    details: validation.errors.join("; "),
                },
                { status: 400 }
            );
        }

        const drugNames = drugsInput
            .split(",")
            .map((d) => d.trim())
            .filter((d) => d.length > 0);

        if (drugNames.length === 0) {
            return NextResponse.json(
                { error: "No valid drug names provided" },
                { status: 400 }
            );
        }

        const unsupported = drugNames.filter((d) => !isDrugSupported(d));
        if (unsupported.length > 0) {
            console.warn("skipping unsupported:", unsupported);
        }

        const vcfResult = parseVCF(vcfContent);
        console.log(`parsed ${vcfResult.allVariants.length} variants, ${vcfResult.pharmacogenomicVariants.length} pgx-relevant`);

        const timestamp = new Date().toISOString();
        const patientId = `PATIENT_${Date.now().toString(36).toUpperCase()}`;

        const results = [];

        for (const drugName of drugNames) {
            const normalizedDrug = normalizeDrugName(drugName);

            const riskResult = assessRisk(
                vcfResult.pharmacogenomicVariants,
                normalizedDrug
            );

            const explanationResult = await generateExplanation(riskResult, { geminiKey, groqKey });

            const output = {
                patient_id: patientId,
                drug: normalizedDrug,
                timestamp,
                risk_assessment: {
                    risk_label: riskResult.risk_assessment.risk_label,
                    confidence_score: riskResult.risk_assessment.confidence_score,
                    severity: riskResult.risk_assessment.severity,
                },
                pharmacogenomic_profile: {
                    primary_gene: riskResult.pharmacogenomic_profile.primary_gene,
                    diplotype: riskResult.pharmacogenomic_profile.diplotype,
                    phenotype: riskResult.pharmacogenomic_profile.phenotype,
                    detected_variants: riskResult.pharmacogenomic_profile.detected_variants,
                },
                clinical_recommendation: {
                    action: riskResult.clinical_recommendation.action,
                    recommendation: riskResult.clinical_recommendation.recommendation,
                    cpic_guideline_level: riskResult.clinical_recommendation.cpic_guideline_level,
                    source: riskResult.clinical_recommendation.source,
                    mechanism: riskResult.clinical_recommendation.mechanism,
                    pathway: riskResult.clinical_recommendation.pathway,
                },
                template_explanation: {
                    summary: explanationResult.template.summary,
                    mechanism: explanationResult.template.mechanism,
                    clinical_significance: explanationResult.template.clinical_significance,
                    citations: explanationResult.template.citations,
                    limitations: explanationResult.template.limitations,
                    model_used: explanationResult.template.model_used,
                },
                llm_generated_explanation: explanationResult.llm
                    ? {
                        summary: explanationResult.llm.summary,
                        mechanism: explanationResult.llm.mechanism,
                        pathway_steps: explanationResult.llm.pathway_steps || [],
                        clinical_significance: explanationResult.llm.clinical_significance,
                        citations: explanationResult.llm.citations,
                        limitations: explanationResult.llm.limitations,
                        model_used: explanationResult.llm.model_used,
                    }
                    : {
                        error: explanationResult.llm_error || "LLM explanation unavailable",
                        model_used: "none",
                    },
                quality_metrics: {
                    vcf_parsing_success: vcfResult.qualityMetrics.vcf_parsing_success,
                    total_variants_parsed: vcfResult.qualityMetrics.total_variants_parsed,
                    pharmacogenomic_variants_found: vcfResult.qualityMetrics.pharmacogenomic_variants_found,
                    genes_with_variants: vcfResult.qualityMetrics.genes_with_variants,
                    confidence_details: riskResult.confidence_details,
                },
            };

            results.push(output);
        }

        const response = results.length === 1 ? results[0] : { results, count: results.length };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("analysis failed:", error);
        return NextResponse.json(
            {
                error: "Internal server error during analysis",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        service: "Sanjeevani Analysis API",
        version: "1.0.0",
        status: "ok",
        supported_drugs: [
            "CODEINE", "CLOPIDOGREL", "WARFARIN",
            "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL",
            "VORICONAZOLE", "CAPECITABINE", "MERCAPTOPURINE",
        ],
        supported_genes: [
            "CYP2D6", "CYP2C19", "CYP2C9",
            "SLCO1B1", "TPMT", "DPYD",
        ],
    });
}
