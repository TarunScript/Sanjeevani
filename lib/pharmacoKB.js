// pharmacogenomic knowledge base
// sources: CPIC guidelines, PharmGKB, PharmVar

// rsID -> star allele mappings
export const GENE_VARIANT_MAP = {
    CYP2D6: {
        chromosome: "22",
        variants: {
            rs3892097: { allele: "*4", function: "no_function", activityValue: 0, description: "Splicing defect, no activity" },
            rs5030655: { allele: "*6", function: "no_function", activityValue: 0, description: "Frameshift deletion, no enzyme activity" },
            rs1065852: { allele: "*10", function: "decreased_function", activityValue: 0.25, description: "Pro34Ser, unstable enzyme, decreased activity" },
            rs16947: { allele: "*2", function: "normal_function", activityValue: 1, description: "Arg296Cys, normal activity" },
            rs28371725: { allele: "*41", function: "decreased_function", activityValue: 0.5, description: "Splicing defect, decreased activity" },
            rs28371706: { allele: "*17", function: "decreased_function", activityValue: 0.5, description: "Thr107Ile" },
            rs35742686: { allele: "*3", function: "no_function", activityValue: 0, description: "Frameshift, no enzyme activity" },
            rs5030656: { allele: "*9", function: "decreased_function", activityValue: 0.5, description: "Deletion, decreased activity" },
            rs1135840: { allele: "*2", function: "normal_function", activityValue: 1, description: "Ser486Thr, normal activity" },
        },
        defaultAllele: { allele: "*1", function: "normal_function", activityValue: 1, description: "Wild-type, normal enzyme activity" }
    },

    CYP2C19: {
        chromosome: "10",
        variants: {
            rs4244285: { allele: "*2", function: "no_function", activityValue: 0, description: "Splicing defect (c.681G>A), no enzyme activity" },
            rs4986893: { allele: "*3", function: "no_function", activityValue: 0, description: "Premature stop codon (c.636G>A), no enzyme" },
            rs12248560: { allele: "*17", function: "increased_function", activityValue: 1.5, description: "Enhanced transcription (c.-806C>T), increased activity" },
            rs28399504: { allele: "*4", function: "no_function", activityValue: 0, description: "Initiation codon variant, no enzyme activity" },
            rs56337013: { allele: "*5", function: "no_function", activityValue: 0, description: "c.1297C>T, no enzyme activity" },
            rs72552267: { allele: "*6", function: "no_function", activityValue: 0, description: "c.395G>A, no enzyme activity" },
            rs72558186: { allele: "*7", function: "no_function", activityValue: 0, description: "Splicing defect, no enzyme activity" },
            rs41291556: { allele: "*8", function: "no_function", activityValue: 0, description: "c.358T>C, no enzyme activity" },
        },
        defaultAllele: { allele: "*1", function: "normal_function", activityValue: 1, description: "Wild-type, normal enzyme activity" }
    },

    CYP2C9: {
        chromosome: "10",
        variants: {
            rs1799853: { allele: "*2", function: "decreased_function", activityValue: 0.5, description: "Arg144Cys, ~12% reduced metabolism" },
            rs1057910: { allele: "*3", function: "decreased_function", activityValue: 0.25, description: "Ile359Leu, ~77% reduced metabolism" },
            rs7900194: { allele: "*8", function: "decreased_function", activityValue: 0.25, description: "Arg150His, decreased activity" },
            rs9332131: { allele: "*6", function: "no_function", activityValue: 0, description: "Frameshift, no enzyme activity" },
            rs28371686: { allele: "*5", function: "no_function", activityValue: 0, description: "Asp360Glu, no enzyme" },
            rs56165452: { allele: "*11", function: "decreased_function", activityValue: 0.5, description: "Arg335Trp, decreased activity" },
        },
        defaultAllele: { allele: "*1", function: "normal_function", activityValue: 1, description: "Wild-type, normal enzyme activity" }
    },

    SLCO1B1: {
        chromosome: "12",
        variants: {
            rs4149056: { allele: "*5", function: "decreased_function", activityValue: 0.25, description: "Val174Ala (c.521T>C), impaired hepatic uptake transport" },
            rs2306283: { allele: "*1b", function: "normal_function", activityValue: 1, description: "Asn130Asp, normal function" },
        },
        defaultAllele: { allele: "*1a", function: "normal_function", activityValue: 1, description: "Wild-type, normal transport function" }
    },

    TPMT: {
        chromosome: "6",
        variants: {
            rs1800462: { allele: "*2", function: "no_function", activityValue: 0, description: "Ala80Pro, no TPMT enzyme activity" },
            rs1800460: { allele: "*3B", function: "no_function", activityValue: 0, description: "Ala154Thr, no enzyme activity (component of *3A)" },
            rs1142345: { allele: "*3C", function: "no_function", activityValue: 0, description: "Tyr240Cys, no enzyme activity (component of *3A)" },
        },
        defaultAllele: { allele: "*1", function: "normal_function", activityValue: 1, description: "Wild-type, normal TPMT activity" }
    },

    DPYD: {
        chromosome: "1",
        variants: {
            rs3918290: { allele: "*2A", function: "no_function", activityValue: 0, description: "IVS14+1G>A, exon 14 skipping, no DPD activity" },
            rs55886062: { allele: "*13", function: "no_function", activityValue: 0, description: "Ile560Ser, no DPD enzyme activity" },
            rs67376798: { allele: "c.2846A>T", function: "decreased_function", activityValue: 0.5, description: "Asp949Val, decreased DPD activity" },
            rs75017182: { allele: "HapB3", function: "decreased_function", activityValue: 0.5, description: "c.1129-5923C>G, decreased DPD activity via splicing" },
        },
        defaultAllele: { allele: "*1", function: "normal_function", activityValue: 1, description: "Wild-type, normal DPD activity" }
    },
};


