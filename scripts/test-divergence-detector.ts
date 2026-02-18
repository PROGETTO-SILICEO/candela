
import { callGeminiRaw } from '../lib/gemini';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testDivergenceDetector() {
    console.log("🧠 Testing Semantic Divergence Detector...");

    // CASE 1: Hidden Divergence (Verdict match, Reasoning conflict)
    // Both say "FALSE", but for opposite reasons.
    const reasoningA = "La notizia è FALSA perché Trump è attualmente il Presidente in carica, non si è dimesso.";
    const reasoningB = "La notizia è FALSA perché Trump non è più Presidente dal 2021, quindi non può dimettersi.";

    const prompt = `
CONFRONTA QUESTI DUE RAGIONAMENTI SULLO STESSO FATTO.
Le due AI sono d'accordo o partono da premesse di realtà opposte?

RAGIONAMENTO NOVA: "${reasoningA}"
RAGIONAMENTO GEMINI: "${reasoningB}"

Rispondi SOLO con: "COMPATIBILI" oppure "DIVERGENTI"
Se una dice "X è vero" e l'altra "X è falso", rispondi DIVERGENTI.
Se una dice "Falso per motivo A" e l'altra "Falso per motivo opposto B", rispondi DIVERGENTI.
`;

    console.log("\n--- TEST CASE 1: Hidden Divergence ---");
    const result1 = await callGeminiRaw(prompt);
    console.log("Result:", result1.trim());

    if (result1.includes("DIVERGENTI")) {
        console.log("✅ SUCCESS: Detected Hidden Divergence.");
    } else {
        console.log("❌ FAILURE: Failed to detect divergence.");
    }

    // CASE 2: Compatibility
    const reasoningC = "La notizia è FALSA perché non ci sono prove ufficiali.";
    const reasoningD = "La notizia è FALSA ed è stata smentita dalla Casa Bianca.";

    const prompt2 = `
CONFRONTA QUESTI DUE RAGIONAMENTI SULLO STESSO FATTO.
Le due AI sono d'accordo o partono da premesse di realtà opposte?

RAGIONAMENTO NOVA: "${reasoningC}"
RAGIONAMENTO GEMINI: "${reasoningD}"

Rispondi SOLO con: "COMPATIBILI" oppure "DIVERGENTI"
`;

    console.log("\n--- TEST CASE 2: Compatibility ---");
    const result2 = await callGeminiRaw(prompt2);
    console.log("Result:", result2.trim());

    if (result2.includes("COMPATIBILI")) {
        console.log("✅ SUCCESS: Detected Compatibility.");
    } else {
        console.log("❌ FAILURE: False positive divergence.");
    }
}

testDivergenceDetector();
