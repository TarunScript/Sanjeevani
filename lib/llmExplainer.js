// handles LLM calls for generating clinical explanations
// TODO: might want to add response caching later so we don't burn API credits on repeated queries

import { CPIC_REFERENCES } from "./pharmacoKB";

function buildPrompt(riskResult) {
    const { drug, pharmacogenomic_profile: profile, risk_assessment: risk, clinical_recommendation: rec } = riskResult;

    const variantsSummary = profile.detected_variants.length > 0
        ? profile.detected_variants
            .map((v) => `${v.rsid} (${v.star_allele}, ${v.zygosity}, ${v.function})`)
            .join("; ")
        : "No pharmacogenomic variants detected (wildtype assumed)";

    return `You are a clinical pharmacogenomics expert providing a CONCISE explanation for a Sanjeevani report.

PATIENT DATA:
- Gene: ${profile.primary_gene}
- Diplotype: ${profile.diplotype}
- Phenotype: ${profile.phenotype_label}
- Activity Score: ${profile.activity_score}
- Detected Variants: ${variantsSummary}

DRUG: ${drug}
RISK LABEL: ${risk.risk_label}
SEVERITY: ${risk.severity}

CLINICAL RECOMMENDATION:
${rec.recommendation}

METABOLIC PATHWAY:
${rec.pathway}

Provide a JSON response with exactly these fields:
{
  "summary": "1-2 concise sentences explaining what this result means for the patient in plain language.",
  "mechanism": "1-2 concise sentences on how the variant affects drug metabolism.",
  "pathway_steps": ["Step1", "EnzymeName", "Step2", "EnzymeName", "Step3", "...", "FinalEffect"],
  "clinical_significance": "1-2 concise sentences about clinical risks or safety.",
  "citations": ["List 2-3 relevant CPIC guideline citations with authors and journal"],
  "limitations": "1 sentence about key limitation of this assessment."
}

RULES:
- Keep ALL text fields SHORT — maximum 2 sentences each. Judges read for 30 seconds.
- pathway_steps: list the metabolic pathway as alternating [substrate, enzyme, product, enzyme, product, ...]. Example for codeine: ["Codeine", "CYP2D6", "Morphine", "UGT2B7", "Morphine-6-glucuronide", "", "μ-opioid receptor activation"]. Use empty string "" for non-enzymatic steps.
- Return ONLY valid JSON, no markdown formatting, no code blocks.`;
}

function parseLLMResponse(text, modelName) {
    const cleanText = text.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleanText);

    return {
        summary: parsed.summary || "",
        mechanism: parsed.mechanism || "",
        pathway_steps: parsed.pathway_steps || [],
        clinical_significance: parsed.clinical_significance || "",
        citations: parsed.citations || [],
        limitations: parsed.limitations || "",
        model_used: modelName,
        generated_at: new Date().toISOString(),
    };
}

export async function generateExplanation(riskResult, keys) {
    const template = generateTemplateExplanation(riskResult);

    let llm = null;
    let llm_error = null;
    const errors = [];

    const prompt = buildPrompt(riskResult);

    // try Groq first (primary)
    if (keys.groqKey) {
        try {
            console.log(`[llm] trying groq with key ${keys.groqKey.substring(0, 8)}...`);
            llm = await callGroqAPI(prompt, keys.groqKey);
        } catch (err) {
            console.error("Groq API error:", err.message);
            errors.push(`Groq: ${err.message}`);
        }
    }

    // fall back to Gemini
    if (!llm && keys.geminiKey) {
        try {
            console.log("[llm] groq failed, falling back to gemini");
            llm = await callGeminiAPI(prompt, keys.geminiKey);
        } catch (err) {
            console.error("Gemini API error:", err.message);
            errors.push(`Gemini: ${err.message}`);
        }
    }

    if (!llm) {
        if (errors.length > 0) {
            llm_error = errors.join(" | ");
        } else {
            llm_error = "No API keys provided (set GROQ_API_KEY or GEMINI_API_KEY)";
        }
    }

    return { template, llm, llm_error };
}

