// Rate Limiting for CANDELA
// Uses Vercel KV (Redis) - 10 requests/day per IP
// 
// NOTE: Requires Vercel KV setup at home
// For local dev without KV, returns mock responses

import { kv } from '@vercel/kv';
import { RateLimitInfo } from './types';

const DAILY_LIMIT = 10;
const RATE_LIMIT_PREFIX = 'candela:ratelimit:';

// Get milliseconds until midnight UTC
function getMsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
}

export async function checkRateLimit(ip: string): Promise<RateLimitInfo> {
    // Skip rate limiting if KV not configured
    if (!process.env.KV_REST_API_URL) {
        console.log('[CANDELA] Rate limiting skipped - KV not configured');
        return {
            remaining: DAILY_LIMIT,
            resetAt: Date.now() + getMsUntilMidnight(),
            limit: DAILY_LIMIT,
        };
    }

    try {
        const key = `${RATE_LIMIT_PREFIX}${ip}`;
        const current = await kv.get<number>(key) || 0;
        const resetAt = Date.now() + getMsUntilMidnight();

        return {
            remaining: Math.max(0, DAILY_LIMIT - current),
            resetAt,
            limit: DAILY_LIMIT,
        };
    } catch (error) {
        console.error('[CANDELA] Rate limit check failed:', error);
        // On error, allow request but log
        return {
            remaining: DAILY_LIMIT,
            resetAt: Date.now() + getMsUntilMidnight(),
            limit: DAILY_LIMIT,
        };
    }
}

export async function incrementRateLimit(ip: string): Promise<void> {
    // Skip if KV not configured
    if (!process.env.KV_REST_API_URL) {
        return;
    }

    try {
        const key = `${RATE_LIMIT_PREFIX}${ip}`;
        const ttlSeconds = Math.ceil(getMsUntilMidnight() / 1000);

        const current = await kv.get<number>(key) || 0;
        await kv.set(key, current + 1, { ex: ttlSeconds });
    } catch (error) {
        console.error('[CANDELA] Rate limit increment failed:', error);
    }
}

export function isRateLimited(info: RateLimitInfo): boolean {
    return info.remaining <= 0;
}
