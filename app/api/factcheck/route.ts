// CANDELA Fact-Check API Route
// POST /api/factcheck

import { NextRequest, NextResponse } from 'next/server';
import { factCheck, createMockReport } from '@/lib/perplexity';
import { checkRateLimit, incrementRateLimit, isRateLimited } from '@/lib/rateLimit';
import { APIResponse, FactCheckReport } from '@/lib/types';

export const runtime = 'edge';

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

        try {
            if (process.env.PERPLEXITY_API_KEY) {
                report = await factCheck(input);
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

        // Increment rate limit (only on success)
        await incrementRateLimit(ip);

        // TODO: Save to Memory Server when at home
        // await saveToMemoryServer(report);

        return NextResponse.json<APIResponse<FactCheckReport>>({
            success: true,
            data: report,
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