async function callGroqAPI(prompt, apiKey) {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey });

    // try bigger model first, fall back to smaller ones if rate limited
    const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];

    let lastError = null;
    for (const modelName of MODELS) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a clinical pharmacogenomics expert. Respond with valid JSON only." },
                    { role: "user", content: prompt },
                ],
                model: modelName,
                temperature: 0.3,
                max_tokens: 1024,
                response_format: { type: "json_object" },
            });

            const text = completion.choices[0]?.message?.content?.trim();
            if (!text) throw new Error("Empty response from Groq");

            return parseLLMResponse(text, `groq/${modelName}`);
        } catch (err) {
            lastError = err;
            if (err.message && err.message.includes("429")) {
                console.log(`Rate limited on ${modelName}, trying next model...`);
                continue;
            }
            console.error(`Groq model ${modelName} failed:`, err.message);
        }
    }

    throw lastError || new Error("All Groq models failed");
}

async function callGeminiAPI(prompt, apiKey) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    const MODELS = ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-2.0-flash"];

    let lastError = null;
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            return parseLLMResponse(text, `gemini/${modelName}`);
        } catch (err) {
            lastError = err;
            console.error(`Gemini model ${modelName} failed:`, err.message);
        }
    }

    throw lastError || new Error("All Gemini models failed");
}

// fallback when no API keys are set
function generateTemplateExplanation(riskResult) {
    const { drug, pharmacogenomic_profile: profile, risk_assessment: risk, clinical_recommendation: rec, _riskExplanation } = riskResult;

    const gene = profile.primary_gene;
    const phenotype = profile.phenotype_label;
    const diplotype = profile.diplotype;
    const riskLabel = risk.risk_label;
    const severity = risk.severity;

    let summary = "";
    switch (riskLabel) {
        case "Safe":
            summary = `Based on your ${gene} genetic profile (${diplotype}, ${phenotype}), your body is expected to process ${drug} normally. No dosage adjustments are needed based on your genetic makeup.`;
            break;
        case "Adjust Dosage":
            summary = `Your ${gene} genetic profile (${diplotype}, ${phenotype}) suggests that your body processes ${drug} differently than average. A dosage adjustment may be needed to ensure the medication works safely and effectively for you.`;
            break;
        case "Toxic":
            summary = `⚠️ Your ${gene} genetic profile (${diplotype}, ${phenotype}) indicates a significantly elevated risk of toxicity with ${drug}. Your body may accumulate the drug or its active metabolites to dangerous levels. Immediate clinical action is recommended.`;
            break;
        case "Ineffective":
            summary = `Your ${gene} genetic profile (${diplotype}, ${phenotype}) suggests that ${drug} may not work effectively for you. Your body cannot adequately convert or utilize the medication. An alternative drug should be considered.`;
            break;
        default:
            summary = `Your ${gene} genetic profile could not be fully characterized for ${drug}. Consult your healthcare provider for personalized guidance.`;
    }

    const mechanism = rec.mechanism
        ? `${rec.mechanism} In your case, the ${diplotype} diplotype results in ${phenotype.toLowerCase()} activity. ${_riskExplanation || ""}`
        : _riskExplanation || "Mechanism details not available for this gene-drug combination.";

    const citations = CPIC_REFERENCES[gene] || [
        "Clinical Pharmacogenetics Implementation Consortium (CPIC) Guidelines. https://cpicpgx.org/guidelines/",
    ];

    const limitations = `This assessment is based on specific tested ${gene} variants and may not capture all possible genetic variations. Other factors including age, weight, liver/kidney function, concurrent medications, and epigenetics also influence drug response. This does not replace clinical judgment.`;

    return {
        summary,
        mechanism,
        clinical_significance: `Risk level: ${riskLabel} (${severity}). ${rec.recommendation}`,
        citations,
        limitations,
        model_used: "template-based (local knowledge base)",
        generated_at: new Date().toISOString(),
    };
}
