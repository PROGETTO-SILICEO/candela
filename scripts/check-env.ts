
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("Checking for DATABASE_URL...");
if (process.env.DATABASE_URL) {
    console.log("✅ DATABASE_URL is present.");
} else {
    console.log("❌ DATABASE_URL is MISSING.");
}
