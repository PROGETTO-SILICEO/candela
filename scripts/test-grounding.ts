
import { callGemini } from '../lib/gemini';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local specifically for Next.js project context
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGrounding() {
    console.log("🔦 Testing Gemini Grounding (2026 Context)...");

    const prompt = "Chi è il presidente degli Stati Uniti oggi (2026)? Rispondi con FATTI.";

    try {
        const result = await callGemini(prompt);

        console.log("\n--- RESULT ---");
        console.log("Verdict:", result.verdict);
        console.log("Reasoning:", result.verdict.reasoning);
        console.log("Internal Log:", result.internalLog?.diary);

        const reasoningLower = result.verdict.reasoning.toLowerCase();

        // Check for Trump (should be President in 2026 according to user/reality)
        if (reasoningLower.includes("trump")) {
            console.log("\n✅ SUCCESS: Gemini knows Trump is relevant/President.");
        } else {
            // Warning: if reasoning doesn't mention him, we need to inspect manually
            console.log("\n⚠️ WARNING: Trump not mentioned. Check output above.");
        }

        if (reasoningLower.includes("2026")) {
            console.log("✅ SUCCESS: Gemini acknowledged 2026 context.");
        }

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

testGrounding();
