"use client";

import { useState, useRef, useCallback } from "react";

function PathwayDiagram({ steps }) {
    if (!steps || steps.length === 0) return null;
    return (
        <div className="pathway-diagram">
            {steps.map((step, i) => {
                const isEnzyme = i % 2 === 1;
                if (isEnzyme) {
                    return (
                        <div key={i} className="pathway-arrow">
                            <span className="arrow-line">↓</span>
                            {step && <span className="enzyme-label">{step}</span>}
                        </div>
                    );
                }
                return (
                    <div key={i} className="pathway-node">
                        <span className="node-text">{step}</span>
                    </div>
                );
            })}
        </div>
    );
}

// duplicated from pharmacoKB so we don't have to import server-side code in the client
const SUPPORTED_DRUGS = [
    { name: "CODEINE", gene: "CYP2D6", category: "Analgesic" },
    { name: "CLOPIDOGREL", gene: "CYP2C19", category: "Antiplatelet" },
    { name: "WARFARIN", gene: "CYP2C9", category: "Anticoagulant" },
    { name: "SIMVASTATIN", gene: "SLCO1B1", category: "Statin" },
    { name: "AZATHIOPRINE", gene: "TPMT", category: "Immunosuppressant" },
    { name: "FLUOROURACIL", gene: "DPYD", category: "Antineoplastic" },
    { name: "VORICONAZOLE", gene: "CYP2C19", category: "Antifungal" },
    { name: "CAPECITABINE", gene: "DPYD", category: "Antineoplastic" },
    { name: "MERCAPTOPURINE", gene: "TPMT", category: "Antineoplastic" },
];

function getRiskClass(label) {
    if (!label) return "unknown";
    const l = label.toLowerCase();
    if (l === "safe") return "safe";
    if (l === "adjust dosage") return "adjust";
    if (l === "toxic") return "toxic";
    if (l === "ineffective") return "ineffective";
    return "unknown";
}

function getRiskIcon(label) {
    const l = (label || "").toLowerCase();
    if (l === "safe") return "✅";
    if (l === "adjust dosage") return "⚠️";
    if (l === "toxic") return "🔴";
    if (l === "ineffective") return "⛔";
    return "❓";
}

