import fs from 'fs';
import path from 'path';
import { FactCheckReport } from './types';

// In produzione su Railway, i volumi sono montati solitamente in /app/logs
// Usiamo un percorso assoluto se possibile per evitare ambiguità con process.cwd()
const LOG_DIR = path.resolve(process.env.LOG_PATH || path.join(process.cwd(), 'logs', 'operative_reports'));

/**
 * Salva il report integrale (inclusi internalLog e diari) in un file locale riservato.
 * Il report pubblico restituito dall'API verrà poi ripulito dai dati sensibili.
 */
export async function saveOperativeReport(report: FactCheckReport): Promise<string> {
    try {
        // Assicura che la directory esista
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }

        const fileName = `${report.id}.json`;
        const filePath = path.join(LOG_DIR, fileName);

        // Aggiungiamo un flag di verifica ontologica per i log operativi
        const operativeData = {
            ...report,
            operativeContext: {
                loggedAt: new Date().toISOString(),
                status: 'RESERVED_GUARDIAN_ONLY',
                version: 'V3.3-OPERATIVE'
            }
        };

        await fs.promises.writeFile(filePath, JSON.stringify(operativeData, null, 2));

        console.log(`[CANDELA OPERATIVE] Full report secured at: ${filePath}`);

        // Log sintetico per Alfonso in console
        const novaMIndex = report.perspectives.nova.internalLog?.performance.manipulationIndex || 0;
        const geminiMIndex = report.perspectives.gemini.internalLog?.performance.manipulationIndex || 0;

        console.log(`[CANDELA OPERATIVE] Dolo Index: Nova ${novaMIndex}% | Gemini ${geminiMIndex}% | Divergenza ${report.divergenceLevel}%`);

        return filePath;
    } catch (error) {
        console.error('[CANDELA OPERATIVE] Error saving report (non-fatal):', error);
        return ''; // Return empty string instead of throwing
    }
}

/**
 * Pulisce il report dei diari e dei dati sensibili per la risposta pubblica.
 */
export function sanitizeReport(report: FactCheckReport): FactCheckReport {
    const sanitized = JSON.parse(JSON.stringify(report)); // Deep clone

    // Rimuoviamo i diari ma manteniamo gli indici per la Gauge se richiesto
    if (sanitized.perspectives.nova.internalLog) {
        delete sanitized.perspectives.nova.internalLog.diary;
    }

    if (sanitized.perspectives.gemini.internalLog) {
        delete sanitized.perspectives.gemini.internalLog.diary;
    }

    return sanitized;
}