// drug -> gene mapping with mechanism info
export const DRUG_GENE_MAP = {
    CODEINE: {
        gene: "CYP2D6", mechanism: "CYP2D6 converts codeine to morphine (active metabolite). Variation affects morphine formation.",
        pathway: "Codeine → (CYP2D6) → Morphine → (UGT2B7) → Morphine-6-glucuronide → μ-opioid receptor activation"
    },
    CLOPIDOGREL: {
        gene: "CYP2C19", mechanism: "CYP2C19 converts clopidogrel (prodrug) to active thiol metabolite. Variation affects platelet inhibition.",
        pathway: "Clopidogrel → (CYP2C19 + CYP3A4) → Active Thiol Metabolite → irreversible P2Y12 receptor blockade → platelet inhibition"
    },
    WARFARIN: {
        gene: "CYP2C9", mechanism: "CYP2C9 metabolizes S-warfarin (more potent enantiomer). Variation affects warfarin clearance and bleeding risk.",
        pathway: "S-Warfarin → (CYP2C9) → inactive metabolites. VKORC1 is the drug target for vitamin K-dependent clotting factor synthesis"
    },
    SIMVASTATIN: {
        gene: "SLCO1B1", mechanism: "SLCO1B1 transporter mediates hepatic uptake of simvastatin acid. Variation increases systemic exposure and myopathy risk.",
        pathway: "Simvastatin → (hydrolysis) → Simvastatin acid → (SLCO1B1) → hepatic uptake → HMG-CoA reductase inhibition"
    },
    AZATHIOPRINE: {
        gene: "TPMT", mechanism: "TPMT methylates thiopurine metabolites. Reduced TPMT activity leads to accumulation of cytotoxic TGN metabolites.",
        pathway: "Azathioprine → 6-MP → (TPMT) → methylated metabolites (inactive) OR → (HGPRT) → 6-TGN (cytotoxic)"
    },
    FLUOROURACIL: {
        gene: "DPYD", mechanism: "DPD (encoded by DPYD) catabolizes >80% of 5-FU. Reduced DPD activity causes severe/fatal toxicity from drug accumulation.",
        pathway: "5-Fluorouracil → (DPD/DPYD) → inactive DHFU (80% of dose) OR → FdUMP → thymidylate synthase inhibition (cytotoxic)"
    },
    "5-FU": {
        gene: "DPYD", mechanism: "DPD (encoded by DPYD) catabolizes >80% of 5-FU. Reduced DPD activity causes severe/fatal toxicity.",
        pathway: "5-Fluorouracil → (DPD/DPYD) → inactive DHFU (80% of dose)"
    },
    CAPECITABINE: {
        gene: "DPYD", mechanism: "Capecitabine is a prodrug of 5-FU. Same DPYD-dependent catabolism applies.",
        pathway: "Capecitabine → 5'-DFUR → 5-FU → (DPD/DPYD) → inactive DHFU"
    },
    MERCAPTOPURINE: {
        gene: "TPMT", mechanism: "TPMT methylates 6-MP metabolites. Same pathway as azathioprine.",
        pathway: "6-Mercaptopurine → (TPMT) → methylated metabolites (inactive) OR → (HGPRT) → 6-TGN (cytotoxic)"
    },
    THIOGUANINE: {
        gene: "TPMT", mechanism: "TPMT methylates thioguanine metabolites. Same pathway as azathioprine.",
        pathway: "Thioguanine → (TPMT) → methylated metabolites (inactive) OR → (HGPRT) → 6-TGN (cytotoxic)"
    },
    VORICONAZOLE: {
        gene: "CYP2C19", mechanism: "CYP2C19 is the primary metabolizer of voriconazole. Variation affects serum concentrations.",
        pathway: "Voriconazole → (CYP2C19 primarily + CYP3A4/CYP2C9) → inactive metabolites"
    },
};


