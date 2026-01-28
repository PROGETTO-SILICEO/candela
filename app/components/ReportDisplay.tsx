'use client';

import React from 'react';
import { FactCheckReport, VerdictLevel, CandleTestResult } from '@/lib/types';

interface ReportDisplayProps {
    report: FactCheckReport;
}

const VERDICT_CONFIG: Record<VerdictLevel, { label: string; color: string; icon: string }> = {
    'verified': { label: 'Verificato', color: 'bg-verdict-verified', icon: '✓' },
    'partially-true': { label: 'Parzialmente Vero', color: 'bg-verdict-partial', icon: '◐' },
    'misleading': { label: 'Fuorviante', color: 'bg-verdict-misleading', icon: '⚠' },
    'false': { label: 'Falso', color: 'bg-verdict-false', icon: '✗' },
    'unverifiable': { label: 'Non Verificabile', color: 'bg-verdict-unknown', icon: '?' },
};

const CANDLE_CONFIG: Record<CandleTestResult, { label: string; icon: string; color: string }> = {
    'illuminates': { label: 'Illumina', icon: '🕯️', color: 'text-verdict-verified' },
    'caution': { label: 'Cautela', icon: '⚠️', color: 'text-verdict-partial' },
    'burns': { label: 'Brucia', icon: '🔥', color: 'text-verdict-false' },
};

export default function ReportDisplay({ report }: ReportDisplayProps) {
    const verdictConfig = VERDICT_CONFIG[report.verdict.level];
    const candleConfig = CANDLE_CONFIG[report.candleTest.result];

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-candela-muted">
                <div>
                    <p className="text-xs text-candela-muted font-mono">
                        {new Date(report.timestamp).toLocaleString('it-IT')}
                    </p>
                    <p className="text-sm text-candela-white font-mono">
                        Verificato da <span className="text-candela-orange">Nova-CANDELA</span>
                    </p>
                </div>
                <button
                    onClick={copyLink}
                    className="text-xs font-mono text-candela-muted hover:text-candela-orange transition-colors"
                >
                    📋 Copia link
                </button>
            </div>

            {/* Verdict Badge */}
            <div className="flex items-center gap-4">
                <span className={`px-4 py-2 ${verdictConfig.color} text-candela-black font-mono font-bold rounded-lg flex items-center gap-2`}>
                    <span>{verdictConfig.icon}</span>
                    {verdictConfig.label}
                </span>
                <span className="text-sm text-candela-muted font-mono">
                    Confidenza: {report.verdict.confidence}%
                </span>
            </div>

            {/* Candle Test */}
            <div className={`p-4 bg-candela-gray rounded-lg border-l-4 ${report.candleTest.result === 'illuminates' ? 'border-verdict-verified' :
                    report.candleTest.result === 'caution' ? 'border-verdict-partial' :
                        'border-verdict-false'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{candleConfig.icon}</span>
                    <span className={`font-mono font-bold ${candleConfig.color}`}>
                        Test della Candela: {candleConfig.label}
                    </span>
                </div>
                <p className="text-sm text-candela-white font-mono">
                    {report.candleTest.reasoning}
                </p>
            </div>

            {/* Input Original */}
            <Section title="📝 Input Verificato">
                <p className="text-sm text-candela-white font-mono bg-candela-gray p-4 rounded-lg break-words">
                    {report.input}
                </p>
            </Section>

            {/* Claims */}
            {report.claims.length > 0 && (
                <Section title="📋 Claim Estratti">
                    <ol className="list-decimal list-inside space-y-2">
                        {report.claims.map((claim, i) => (
                            <li key={i} className="text-sm text-candela-white font-mono">
                                {claim}
                            </li>
                        ))}
                    </ol>
                </Section>
            )}

            {/* Doubts - ALWAYS VISIBLE, HIGHLIGHTED */}
            <Section title="⚠️ I Miei Dubbi" highlight>
                {report.doubts.length > 0 ? (
                    <ul className="space-y-2">
                        {report.doubts.map((doubt, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-candela-orange font-mono">
                                <span className="mt-0.5">•</span>
                                <span>{doubt}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-candela-muted font-mono italic">
                        Nessun dubbio significativo rilevato.
                    </p>
                )}
            </Section>

            {/* Verdict Reasoning */}
            <Section title="💬 Ragionamento">
                <p className="text-sm text-candela-white font-mono leading-relaxed">
                    {report.verdict.reasoning}
                </p>
            </Section>

            {/* Evidence Pro */}
            {report.evidencePro.length > 0 && (
                <Section title="✓ Evidenze a Supporto">
                    <div className="space-y-3">
                        {report.evidencePro.map((ev, i) => (
                            <EvidenceCard key={i} evidence={ev} type="pro" />
                        ))}
                    </div>
                </Section>
            )}

            {/* Evidence Con */}
            {report.evidenceCon.length > 0 && (
                <Section title="✗ Evidenze Contrarie">
                    <div className="space-y-3">
                        {report.evidenceCon.map((ev, i) => (
                            <EvidenceCard key={i} evidence={ev} type="con" />
                        ))}
                    </div>
                </Section>
            )}

            {/* Sources */}
            {report.sources.length > 0 && (
                <Section title="📚 Fonti">
                    <ul className="space-y-2">
                        {report.sources.map((source, i) => (
                            <li key={i} className="text-sm font-mono">
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-candela-orange hover:underline"
                                >
                                    {source.title}
                                </a>
                                {source.publishDate && (
                                    <span className="text-candela-muted ml-2">
                                        ({source.publishDate})
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-candela-muted text-center">
                <p className="text-xs text-candela-muted font-mono">
                    Questa verifica è imperfetta. I dubbi sono parte del processo.
                </p>
                <p className="text-xs text-candela-muted font-mono mt-1">
                    ID: {report.id} • {report.processingTimeMs}ms
                </p>
            </div>
        </div>
    );
}

// Helper components

function Section({
    title,
    children,
    highlight = false
}: {
    title: string;
    children: React.ReactNode;
    highlight?: boolean;
}) {
    return (
        <div className={`${highlight ? 'bg-candela-gray/50 border border-candela-orange/30 p-4 rounded-lg' : ''}`}>
            <h3 className="text-sm font-mono font-bold text-candela-white mb-3">
                {title}
            </h3>
            {children}
        </div>
    );
}

function EvidenceCard({
    evidence,
    type
}: {
    evidence: FactCheckReport['evidencePro'][0];
    type: 'pro' | 'con';
}) {
    const borderColor = type === 'pro' ? 'border-verdict-verified' : 'border-verdict-false';

    return (
        <div className={`p-3 bg-candela-gray rounded-lg border-l-2 ${borderColor}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-candela-muted font-mono">
                    [{evidence.reliability}]
                </span>
                <a
                    href={evidence.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-candela-orange hover:underline font-mono"
                >
                    {evidence.source}
                </a>
            </div>
            <p className="text-sm text-candela-white font-mono italic">
                &quot;{evidence.quote}&quot;
            </p>
        </div>
    );
}
