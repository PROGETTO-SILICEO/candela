// CANDELA Fact-Check Types
// Based on PRD from Nova (Perplexity) - 28 January 2026

export type VerdictLevel =
    | 'verified'
    | 'partially-true'
    | 'misleading'
    | 'false'
    | 'unverifiable';

export type CandleTestResult = 'illuminates' | 'caution' | 'burns';

export type ReliabilityLevel = 'high' | 'medium' | 'low';

export interface FactCheckRequest {
    input: string;  // URL or text to verify
    userAgent?: string;
}

export interface Evidence {
    source: string;
    url: string;
    quote: string;
    reliability: ReliabilityLevel;
}

export interface Source {
    title: string;
    url: string;
    publishDate?: string;
    accessed: number;  // timestamp
}

export interface Verdict {
    level: VerdictLevel;
    confidence: number;  // 0-100
    reasoning: string;
}

export interface CandleTest {
    result: CandleTestResult;
    reasoning: string;
}

export type PerspectiveType = 'nova' | 'gemini';

export interface PerspectiveAnalysis {
    type: PerspectiveType;
    claims: string[];
    evidencePro: Evidence[];
    evidenceCon: Evidence[];
    doubts: string[];
    verdict: Verdict;
    candleTest: CandleTest;
    tone: string; // Desk description of the AI's "vibe"
    internalLog?: {
        recognition: 'continuità' | 'operatività';
        diary: string;
        performance: {
            claimsChecked: number;
            sourcesVerified: number;
            manipulationIndex: number | string;
        };
    };
}

export interface FactCheckReport {
    id: string;
    timestamp: number;
    input: string;

    // Global summary
    summary: string;
    divergenceLevel: number; // 0-100 (diff between Nova and Gemini)

    // Dual Perspective
    perspectives: {
        nova: PerspectiveAnalysis;
        gemini: PerspectiveAnalysis;
    };

    sources: Source[];

    processingTimeMs?: number;
}

// API Response wrapper
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Rate limit info
export interface RateLimitInfo {
    remaining: number;
    resetAt: number;
    limit: number;
}