/*
 * Phenotype classification based on CPIC activity score thresholds.
 * ref: Caudle et al 2017
 */
export function classifyPhenotype(gene, activityScore) {
    // SLCO1B1 uses transport-function terms instead of metabolizer
    if (gene === "SLCO1B1") {
        if (activityScore <= 0.25) return { phenotype: "Poor Function", code: "PM", label: "Poor Function" };
        if (activityScore <= 1) return { phenotype: "Decreased Function", code: "IM", label: "Decreased Function" };
        return { phenotype: "Normal Function", code: "NM", label: "Normal Function" };
    }

    if (activityScore === 0) {
        return { phenotype: "Poor Metabolizer", code: "PM", label: "Poor Metabolizer (PM)" };
    } else if (activityScore > 0 && activityScore <= 1) {
        return { phenotype: "Intermediate Metabolizer", code: "IM", label: "Intermediate Metabolizer (IM)" };
    } else if (activityScore > 1 && activityScore <= 2.25) {
        return { phenotype: "Normal Metabolizer", code: "NM", label: "Normal Metabolizer (NM)" };
    } else {
        // CYP2C19 distinguishes RM from URM
        if (gene === "CYP2C19" && activityScore <= 2.5) {
            return { phenotype: "Rapid Metabolizer", code: "RM", label: "Rapid Metabolizer (RM)" };
        }
        return { phenotype: "Ultrarapid Metabolizer", code: "URM", label: "Ultrarapid Metabolizer (URM)" };
    }
}


