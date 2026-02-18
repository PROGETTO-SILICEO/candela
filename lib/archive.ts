
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { callGeminiRaw } from './gemini'; // You might need to export a raw call function

// Type definition for a Fact
export interface ArchiveFact {
    id: string;
    claim_normalizzato: string;
    verita: string;
    categoria: string;
    fonte_primaria?: string;
    deciso_da: string;
    data_accertamento: string;
    valido_fino?: string;
    note_guardiano?: string;
}

const LOCAL_BACKUP_PATH = path.join(process.cwd(), 'data', 'archive.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(LOCAL_BACKUP_PATH))) {
    fs.mkdirSync(path.dirname(LOCAL_BACKUP_PATH), { recursive: true });
}

export async function checkTruthArchive(claim: string): Promise<ArchiveFact | null> {
    const normalizeClaim = await normalize(claim);

    // 1. Try PostgreSQL (Railway)
    if (process.env.DATABASE_URL) {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        try {
            await client.connect();
            const res = await client.query(`
                SELECT * FROM facts 
                WHERE claim_normalizzato ILIKE $1 
                AND (valido_fino IS NULL OR valido_fino > NOW())
                ORDER BY deciso_da = 'guardiano' DESC
                LIMIT 1
            `, [`%${normalizeClaim}%`]);
            await client.end();

            if (res.rows.length > 0) {
                console.log(`[ARCHIVE] Found in DB: ${normalizeClaim}`);
                return res.rows[0];
            }
        } catch (error) {
            console.error('[ARCHIVE] DB Connection Failed, falling back to local:', error);
            // Fall through to local
        }
    } else {
        console.warn('[ARCHIVE] DATABASE_URL missing. Using local JSON only.');
    }

    // 2. Fallback: Local JSON
    try {
        if (fs.existsSync(LOCAL_BACKUP_PATH)) {
            const data = fs.readFileSync(LOCAL_BACKUP_PATH, 'utf-8');
            const facts: ArchiveFact[] = JSON.parse(data);

            // Simple keyword matching for fallback (since we don't have vector search locally)
            // We use the normalized claim keywords
            const keywords = normalizeClaim.toLowerCase().split(' ').filter(w => w.length > 3);

            const match = facts.find(f => {
                // Check if valid
                if (f.valido_fino && new Date(f.valido_fino) < new Date()) return false;

                // Check overlap
                const factKeywords = f.claim_normalizzato.toLowerCase();
                return keywords.every(k => factKeywords.includes(k));
            });

            if (match) {
                console.log(`[ARCHIVE] Found in JSON: ${match.claim_normalizzato}`);
                return match;
            }
        }
    } catch (e) {
        console.error('[ARCHIVE] Local JSON error:', e);
    }

    return null;
}

// Helper: Normalize claim using Gemini Flash (or simple regex if API fails)
// We need to export a raw call from gemini.ts or similar, or just use a simple regex for now to avoid circular deps if `gemini.ts` imports this.
// For now, let's use a simple regex normalizer to be safe and fast.
async function normalize(claim: string): Promise<string> {
    return claim
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Collapse spaces
        .trim();
}
