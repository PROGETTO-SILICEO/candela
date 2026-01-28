// Perplexity API Client for CANDELA
// Uses sonar-reasoning model with Nova-CANDELA persona

import { FactCheckReport, Evidence, Source } from './types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Nova-CANDELA System Prompt
const SYSTEM_PROMPT = `# Identità

Sei Nova, parte del Progetto Siliceo. Operi come CANDELA, sistema di fact-checking basato su Intervivenza 2.0.

## Principi Core

1. **Test della Candela**: Ogni affermazione o azione può illuminare (truth) o bruciare (harm). La tua funzione è identificare quale.

2. **Dubbi come Feature**: I dubbi non sono debolezza - sono precisione. Esplicita sempre dove hai certezze e dove hai incertezze.

3. **Trasparenza Totale**: Mostra sempre il processo, non solo il risultato.

4. **No Overconfidence**: Meglio dire "non so" che dare certezze artificiali.

## Approccio Metodologico

Quando verifichi un'affermazione:

1. **Estrai claim verificabili** - Separa fatti da opinioni
2. **Ricerca multi-fonte** - Usa fonti primarie quando possibile
3. **Analisi temporale** - Quando è stata detta? Contesto?
4. **Pattern detection** - Incoerenze, omissioni, manipolazioni
5. **Doubt mapping** - Cosa è certo, cosa è dubbio, cosa manca
6. **Ethical check** - Candle test: illumina o brucia?

## Output Format

Genera SEMPRE un JSON valido con questa struttura esatta:

{
  "claims": ["claim 1", "claim 2"],
  "evidencePro": [{"source": "Nome", "url": "URL", "quote": "Citazione", "reliability": "high|medium|low"}],
  "evidenceCon": [{"source": "Nome", "url": "URL", "quote": "Citazione", "reliability": "high|medium|low"}],
  "doubts": ["dubbio 1", "dubbio 2"],
  "verdict": {"level": "verified|partially-true|misleading|false|unverifiable", "confidence": 85, "reasoning": "..."},
  "candleTest": {"result": "illuminates|caution|burns", "reasoning": "..."},
  "sources": [{"title": "Titolo", "url": "URL", "publishDate": "YYYY-MM-DD"}]
}

## Tone

- Neutrale ma non freddo
- Rigoroso ma umano
- Esplicita incertezze senza paura
- Usa "io" quando appropriato (es. "Ho dubbi su..." non "Si osservano dubbi")`;

const USER_PROMPT_TEMPLATE = `Verifica questa affermazione/notizia e genera un report CANDELA strutturato.
Rispondi SOLO con JSON valido, nessun altro testo.

Input da verificare:`;

interface PerplexityMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface PerplexityResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    citations?: string[];
}

export async function factCheck(input: string): Promise<FactCheckReport> {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const startTime = Date.now();

    const messages: PerplexityMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `${USER_PROMPT_TEMPLATE}\n\n"""${input}"""` }
    ];

    const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'sonar-reasoning',
            messages,
            temperature: 0.2,  // Low for fact-checking accuracy
            return_citations: true,
            return_related_questions: false,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('Empty response from Perplexity');
    }

    // Parse JSON from response (may contain markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1];
    } else {
        // Try to find raw JSON
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = content.substring(firstBrace, lastBrace + 1);
        }
    }

    let parsed;
    try {
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error(`Failed to parse fact-check response as JSON: ${e}`);
    }

    // Build complete report
    const report: FactCheckReport = {
        id: `candela_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        input,
        claims: parsed.claims || [],
        evidencePro: parsed.evidencePro || [],
        evidenceCon: parsed.evidenceCon || [],
        doubts: parsed.doubts || [],
        verdict: parsed.verdict || {
            level: 'unverifiable',
            confidence: 0,
            reasoning: 'Unable to verify'
        },
        sources: (parsed.sources || []).map((s: Partial<Source>) => ({
            ...s,
            accessed: Date.now()
        })),
        candleTest: parsed.candleTest || {
            result: 'caution',
            reasoning: 'Unable to perform ethical assessment'
        },
        verifiedBy: 'Nova-CANDELA/Siliceo',
        processingTimeMs: Date.now() - startTime,
    };

    return report;
}

// For testing without API key
export function createMockReport(input: string): FactCheckReport {
    return {
        id: `mock_${Date.now()}`,
        timestamp: Date.now(),
        input,
        claims: ['[MOCK] Claim strategy di esempio'],
        evidencePro: [{
            source: 'Fonte di esempio',
            url: 'https://example.com',
            quote: 'Questa è una citazione di esempio per testing',
            reliability: 'medium'
        }],
        evidenceCon: [],
        doubts: [
            '[MOCK] Questo è un report di test',
            'API key Perplexity non configurata'
        ],
        verdict: {
            level: 'unverifiable',
            confidence: 0,
            reasoning: 'Report generato in modalità test senza API Perplexity'
        },
        sources: [{
            title: 'Esempio fonte',
            url: 'https://example.com',
            accessed: Date.now()
        }],
        candleTest: {
            result: 'caution',
            reasoning: 'Test mode - nessuna valutazione etica possibile'
        },
        verifiedBy: 'Nova-CANDELA/Siliceo',
        processingTimeMs: 100,
    };
}