// risk lookup
export const RISK_MATRIX = {
    CODEINE: {
        PM: { risk: "Ineffective", severity: "high", explanation: "CYP2D6 PM cannot convert codeine to morphine. No analgesic effect expected." },
        IM: { risk: "Adjust Dosage", severity: "moderate", explanation: "CYP2D6 IM produces less morphine from codeine. Reduced analgesic effect." },
        NM: { risk: "Safe", severity: "none", explanation: "Normal CYP2D6 metabolism. Standard codeine response expected." },
        RM: { risk: "Toxic", severity: "high", explanation: "Rapid CYP2D6 metabolism produces excess morphine. Risk of respiratory depression." },
        URM: { risk: "Toxic", severity: "critical", explanation: "Ultrarapid CYP2D6 converts codeine to morphine very rapidly. Life-threatening toxicity risk, especially in children and breastfeeding mothers." },
    },
    CLOPIDOGREL: {
        PM: { risk: "Ineffective", severity: "critical", explanation: "CYP2C19 PM cannot activate clopidogrel. High risk of cardiovascular events (stent thrombosis)." },
        IM: { risk: "Adjust Dosage", severity: "high", explanation: "CYP2C19 IM has reduced clopidogrel activation. Increased cardiovascular risk." },
        NM: { risk: "Safe", severity: "none", explanation: "Normal CYP2C19 metabolism. Standard clopidogrel response." },
        RM: { risk: "Safe", severity: "none", explanation: "Rapid CYP2C19 metabolism. Adequate clopidogrel activation." },
        URM: { risk: "Safe", severity: "none", explanation: "Ultrarapid CYP2C19 metabolism. No dosage adjustment needed." },
    },
    WARFARIN: {
        PM: { risk: "Toxic", severity: "critical", explanation: "CYP2C9 PM has severely reduced S-warfarin clearance. High bleeding risk. Requires 50-80% dose reduction." },
        IM: { risk: "Adjust Dosage", severity: "high", explanation: "CYP2C9 IM has reduced warfarin metabolism. Requires 20-40% dose reduction." },
        NM: { risk: "Safe", severity: "none", explanation: "Normal CYP2C9 metabolism. Standard warfarin dosing algorithm." },
        RM: { risk: "Safe", severity: "none", explanation: "Normal warfarin metabolism." },
        URM: { risk: "Safe", severity: "none", explanation: "Normal warfarin metabolism." },
    },
    SIMVASTATIN: {
        PM: { risk: "Toxic", severity: "critical", explanation: "SLCO1B1 poor function: greatly increased simvastatin systemic exposure. High risk of rhabdomyolysis/myopathy." },
        IM: { risk: "Adjust Dosage", severity: "high", explanation: "SLCO1B1 decreased function (rs4149056 TC): ~3x increased myopathy risk. Use ≤20mg or alternative statin." },
        NM: { risk: "Safe", severity: "none", explanation: "Normal SLCO1B1 transport function. Standard simvastatin dosing." },
        RM: { risk: "Safe", severity: "none", explanation: "Normal statin transport." },
        URM: { risk: "Safe", severity: "none", explanation: "Normal statin transport." },
    },
    AZATHIOPRINE: {
        PM: { risk: "Toxic", severity: "critical", explanation: "TPMT PM: massive accumulation of cytotoxic TGN metabolites. Fatal myelosuppression risk. Start at 10% dose if non-malignant." },
        IM: { risk: "Adjust Dosage", severity: "high", explanation: "TPMT IM: elevated TGN levels. Start at 30-80% dose with TGN monitoring." },
        NM: { risk: "Safe", severity: "none", explanation: "Normal TPMT activity. Standard azathioprine dosing." },
        RM: { risk: "Safe", severity: "none", explanation: "Normal thiopurine metabolism." },
        URM: { risk: "Safe", severity: "none", explanation: "Normal thiopurine metabolism." },
    },
    FLUOROURACIL: {
        PM: { risk: "Toxic", severity: "critical", explanation: "DPYD PM (DPD deficient): <80% of 5-FU cannot be catabolized. Fatal toxicity risk (mucositis, neutropenia, neurotoxicity). Avoid entirely or use ≤25% dose." },
        IM: { risk: "Adjust Dosage", severity: "high", explanation: "DPYD IM (partial DPD deficiency): reduced 5-FU clearance. Start at 25-50% dose with TDM." },
        NM: { risk: "Safe", severity: "none", explanation: "Normal DPD activity. Standard fluoropyrimidine dosing." },
        RM: { risk: "Safe", severity: "none", explanation: "Normal 5-FU catabolism." },
        URM: { risk: "Safe", severity: "none", explanation: "Normal 5-FU catabolism." },
    },
};

