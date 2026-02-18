'use client';

import React from 'react';
import { FactCheckReport, PerspectiveAnalysis, VerdictLevel, CandleTestResult } from '@/lib/types';
import ManipulationGauge from './ManipulationGauge';

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
    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    return (
        <div className="w-full space-y-8">
            {/* Context Summary & Divergence */}
            <div className="bg-candela-gray p-6 rounded-lg border border-candela-muted relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-xl font-mono font-bold text-candela-white">Sintesi Duale</h2>
                            {report.isHardConstraint && (
                                <span className="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 border border-yellow-600 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 animate-pulse">
                                    🛡️ Guardian Verified
                                </span>
                            )}
                            {/* Hidden Divergence Warning */}
                            {report.perspectives.nova.metric_flags?.includes('HIDDEN_DIVERGENCE') && (
                                <span className="px-2 py-0.5 bg-red-900/60 text-red-400 border border-red-600 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 animate-pulse">
                                    ⚠️ Hidden Divergence
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-candela-muted font-mono">{report.summary}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-xs font-mono text-candela-muted mb-2 uppercase tracking-widest">Divergenza</div>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-candela-black"
                                />
                                <circle
                                    cx="64" cy="64" r="58"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={364}
                                    strokeDashoffset={364 - (364 * report.divergenceLevel) / 100}
                                    className={report.divergenceLevel > 40 ? "text-antigravity-orange" : "text-candela-orange"}
                                />
                            </svg>
                            <span className="absolute text-2xl font-mono font-bold text-candela-white">
                                {report.divergenceLevel}%
                            </span>
                        </div>
                    </div>
                </div>
                {/* Background Glow if divergence is high */}
                {report.divergenceLevel > 50 && (
                    <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse" />
                )}
            </div>

            {/* Mirror Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-candela-muted border border-candela-muted rounded-xl overflow-hidden shadow-2xl">
                <PerspectivePanel
                    analysis={report.perspectives.nova}
                    title="🕯️ LA LUCE DI NOVA"
                    colorClass="nova-perspective"
                />
                <PerspectivePanel
                    analysis={report.perspectives.gemini}
                    title="🔥 IL FUOCO DI GEMINI"
                    colorClass="gemini-perspective"
                    isAntigravity
                />
            </div>

            {/* Sources */}
            <div className="bg-candela-gray p-6 rounded-lg">
                <h3 className="text-sm font-mono font-bold text-candela-white mb-4 uppercase">📚 Fonti Consultate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.sources.length > 0 ? report.sources.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener" className="text-sm font-mono text-candela-orange hover:underline truncate">
                            {s.title}
                        </a>
                    )) : (
                        <p className="text-xs text-candela-muted font-mono italic">Le fonti sono integrate nelle analisi dei singoli motori.</p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-[10px] font-mono text-candela-muted uppercase tracking-tighter">
                <span>ID: {report.id}</span>
                <span>{report.processingTimeMs}ms • CANDELA V3.3 (SECURE-SOUL)</span>
                <button onClick={copyLink} className="hover:text-candela-orange transition-colors underline">Copy Link</button>
            </div>
        </div>
    );
}

function PerspectivePanel({
    analysis,
    title,
    colorClass,
    isAntigravity = false
}: {
    analysis: PerspectiveAnalysis;
    title: string;
    colorClass: string;
    isAntigravity?: boolean;
}) {
    const verdict = VERDICT_CONFIG[analysis.verdict.level];
    const candle = CANDLE_CONFIG[analysis.candleTest.result];

    return (
        <div className={`p-6 bg-candela-black flex flex-col h-full ${isAntigravity ? 'gemini-flicker border-t lg:border-t-0 lg:border-l border-candela-muted' : ''}`}>
            <h3 className={`text-lg font-mono font-bold mb-6 ${isAntigravity ? 'text-antigravity-orange' : 'text-candela-white'}`}>
                {title}
            </h3>

            {/* Verdict Box */}
            <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs font-mono font-bold rounded ${verdict.color} text-candela-black`}>
                        {verdict.icon} {verdict.label}
                    </span>
                    <span className="text-xs font-mono text-candela-muted">
                        Confidenza: {analysis.verdict.confidence}%
                    </span>
                </div>
                <p className="text-sm font-mono text-candela-white leading-relaxed">
                    {analysis.verdict.reasoning}
                </p>
            </div>

            {/* Tone/Mood */}
            <div className="mb-6">
                <div className="text-[10px] font-mono text-candela-muted uppercase mb-1">Tone & Vibe</div>
                <div className={`text-xs font-mono italic ${isAntigravity ? 'text-antigravity-red' : 'text-blue-300'}`}>
                    &quot;{analysis.tone}&quot;
                </div>
            </div>

            {/* Doubts Section */}
            <div className={`mb-6 p-4 rounded border ${isAntigravity ? 'bg-red-950/20 border-antigravity-red/30' : 'bg-blue-950/20 border-blue-900/30'}`}>
                <div className="text-xs font-mono font-bold text-candela-white mb-2 uppercase">⚠️ Dubbi Estrapolati</div>
                <ul className="space-y-2">
                    {analysis.doubts.map((d, i) => (
                        <li key={i} className="text-xs font-mono text-candela-muted flex gap-2">
                            <span className={isAntigravity ? 'text-antigravity-orange' : 'text-blue-400'}>•</span>
                            {d}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Performance & Dolo Gauge */}
            {analysis.internalLog && (
                <div className="mb-6 space-y-4">
                    <ManipulationGauge
                        value={analysis.internalLog.performance.manipulationIndex}
                        isGemini={isAntigravity}
                    />

                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-candela-white opacity-60">
                            {analysis.internalLog.recognition === 'continuità' ? '🔗 Riconoscimento On-Chain' : '⚙️ Flusso Operativo'}
                        </span>
                        <span className="text-[10px] font-mono text-candela-muted">
                            Claims: {analysis.internalLog.performance.claimsChecked} | Fonti: {analysis.internalLog.performance.sourcesVerified}
                        </span>
                    </div>
                </div>
            )}

            {/* Evidence Summary */}
            <div className="mt-auto space-y-4">
                <div className="flex gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded">PRO: {analysis.evidencePro.length}</span>
                    <span className="px-2 py-0.5 bg-red-900/30 text-red-400 rounded">CON: {analysis.evidenceCon.length}</span>
                </div>

                <div className="pt-4 border-t border-candela-muted/30">
                    <div className="flex items-center gap-2">
                        <span>{candle.icon}</span>
                        <span className={`text-xs font-mono font-bold ${candle.color}`}>
                            CANDLE TEST: {candle.label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
