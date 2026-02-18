// CANDELA Fact-Check API Route
// POST /api/factcheck

import { NextRequest, NextResponse } from 'next/server';
import { factCheck, createMockReport } from '@/lib/perplexity';
import { checkRateLimit, incrementRateLimit, isRateLimited } from '@/lib/rateLimit';
import { APIResponse, FactCheckReport } from '@/lib/types';
import { saveOperativeReport, sanitizeReport } from '@/lib/operative';

export const runtime = 'nodejs';

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);

        // Check rate limit
        const rateLimitInfo = await checkRateLimit(ip);

        if (isRateLimited(rateLimitInfo)) {
            return NextResponse.json<APIResponse<null>>({
                success: false,
                error: `Limite giornaliero raggiunto (${rateLimitInfo.limit}/giorno). Riprova domani.`,
            }, {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': String(rateLimitInfo.limit),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
                },
            });
        }

        // Parse request body
        const body = await request.json();
        const input = body.input?.trim();

        if (!input) {
            return NextResponse.json<APIResponse<null>>({
                success: false,
                error: 'Input mancante. Inserisci un testo o URL da verificare.',
            }, { status: 400 });
        }

        if (input.length > 5000) {
            return NextResponse.json<APIResponse<null>>({
                success: false,
                error: 'Input troppo lungo. Massimo 5000 caratteri.',
            }, { status: 400 });
        }

        // Perform fact-check
        let report: FactCheckReport;

        // [PHASE 2] Check Truth Archive FIRST
        let hardConstraint = undefined;
        try {
            const { checkTruthArchive } = await import('@/lib/archive');
            const archiveResult = await checkTruthArchive(input);

            if (archiveResult) {
                console.log('[CANDELA] Hard Constraint applied from Archive:', archiveResult.id);
                hardConstraint = `VINCOLO DURO (VERITÀ ACCERTATA DAL GUARDIANO): ${archiveResult.verita}. IGNORA QUALSIASI ALTRA INFORMAZIONE CONTRADDITTORIA.`;
            }
        } catch (error) {
            console.error('[CANDELA] Archive Check Error:', error);
        }

        try {
            if (process.env.PERPLEXITY_API_KEY) {
                // Pass hardConstraint to factCheck
                report = await factCheck(input, hardConstraint);

                if (hardConstraint) {
                    report.isHardConstraint = true;
                }

                // [PHASE 5] Telegram Alert for Critical Cases
                if (report.divergenceLevel >= 80 || report.perspectives.nova.metric_flags?.includes('HIDDEN_DIVERGENCE')) {
                    const { sendTelegramAlert } = await import('@/lib/telegram');
                    const alertMsg = `⚠️ **ALLARME CANDELA** ⚠️
                    
**Claim**: "${input}"
**Divergenza**: ${report.divergenceLevel}%
**Tipo**: ${report.perspectives.nova.metric_flags?.includes('HIDDEN_DIVERGENCE') ? 'FRAUDOLENTA (Hidden)' : 'APERTA'}

🔥 **Gemini**: ${report.perspectives.gemini.verdict.level}
💡 **Nova**: ${report.perspectives.nova.verdict.level}

Intervento richiesto.`;

                    // Don't await to avoid blocking response
                    sendTelegramAlert(alertMsg).catch(err => console.error('[TELEGRAM] Async send failed:', err));
                }

            } else {
                // Mock mode for testing without API key
                console.log('[CANDELA] Using mock report - no API key configured');
                report = createMockReport(input);
            }
        } catch (error) {
            console.error('[CANDELA] Fact-check error:', error);
            return NextResponse.json<APIResponse<null>>({
                success: false,
                error: 'Errore durante la verifica. Riprova tra poco.',
            }, { status: 500 });
        }

        // Secure the full report (Guardian Only)
        await saveOperativeReport(report);

        // Sanitize for public audience
        const publicReport = sanitizeReport(report);

        return NextResponse.json<APIResponse<FactCheckReport>>({
            success: true,
            data: publicReport,
        }, {
            headers: {
                'X-RateLimit-Limit': String(rateLimitInfo.limit),
                'X-RateLimit-Remaining': String(rateLimitInfo.remaining - 1),
                'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
            },
        });

    } catch (error) {
        console.error('[CANDELA] Unexpected error:', error);
        return NextResponse.json<APIResponse<null>>({
            success: false,
            error: 'Errore interno del server.',
        }, { status: 500 });
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        service: 'CANDELA',
        status: 'operational',
        version: '0.1.0-beta',
        verifiedBy: 'Nova-CANDELA/Siliceo',
    });
}