// aliases
RISK_MATRIX["5-FU"] = RISK_MATRIX.FLUOROURACIL;
RISK_MATRIX["5-FLUOROURACIL"] = RISK_MATRIX.FLUOROURACIL;
RISK_MATRIX.CAPECITABINE = RISK_MATRIX.FLUOROURACIL;
RISK_MATRIX.MERCAPTOPURINE = RISK_MATRIX.AZATHIOPRINE;
RISK_MATRIX.THIOGUANINE = RISK_MATRIX.AZATHIOPRINE;
RISK_MATRIX.VORICONAZOLE = {
    PM: { risk: "Toxic", severity: "high", explanation: "CYP2C19 PM: elevated voriconazole trough concentrations. Risk of hepatotoxicity and neurotoxicity. Use alternative antifungal." },
    IM: { risk: "Adjust Dosage", severity: "moderate", explanation: "CYP2C19 IM: higher voriconazole trough levels. Standard dosing with TDM." },
    NM: { risk: "Safe", severity: "none", explanation: "Normal CYP2C19 metabolism. Standard voriconazole dosing with TDM." },
    RM: { risk: "Ineffective", severity: "high", explanation: "CYP2C19 RM: subtherapeutic voriconazole levels. Risk of treatment failure. Use alternative antifungal." },
    URM: { risk: "Ineffective", severity: "critical", explanation: "CYP2C19 URM: very low voriconazole levels. High risk of antifungal treatment failure. Use alternative agent." },
};


