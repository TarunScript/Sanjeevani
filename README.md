<p align="center">
  <img src="logo/Sanjeevani%20logo.png" alt="Sanjeevani Logo" width="180"/>
</p>

# Sanjeevani

**AI-Powered Pharmacogenomic Risk Prediction System**

Upload a patient's VCF file → Select medications → Get instant pharmacogenomic risk assessments with CPIC-aligned clinical recommendations.

Built for **RIFT'26** by Team NextGen.

---

## What problem does this solve?

Adverse Drug Reactions (ADRs) cause ~100,000 deaths/year in the US — 4th leading cause of death. Up to 95% are predictable through pharmacogenomic testing, but most prescriptions still follow a one-size-fits-all approach.

Sanjeevani combines genomic variant analysis with AI-powered clinical reasoning to deliver personalized drug safety assessments.

## How it works

You upload a VCF file (standard genetic sequencing output), pick the medications, and the system runs a multi-step pipeline:

1. Parses VCF, extracts genotypes at pharmacogenomically relevant positions
2. Maps variants to star alleles (e.g. `rs3892097` → `CYP2D6*4`)
3. Builds diplotype, sums activity scores, classifies metabolizer phenotype
4. Maps phenotype to CPIC-aligned risk label with dosing recommendations
5. Sends profile to Groq (LLaMA 3.3 70B) for a patient-friendly explanation

## Supported drugs

| Drug | Gene | Category |
|------|------|----------|
| Codeine | CYP2D6 | Analgesic |
| Clopidogrel | CYP2C19 | Antiplatelet |
| Warfarin | CYP2C9 | Anticoagulant |
| Simvastatin | SLCO1B1 | Statin |
| Azathioprine | TPMT | Immunosuppressant |
| Mercaptopurine | TPMT | Antineoplastic |
| Fluorouracil | DPYD | Antineoplastic |
| Capecitabine | DPYD | Antineoplastic |
| Voriconazole | CYP2C19 | Antifungal |

## Tech stack

- **Frontend**: React 18, Next.js 14, Vanilla CSS
- **Backend**: Next.js API Routes
- **AI/LLM**: Groq SDK (LLaMA 3.3), Google Gemini as fallback
- **Genomics**: Custom VCF parser, CPIC-based knowledge base

## Setup

Needs Node.js 18+ and a Groq API key (free at [console.groq.com](https://console.groq.com)).

```bash
git clone <repo-url>
cd sanjeevani
npm install
cp .env.example .env.local
# add your GROQ_API_KEY in .env.local
npm run dev
```

Open http://localhost:3000.

There are sample VCF files in `public/` you can use to test — different metabolizer phenotypes for each gene.

## API

**POST /api/analyze** — upload VCF + drug list, get structured risk assessments back.
**GET /api/analyze** — health check, returns supported drugs/genes.

## Research

Knowledge base is built from CPIC guideline papers (Crews, Scott, Johnson, Wilke, Relling, Amstutz, Moriyama et al.) plus PharmGKB and PharmVar.

## Disclaimer

> For informational and educational purposes only. Does not replace professional medical advice.

---

Made with ❤️ by Team NextGen
