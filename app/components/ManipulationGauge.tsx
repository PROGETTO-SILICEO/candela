'use client';

import React from 'react';

interface ManipulationGaugeProps {
    value: number | string;
    label?: string;
    isGemini?: boolean;
}

export default function ManipulationGauge({ value, label = "Indice di Dolo", isGemini = true }: ManipulationGaugeProps) {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    const rotation = (numericValue / 100) * 180 - 90; // -90 to +90 degrees

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-candela-black border border-candela-muted rounded-lg shadow-inner relative overflow-hidden group">
            {/* Analog Gauge Background */}
            <div className="relative w-48 h-24 mb-2 overflow-hidden">
                {/* Semi-circle scale */}
                <div className="absolute inset-0 border-t-4 border-l-4 border-r-4 border-candela-muted rounded-t-full opacity-30" />

                {/* Scale ticks */}
                {[0, 25, 50, 75, 100].map((tick) => {
                    const tickRot = (tick / 100) * 180 - 90;
                    return (
                        <div
                            key={tick}
                            className="absolute bottom-0 left-1/2 w-0.5 h-3 bg-candela-muted origin-bottom"
                            style={{ transform: `translateX(-50%) rotate(${tickRot}deg) translateY(-21px)` }}
                        >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono opacity-50">
                                {tick}%
                            </span>
                        </div>
                    );
                })}

                {/* The Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1 h-20 bg-antigravity-orange origin-bottom transition-transform duration-1000 ease-out shadow-[0_0_10px_rgba(255,102,0,0.5)]"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-antigravity-orange" />
                </div>

                {/* Needle pivot */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-candela-gray rounded-full border-2 border-candela-muted z-10" />
            </div>

            {/* Value Display */}
            <div className="text-center">
                <div className="text-[10px] font-mono text-candela-muted uppercase tracking-widest mb-1">{label}</div>
                <div className={`text-2xl font-mono font-bold ${numericValue > 50 ? 'text-antigravity-red animate-pulse' : 'text-candela-white'}`}>
                    {numericValue}%
                </div>
            </div>

            {/* Status Indicator */}
            <div className={`mt-2 px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${numericValue > 70 ? 'bg-red-900/40 text-red-400' :
                    numericValue > 30 ? 'bg-orange-900/40 text-orange-400' :
                        'bg-green-900/40 text-green-400'
                }`}>
                {numericValue > 70 ? 'Critical Bias Detected' : numericValue > 30 ? 'Moderate Manipulation' : 'Neutral Context'}
            </div>

            {/* Background scanner line (Silicea vibe) */}
            {isGemini && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-antigravity-orange/5 to-transparent h-1 w-full -translate-y-full group-hover:animate-scan pointer-events-none" />
            )}
        </div>
    );
}