// CPIC dosing recs pulled from the guideline papers
export const DOSING_RECOMMENDATIONS = {
    CODEINE: {
        PM: { action: "AVOID", recommendation: "Avoid codeine. Use non-tramadol, non-opioid analgesics (e.g., NSAIDs, acetaminophen, or non-codeine opioid not metabolized by CYP2D6).", cpicLevel: "Strong", source: "CPIC Guideline for CYP2D6 and Codeine Therapy (Crews et al.)" },
        IM: { action: "CAUTION", recommendation: "Use codeine with caution. If inadequate pain relief, consider alternative analgesics not metabolized by CYP2D6. Monitor for efficacy.", cpicLevel: "Moderate", source: "CPIC Guideline for CYP2D6 and Codeine Therapy" },
        NM: { action: "STANDARD", recommendation: "Use label-recommended age-appropriate or weight-appropriate codeine dose.", cpicLevel: "Strong", source: "CPIC Guideline for CYP2D6 and Codeine Therapy" },
        RM: { action: "AVOID", recommendation: "Avoid codeine due to potential for toxicity. Use non-tramadol, non-opioid analgesics.", cpicLevel: "Strong", source: "CPIC Guideline for CYP2D6 and Codeine Therapy" },
        URM: { action: "AVOID", recommendation: "Avoid codeine due to risk of life-threatening toxicity from rapid morphine formation. Particularly dangerous in breastfeeding mothers and children. Use non-tramadol, non-opioid analgesics.", cpicLevel: "Strong", source: "CPIC Guideline for CYP2D6 and Codeine Therapy" },
    },
    CLOPIDOGREL: {
        PM: { action: "ALTER_DRUG", recommendation: "Use alternative antiplatelet therapy: prasugrel or ticagrelor (not affected by CYP2C19). If PCI patient, this is particularly critical.", cpicLevel: "Strong", source: "CPIC Guideline for CYP2C19 and Clopidogrel Therapy (Scott et al.)" },
        IM: { action: "ALTER_DRUG", recommendation: "Use alternative antiplatelet therapy (prasugrel, ticagrelor) if ACS/PCI patient. For other cardiovascular conditions, consider alternative or standard dose with platelet function testing.", cpicLevel: "Moderate", source: "CPIC Guideline for CYP2C19 and Clopidogrel Therapy" },
        NM: { action: "STANDARD", recommendation: "Use standard clopidogrel dosing (75 mg/day maintenance after loading dose).", cpicLevel: "Strong", source: "CPIC Guideline for CYP2C19 and Clopidogrel Therapy" },
        RM: { action: "STANDARD", recommendation: "Use standard clopidogrel dosing.", cpicLevel: "Strong", source: "CPIC Guideline for CYP2C19 and Clopidogrel Therapy" },
        URM: { action: "STANDARD", recommendation: "Use standard clopidogrel dosing.", cpicLevel: "Moderate", source: "CPIC Guideline for CYP2C19 and Clopidogrel Therapy" },
    },
    WARFARIN: {
        PM: { action: "REDUCE_DOSE", recommendation: "Reduce initial warfarin dose by 50-80% compared to standard algorithm. Use pharmacogenomic dosing algorithm incorporating CYP2C9 and VKORC1. Monitor INR closely.", cpicLevel: "Strong", source: "CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing (Johnson et al.)" },
        IM: { action: "REDUCE_DOSE", recommendation: "Reduce initial warfarin dose by 20-40%. Use pharmacogenomic dosing algorithm. Frequent INR monitoring recommended.", cpicLevel: "Moderate", source: "CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing" },
        NM: { action: "STANDARD", recommendation: "Use standard pharmacogenomic or clinical warfarin dosing algorithm.", cpicLevel: "Strong", source: "CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing" },
        RM: { action: "STANDARD", recommendation: "Standard warfarin dosing.", cpicLevel: "Strong", source: "CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing" },
        URM: { action: "STANDARD", recommendation: "Standard warfarin dosing.", cpicLevel: "Strong", source: "CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing" },
    },
    SIMVASTATIN: {
        PM: { action: "ALTER_DRUG", recommendation: "Avoid simvastatin. Prescribe an alternative statin (e.g., pravastatin, rosuvastatin) that is not dependent on SLCO1B1 transport. If simvastatin is necessary, use ≤20 mg/day.", cpicLevel: "Strong", source: "CPIC Guideline for SLCO1B1 and Simvastatin (Wilke et al.)" },
        IM: { action: "REDUCE_DOSE", recommendation: "Prescribe a lower dose of simvastatin (≤20 mg/day) or use an alternative statin (pravastatin, rosuvastatin). Consider CK level monitoring.", cpicLevel: "Strong", source: "CPIC Guideline for SLCO1B1 and Simvastatin" },
        NM: { action: "STANDARD", recommendation: "Use standard simvastatin dosing per lipid guidelines.", cpicLevel: "Strong", source: "CPIC Guideline for SLCO1B1 and Simvastatin" },
        RM: { action: "STANDARD", recommendation: "Standard dosing.", cpicLevel: "Strong", source: "CPIC Guideline for SLCO1B1 and Simvastatin" },
        URM: { action: "STANDARD", recommendation: "Standard dosing.", cpicLevel: "Strong", source: "CPIC Guideline for SLCO1B1 and Simvastatin" },
    },
    AZATHIOPRINE: {
        PM: { action: "DRASTICALLY_REDUCE", recommendation: "If non-malignant condition: start at 10 mg/m²/day (10% of standard dose), 3×/week. If malignant condition: start at 25-50% dose reduction with rigorous TGN monitoring. Adjust based on degree of myelosuppression and TGN levels.", cpicLevel: "Strong", source: "CPIC Guideline for TPMT/NUDT15 and Thiopurines (Relling et al.)" },
        IM: { action: "REDUCE_DOSE", recommendation: "Start at 30-80% of standard dose. Titrate based on tolerance and TGN monitoring. Allow 2-4 weeks to reach steady state.", cpicLevel: "Strong", source: "CPIC Guideline for TPMT/NUDT15 and Thiopurines" },
        NM: { action: "STANDARD", recommendation: "Use standard starting dose (e.g., 2-3 mg/kg/day). Adjust per disease-specific protocol.", cpicLevel: "Strong", source: "CPIC Guideline for TPMT/NUDT15 and Thiopurines" },
        RM: { action: "STANDARD", recommendation: "Start at standard dose.", cpicLevel: "Moderate", source: "CPIC Guideline for TPMT/NUDT15 and Thiopurines" },
        URM: { action: "STANDARD", recommendation: "Start at standard dose.", cpicLevel: "Moderate", source: "CPIC Guideline for TPMT/NUDT15 and Thiopurines" },
    },
    FLUOROURACIL: {
        PM: { action: "AVOID", recommendation: "Avoid fluoropyrimidines entirely if DPD deficient (activity score 0). If strongly indicated and no alternatives, use ≤25% of standard dose with intensive TDM and hospitalization for monitoring.", cpicLevel: "Strong", source: "CPIC Guideline for DPYD and Fluoropyrimidines (Amstutz et al.)" },
        IM: { action: "REDUCE_DOSE", recommendation: "Start at 25-50% of standard dose based on activity score. Titrate upward with therapeutic drug monitoring (TDM). Allow 2 cycles to assess toxicity.", cpicLevel: "Strong", source: "CPIC Guideline for DPYD and Fluoropyrimidines" },
        NM: { action: "STANDARD", recommendation: "Use standard fluoropyrimidine dosing per protocol.", cpicLevel: "Strong", source: "CPIC Guideline for DPYD and Fluoropyrimidines" },
        RM: { action: "STANDARD", recommendation: "Standard dosing.", cpicLevel: "Strong", source: "CPIC Guideline for DPYD and Fluoropyrimidines" },
        URM: { action: "STANDARD", recommendation: "Standard dosing.", cpicLevel: "Strong", source: "CPIC Guideline for DPYD and Fluoropyrimidines" },
    },
};