export default function Home() {
    const [vcfFile, setVcfFile] = useState(null);
    const [selectedDrugs, setSelectedDrugs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});
    const [dragOver, setDragOver] = useState(false);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (!file) return;
        if (!file.name.endsWith(".vcf")) {
            setError({ message: "Invalid file format", details: "Please upload a .vcf file" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError({ message: "File too large", details: "Maximum file size is 5 MB" });
            return;
        }
        setVcfFile(file);
        setError(null);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setDragOver(false), []);

    const toggleDrug = useCallback((drugName) => {
        setSelectedDrugs((prev) =>
            prev.includes(drugName)
                ? prev.filter((d) => d !== drugName)
                : [...prev, drugName]
        );
    }, []);

    const runAnalysis = async () => {
        if (!vcfFile || selectedDrugs.length === 0) return;
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append("vcf", vcfFile);
            formData.append("drugs", selectedDrugs.join(","));

            const res = await fetch("/api/analyze", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) {
                setError({ message: data.error || "Analysis failed", details: data.details });
                return;
            }

            const resultArray = data.results || [data];
            setResults(resultArray);

            // expand all cards by default so user can see everything
            const expanded = {};
            resultArray.forEach((_, i) => { expanded[i] = true; });
            setExpandedCards(expanded);
        } catch (err) {
            setError({ message: "Network error", details: err.message });
        } finally {
            setLoading(false);
        }
    };

    const downloadJSON = () => {
        if (!results) return;
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sanjeevani_results_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyJSON = async () => {
        if (!results) return;
        await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleCard = (index) => {
        setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <main className="container">
            <button className="corner-logo-btn" onClick={() => window.location.reload()} title="Refresh">
                <img src="/sanjeevani-logo.png" alt="Sanjeevani" className="corner-logo" />
            </button>

            <section className="hero">
                <span className="hero-badge">
                    <span className="pulse"></span>
                </span>
                <h1>
                    <span className="gradient-text">Sanjeevani</span>
                    <br />
                    Pharmacogenomic Risk Prediction
                </h1>
                <p>
                    Upload your VCF file and select medications to receive AI-powered
                    pharmacogenomic risk assessments with CPIC-aligned clinical recommendations.
                </p>
            </section>

            <div className="upload-section">
                <div
                    className={`upload-zone glass-card ${dragOver ? "drag-over" : ""} ${vcfFile ? "has-file" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".vcf"
                        onChange={(e) => handleFile(e.target.files[0])}
                    />
                    <span className="icon">{vcfFile ? "📄" : "🧬"}</span>
                    <div className="title">
                        {vcfFile ? "File Selected" : "Upload VCF File"}
                    </div>
                    <div className="subtitle">
                        {vcfFile
                            ? null
                            : "Drag and drop or click to browse (.vcf, max 5MB)"}
                    </div>
                    {vcfFile && (
                        <div className="file-info">
                            ✓ {vcfFile.name} ({(vcfFile.size / 1024).toFixed(1)} KB)
                        </div>
                    )}
                </div>

                <div className="glass-card drug-section">
                    <label>💊 Select Medications</label>
                    <div className="drug-chips">
                        {SUPPORTED_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                className={`drug-chip ${selectedDrugs.includes(drug.name) ? "selected" : ""}`}
                                onClick={() => toggleDrug(drug.name)}
                            >
                                {drug.name}
                                <span className="gene-tag">{drug.gene}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            <button
                className="analyze-btn"
                onClick={runAnalysis}
                disabled={!vcfFile || selectedDrugs.length === 0 || loading}
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        Analyzing Pharmacogenomic Profile...
                    </>
                ) : (
                    <>🔬 Analyze Pharmacogenomic Risk</>
                )}
            </button>

            {error && (
                <div className="error-banner">
                    <span className="icon">⚠️</span>
                    <div>
                        <div className="message">{error.message}</div>
                        {error.details && <div className="details">{error.details}</div>}
                    </div>
                </div>
            )}

            {results && results.length > 0 && (
                <section className="results-section">
                    <div className="results-header">
                        <h2>📋 Analysis Results</h2>
                        <div className="results-actions">
                            <button className="action-btn" onClick={downloadJSON}>
                                ⬇ Download JSON
                            </button>
                            <button
                                className={`action-btn ${copied ? "copied" : ""}`}
                                onClick={copyJSON}
                            >
                                {copied ? "✓ Copied!" : "📋 Copy JSON"}
                            </button>
                        </div>
                    </div>

                    {results.map((result, index) => {
                        const riskClass = getRiskClass(result.risk_assessment?.risk_label);
                        const isExpanded = expandedCards[index];
                        const profile = result.pharmacogenomic_profile || {};
                        const rec = result.clinical_recommendation || {};
                        const templateExplanation = result.template_explanation || {};
                        const llmExplanation = result.llm_generated_explanation || {};
                        const metrics = result.quality_metrics || {};

                        return (
                            <div key={index} className={`risk-card ${riskClass}`}>
                                <div className="risk-card-header" onClick={() => toggleCard(index)}>
                                    <div className="risk-card-left">
                                        <span style={{ fontSize: "1.5rem" }}>{getRiskIcon(result.risk_assessment?.risk_label)}</span>
                                        <div>
                                            <div className="drug-title">{result.drug}</div>
                                            <div className="gene-label">
                                                {profile.primary_gene} • {profile.diplotype} • {profile.phenotype_label || profile.phenotype}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span className={`risk-badge ${riskClass}`}>
                                            {result.risk_assessment?.risk_label}
                                        </span>
                                        <span className={`severity-indicator ${result.risk_assessment?.severity || "unknown"}`}>
                                            {result.risk_assessment?.severity}
                                        </span>
                                        <span className={`card-toggle ${isExpanded ? "open" : ""}`}>▼</span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="risk-card-detail">
                                        <div className="detail-grid">
                                            <div className="detail-block">
                                                <h4>Pharmacogenomic Profile</h4>
                                                <div className="value">{profile.diplotype}</div>
                                                <div className="sub-value">
                                                    {profile.phenotype_label || profile.phenotype}
                                                    {profile.activity_score != null && ` • Activity Score: ${profile.activity_score}`}
                                                </div>
                                                <div className="sub-value">
                                                    Confidence: {((result.risk_assessment?.confidence_score || 0) * 100).toFixed(0)}%
                                                </div>
                                                <div className="confidence-bar">
                                                    <div
                                                        className="confidence-fill"
                                                        style={{ width: `${(result.risk_assessment?.confidence_score || 0) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="detail-block">
                                                <h4>Clinical Recommendation</h4>
                                                <div className="value">{rec.recommendation}</div>
                                                <div className="sub-value">
                                                    CPIC Level: {rec.cpic_guideline_level} • Source: {rec.source}
                                                </div>
                                            </div>

                                            <div className="detail-block">
                                                <h4>Metabolic Pathway</h4>
                                                <div className="value" style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                                                    {rec.pathway}
                                                </div>
                                            </div>
                                        </div>

                                        {profile.detected_variants && profile.detected_variants.length > 0 && (
                                            <div className="detail-block">
                                                <h4>Detected Variants</h4>
                                                <table className="variant-table">
                                                    <thead>
                                                        <tr>
                                                            <th>rsID</th>
                                                            <th>Star Allele</th>
                                                            <th>Zygosity</th>
                                                            <th>Function</th>
                                                            <th>Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {profile.detected_variants.map((v, vi) => (
                                                            <tr key={vi}>
                                                                <td style={{ fontFamily: "monospace", color: "var(--text-accent)" }}>{v.rsid}</td>
                                                                <td style={{ fontWeight: 600 }}>{v.star_allele}</td>
                                                                <td>{v.zygosity?.replace(/_/g, " ")}</td>
                                                                <td>{v.function?.replace(/_/g, " ")}</td>
                                                                <td>{v.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* template-based system analysis */}
                                        <div className="explanation-block">
                                            <h4>📋 System Analysis</h4>

                                            {templateExplanation.summary && (
                                                <div className="section">
                                                    <div className="section-title">Summary</div>
                                                    <div className="section-content">{templateExplanation.summary}</div>
                                                </div>
                                            )}

                                            {templateExplanation.mechanism && (
                                                <div className="section">
                                                    <div className="section-title">Biological Mechanism</div>
                                                    <div className="section-content">{templateExplanation.mechanism}</div>
                                                </div>
                                            )}

                                            {templateExplanation.clinical_significance && (
                                                <div className="section">
                                                    <div className="section-title">Clinical Significance</div>
                                                    <div className="section-content">{templateExplanation.clinical_significance}</div>
                                                </div>
                                            )}

                                            {templateExplanation.citations && templateExplanation.citations.length > 0 && (
                                                <div className="section">
                                                    <div className="section-title">References</div>
                                                    <ul className="citation-list">
                                                        {templateExplanation.citations.map((cite, ci) => (
                                                            <li key={ci}>{cite}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {templateExplanation.limitations && (
                                                <div className="section">
                                                    <div className="section-title">Limitations</div>
                                                    <div className="section-content" style={{ fontStyle: "italic", fontSize: "0.82rem" }}>
                                                        {templateExplanation.limitations}
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        {/* LLM explanation (when available) */}
                                        <div className="explanation-block" style={{ borderLeft: "3px solid var(--accent-primary, #7c3aed)" }}>
                                            <h4>🤖 AI Clinical Explanation</h4>

                                            {llmExplanation.error ? (
                                                <div className="section">
                                                    <div className="section-content" style={{ color: "var(--text-muted, #999)", fontStyle: "italic" }}>
                                                        ⚠️ AI explanation unavailable: {llmExplanation.error}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {llmExplanation.summary && (
                                                        <div className="section">
                                                            <div className="section-title">Summary</div>
                                                            <div className="section-content">{llmExplanation.summary}</div>
                                                        </div>
                                                    )}

                                                    {llmExplanation.pathway_steps && llmExplanation.pathway_steps.length > 0 && (
                                                        <div className="section">
                                                            <div className="section-title">Metabolic Pathway</div>
                                                            <PathwayDiagram steps={llmExplanation.pathway_steps} />
                                                        </div>
                                                    )}

                                                    {llmExplanation.clinical_significance && (
                                                        <div className="section">
                                                            <div className="section-title">Clinical Significance</div>
                                                            <div className="section-content">{llmExplanation.clinical_significance}</div>
                                                        </div>
                                                    )}

                                                    {llmExplanation.citations && llmExplanation.citations.length > 0 && (
                                                        <div className="section">
                                                            <div className="section-title">References</div>
                                                            <ul className="citation-list">
                                                                {llmExplanation.citations.map((cite, ci) => (
                                                                    <li key={ci}>{cite}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {llmExplanation.limitations && (
                                                        <div className="section">
                                                            <div className="section-title">Limitations</div>
                                                            <div className="section-content" style={{ fontStyle: "italic", fontSize: "0.82rem" }}>
                                                                {llmExplanation.limitations}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="detail-grid">
                                            <div className="detail-block">
                                                <h4>Quality Metrics</h4>
                                                <div className="sub-value">VCF Parsing: {metrics.vcf_parsing_success ? "✅ Success" : "❌ Failed"}</div>
                                                <div className="sub-value">Total Variants: {metrics.total_variants_parsed}</div>
                                                <div className="sub-value">PGx Variants: {metrics.pharmacogenomic_variants_found}</div>
                                                <div className="sub-value">Genes: {(metrics.genes_with_variants || []).join(", ") || "None"}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>
            )}

            <footer className="footer">
                <p>
                    Sanjeevani — AI-Powered Pharmacogenomic Risk Prediction System
                    <br />
                    Built with CPIC Guidelines • PharmGKB • PharmVar Standards
                    <br />
                    <span style={{ fontSize: "0.72rem" }}>
                        Disclaimer: This tool is for informational purposes only and does not replace professional medical advice.
                    </span>
                </p>
                <p className="footer-credit">Made with ❤️ by Team NextGen for RIFT&apos;26</p>
            </footer>
        </main>
    );
}
