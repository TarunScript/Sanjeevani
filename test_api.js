const fs = require('fs');

async function testCase(vcfContent, drug) {
    const formData = new FormData();
    formData.append("vcf", new Blob([vcfContent], { type: "text/vcf" }), "test.vcf");
    formData.append("drugs", drug);

    try {
        const res = await fetch("http://localhost:3000/api/analyze", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

const vcf1 = `##fileformat=VCFv4.2
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE
22\t1000\trs3892097\tC\tT\t.\t.\t.\tGT\t1/1`; // CYP2D6 *4 homozygous

const vcf2 = `##fileformat=VCFv4.2
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE
10\t2000\trs4244285\tG\tA\t.\t.\t.\tGT\t0/1`; // CYP2C19 *2 heterozygous

const vcf3 = `##fileformat=VCFv4.2
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE
12\t3000\trs4149056\tT\tC\t.\t.\t.\tGT\t1/1`; // SLCO1B1 *5 homozygous

async function run() {
    console.log("=== CASE 1: CODEINE (CYP2D6 PM) ===");
    const res1 = await testCase(vcf1, "CODEINE");
    console.log(JSON.stringify({
      template: res1?.template_explanation, 
      llm: res1?.llm_generated_explanation,
      risk: res1?.risk_assessment
    }, null, 2));

    console.log("\n=== CASE 2: CLOPIDOGREL (CYP2C19 IM) ===");
    const res2 = await testCase(vcf2, "CLOPIDOGREL");
    console.log(JSON.stringify({
      template: res2?.template_explanation, 
      llm: res2?.llm_generated_explanation,
      risk: res2?.risk_assessment
    }, null, 2));

    console.log("\n=== CASE 3: SIMVASTATIN (SLCO1B1 PM) ===");
    const res3 = await testCase(vcf3, "SIMVASTATIN");
    console.log(JSON.stringify({
      template: res3?.template_explanation, 
      llm: res3?.llm_generated_explanation,
      risk: res3?.risk_assessment
    }, null, 2));
}

run();