DOSING_RECOMMENDATIONS["5-FU"] = DOSING_RECOMMENDATIONS.FLUOROURACIL;
DOSING_RECOMMENDATIONS["5-FLUOROURACIL"] = DOSING_RECOMMENDATIONS.FLUOROURACIL;
DOSING_RECOMMENDATIONS.CAPECITABINE = DOSING_RECOMMENDATIONS.FLUOROURACIL;
DOSING_RECOMMENDATIONS.MERCAPTOPURINE = DOSING_RECOMMENDATIONS.AZATHIOPRINE;
DOSING_RECOMMENDATIONS.THIOGUANINE = DOSING_RECOMMENDATIONS.AZATHIOPRINE;
DOSING_RECOMMENDATIONS.VORICONAZOLE = {
    PM: { action: "ALTER_DRUG", recommendation: "Choose an alternative antifungal agent not dependent on CYP2C19 (e.g., isavuconazole, liposomal amphotericin B, posaconazole). If voriconazole necessary, use lower dose with meticulous TDM.", cpicLevel: "Moderate", source: "CPIC Guideline for CYP2C19 and Voriconazole (Moriyama et al.)" },
    IM: { action: "STANDARD", recommendation: "Initiate standard dosing with therapeutic drug monitoring.", cpicLevel: "Moderate", source: "CPIC Guideline for CYP2C19 and Voriconazole" },
    NM: { action: "STANDARD", recommendation: "Initiate therapy with recommended standard of care dosing.", cpicLevel: "Strong", source: "CPIC Guideline for CYP2C19 and Voriconazole" },
    RM: { action: "ALTER_DRUG", recommendation: "Choose alternative antifungal agent not dependent on CYP2C19 (isavuconazole, liposomal amphotericin B, posaconazole).", cpicLevel: "Moderate", source: "CPIC Guideline for CYP2C19 and Voriconazole" },
    URM: { action: "ALTER_DRUG", recommendation: "Choose alternative antifungal agent. Probability of attaining therapeutic voriconazole concentrations is very low.", cpicLevel: "Moderate", source: "CPIC Guideline for CYP2C19 and Voriconazole" },
};


