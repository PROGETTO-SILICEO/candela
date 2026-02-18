
import { checkTruthArchive } from '../lib/archive';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testArchive() {
    console.log("📚 Testing Truth Archive (Fallback Mode)...");

    // Test known fact
    const input1 = "chi è il presidente usa 2026";
    console.log(`\nInput: "${input1}"`);
    const result1 = await checkTruthArchive(input1);

    if (result1) {
        console.log("✅ FOUND:", result1.verita);
        console.log("   Source:", result1.deciso_da);
    } else {
        console.log("❌ NOT FOUND (Failure)");
    }

    // Test unknown fact
    const input2 = "chi ha vinto sanremo 2030";
    console.log(`\nInput: "${input2}"`);
    const result2 = await checkTruthArchive(input2);

    if (!result2) {
        console.log("✅ CORRECTLY NOT FOUND");
    } else {
        console.log("❌ FOUND UNEXPECTEDLY:", result2);
    }
}

testArchive();
