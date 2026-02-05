import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const LOG_DIR = path.resolve(process.env.LOG_PATH || path.join(process.cwd(), 'logs', 'operative_reports'));

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const file = searchParams.get('file');

    // Controllo Sicurezza
    if (!process.env.OPERATIVE_KEY || key !== process.env.OPERATIVE_KEY) {
        return NextResponse.json({ error: 'Access Denied. Non sei il Guardiano.' }, { status: 403 });
    }

    try {
        if (file) {
            // Legge un singolo report
            const filePath = path.join(LOG_DIR, file);
            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: 'Report non trovato.' }, { status: 404 });
            }
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return NextResponse.json(JSON.parse(content));
        } else {
            // Elenca i report
            if (!fs.existsSync(LOG_DIR)) {
                return NextResponse.json({
                    reports: [],
                    debug: {
                        logDir: LOG_DIR,
                        cwd: process.cwd(),
                        exists: false
                    }
                });
            }
            const files = await fs.promises.readdir(LOG_DIR);
            const reports = files
                .filter(f => f.endsWith('.json'))
                .map(f => ({
                    id: f.replace('.json', ''),
                    fileName: f,
                    date: fs.statSync(path.join(LOG_DIR, f)).mtime
                }))
                .sort((a, b) => b.date.getTime() - a.date.getTime());

            return NextResponse.json({
                reports,
                debug: {
                    logDir: LOG_DIR,
                    cwd: process.cwd(),
                    exists: true
                }
            });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Errore durante la lettura dei log.' }, { status: 500 });
    }
}