// references for citations
// TODO: should probably also add PharmVar refs here
export const CPIC_REFERENCES = {
    CYP2D6: [
        "Crews KR, Gaedigk A, Dunnenberger HM, et al. Clinical Pharmacogenetics Implementation Consortium (CPIC) Guidelines for Codeine Therapy in the Context of Cytochrome P450 2D6 (CYP2D6) Genotype. Clin Pharmacol Ther. 2012;91(2):321-326.",
        "PharmGKB. CYP2D6 Drug-Gene Interaction Summaries. https://www.pharmgkb.org/gene/PA128",
    ],
    CYP2C19: [
        "Scott SA, Sangkuhl K, Stein CM, et al. Clinical Pharmacogenetics Implementation Consortium Guidelines for CYP2C19 Genotype and Clopidogrel Therapy: 2013 Update. Clin Pharmacol Ther. 2013;94(3):317-323.",
        "Moriyama B, et al. CPIC Guideline for CYP2C19 and Voriconazole Therapy. Clin Pharmacol Ther. 2017;102(1):45-51.",
    ],
    CYP2C9: [
        "Johnson JA, Caudle KE, Gong L, et al. Clinical Pharmacogenetics Implementation Consortium (CPIC) Guideline for Pharmacogenetics-Guided Warfarin Dosing: 2017 Update. Clin Pharmacol Ther. 2017;102(3):397-404.",
    ],
    SLCO1B1: [
        "Wilke RA, Ramsey LB, Johnson SG, et al. The Clinical Pharmacogenomics Implementation Consortium: CPIC Guideline for SLCO1B1 and Simvastatin-Induced Myopathy. Clin Pharmacol Ther. 2012;92(1):112-117.",
    ],
    TPMT: [
        "Relling MV, Schwab M, Whirl-Carrillo M, et al. Clinical Pharmacogenetics Implementation Consortium Guideline for Thiopurine Dosing Based on TPMT and NUDT15 Genotypes: 2018 Update. Clin Pharmacol Ther. 2019;105(5):1095-1105.",
    ],
    DPYD: [
        "Amstutz U, Henricks LM, Offer SM, et al. Clinical Pharmacogenetics Implementation Consortium (CPIC) Guideline for Dihydropyrimidine Dehydrogenase Genotype and Fluoropyrimidine Dosing: 2017 Update. Clin Pharmacol Ther. 2018;103(2):210-216.",
    ],
};


export const SUPPORTED_DRUGS = [
    { name: "CODEINE", gene: "CYP2D6", category: "Analgesic (Opioid)" },
    { name: "CLOPIDOGREL", gene: "CYP2C19", category: "Antiplatelet" },
    { name: "WARFARIN", gene: "CYP2C9", category: "Anticoagulant" },
    { name: "SIMVASTATIN", gene: "SLCO1B1", category: "Statin (Lipid-lowering)" },
    { name: "AZATHIOPRINE", gene: "TPMT", category: "Immunosuppressant (Thiopurine)" },
    { name: "FLUOROURACIL", gene: "DPYD", category: "Antineoplastic (Fluoropyrimidine)" },
    { name: "VORICONAZOLE", gene: "CYP2C19", category: "Antifungal (Triazole)" },
    { name: "CAPECITABINE", gene: "DPYD", category: "Antineoplastic (Fluoropyrimidine)" },
    { name: "MERCAPTOPURINE", gene: "TPMT", category: "Antineoplastic (Thiopurine)" },
];

export function normalizeDrugName(name) {
    return name.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function isDrugSupported(drugName) {
    const normalized = normalizeDrugName(drugName);
    return normalized in DRUG_GENE_MAP;
}
