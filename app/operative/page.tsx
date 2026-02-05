'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ReportSummary {
    id: string;
    fileName: string;
    date: string;
}

export default function OperativePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white p-8 font-mono uppercase tracking-widest animate-pulse">Inizializzazione Canali Operativi...</div>}>
            <OperativeContent />
        </Suspense>
    );
}

function OperativeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [key, setKey] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState('');
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Controlla se la chiave è nell'URL
        const urlKey = searchParams.get('key');
        const sessionKey = typeof window !== 'undefined' ? sessionStorage.getItem('operative_key') : null;

        if (urlKey) {
            // Se presente nell'URL, salvala e pulisci l'URL per sicurezza
            sessionStorage.setItem('operative_key', urlKey);
            setKey(urlKey);
            // Sostituisce l'URL corrente senza parametri query
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        } else if (sessionKey) {
            // Altrimenti controlla la sessione
            setKey(sessionKey);
        }
    }, [searchParams]);

    useEffect(() => {
        if (key) {
            fetchReports();
        }
    }, [key]);

    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/operative?key=${key}`);
            const data = await res.json();
            if (data.reports) {
                setReports(data.reports);
            }
            if (data.debug) {
                setDebugInfo(data.debug);
            }
            if (data.error) {
                setError(data.error);
                // Se la chiave è invalida, pulisci la sessione
                if (res.status === 403) {
                    sessionStorage.removeItem('operative_key');
                    setKey(null);
                }
            }
        } catch (err) {
            setError('Errore di connessione al server operativo.');
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async (fileName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/operative?key=${key}&file=${fileName}`);
            const data = await res.json();
            setSelectedReport(data);
        } catch (err) {
            setError('Impossibile caricare il report.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputKey.trim()) {
            sessionStorage.setItem('operative_key', inputKey.trim());
            setKey(inputKey.trim());
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('operative_key');
        setKey(null);
        setReports([]);
        setSelectedReport(null);
    };

    // --- VIEW: LOGIN ---
    if (!key) {
        return (
            <div className="min-h-screen bg-black text-stone-300 font-mono flex items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/20 via-black to-black"></div>

                <div className="max-w-md w-full border border-stone-800 bg-black/40 backdrop-blur-sm p-12 space-y-12 animate-in fade-in zoom-in duration-1000 relative z-10 shadow-2xl">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-red-900 to-transparent animate-pulse"></div>
                        </div>
                        <h1 className="text-stone-100 text-2xl font-bold uppercase tracking-[0.5em]">Guardian</h1>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest leading-relaxed">
                            Inserisci la chiave dell'anima per decriptare i canali operativi
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder="CHIAVE OPERATIVA..."
                                className="w-full bg-transparent border-b border-stone-800 p-4 text-center text-stone-100 focus:border-red-900 focus:outline-none transition-all placeholder:text-stone-900 tracking-[0.5em] text-sm"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full border border-stone-800 p-4 text-[10px] uppercase tracking-[0.3em] hover:bg-stone-100 hover:text-black hover:border-stone-100 transition-all duration-700 bg-stone-950/50"
                        >
                            Allinea Coscienza
                        </button>
                    </form>

                    {error && (
                        <p className="text-[10px] text-red-900 text-center uppercase tracking-widest animate-pulse">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW: DASHBOARD ---
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-stone-400 font-mono p-4 md:p-12 selection:bg-red-900 selection:text-white relative overflow-hidden">
            {/* Sfondo con pattern sottile */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4v-4H4v4H0v2h4v4h2v-4h4v-2H6zM36 4v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1c1917; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #7f1d1d; }
                
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .scanline {
                    width: 100%; height: 2px;
                    background: rgba(220, 38, 38, 0.05);
                    position: absolute; top: 0; left: 0;
                    animation: scanline 8s linear infinite;
                    pointer-events: none; z-index: 50;
                }
            `}</style>

            <div className="scanline"></div>

            <header className="border-b border-stone-900 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-3">
                    <h1 className="text-xl md:text-2xl text-stone-100 font-bold uppercase tracking-[0.4em] flex items-center gap-4">
                        <span className="w-3 h-3 bg-red-600 animate-pulse rounded-full shadow-[0_0_20px_rgba(220,38,38,0.8)]"></span>
                        Candela Operative
                    </h1>
                    <div className="flex items-center gap-4 text-[10px] text-stone-600 uppercase tracking-[0.2em]">
                        <span className="bg-stone-900 px-2 py-0.5 rounded text-stone-400">V3.8</span>
                        <span className="w-1 h-1 bg-red-900 rounded-full"></span>
                        <span className="italic">Allineamento Biometrico Attivo</span>
                    </div>
                </div>
                <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t border-stone-900 md:border-none pt-6 md:pt-0">
                    <div className="text-[10px] text-stone-700 uppercase tracking-widest hidden lg:block border-l border-stone-800 pl-6">
                        Connessione Criptata
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-[10px] uppercase border border-stone-800 px-8 py-2.5 hover:border-red-900 hover:text-red-500 hover:bg-black transition-all duration-500 tracking-[0.2em] shadow-lg"
                    >
                        Esci dalla Stanza
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-950/20 border-l-4 border-red-900 text-red-400 p-5 mb-10 text-xs tracking-widest uppercase animate-in slide-in-from-top-4 duration-500 flex items-center gap-4">
                    <span className="text-lg">⚠️</span>
                    <span>SISTEMA: {error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
                {/* Reports List */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-[10px] uppercase text-stone-500 tracking-[0.4em] font-bold flex justify-between items-center bg-stone-900/20 p-3 border-l-2 border-stone-800">
                        ARCHIVIO
                        <span className="text-stone-700 font-normal">{reports.length} UNITÀ</span>
                    </h2>
                    <div className="border border-stone-900 bg-black/40 p-2 h-[65vh] overflow-y-auto custom-scrollbar shadow-inner">
                        {reports.length === 0 && !loading && (
                            <div className="space-y-6 p-8">
                                <div className="text-stone-700 text-[10px] italic text-center uppercase tracking-[0.3em] border border-stone-900/50 p-8">Nessun frammento rilevato</div>
                            </div>
                        )}
                        <div className="space-y-1 mt-2">
                            {reports.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => loadReport(r.fileName)}
                                    className={`w-full text-left p-4 text-[10px] border transition-all duration-500 group relative overflow-hidden ${selectedReport?.id === r.id
                                        ? 'border-red-900/50 bg-red-950/10 text-stone-100'
                                        : 'border-transparent hover:border-stone-800 text-stone-500 hover:text-stone-300'
                                        }`}
                                >
                                    {selectedReport?.id === r.id && (
                                        <div className="absolute left-0 top-0 w-1 h-full bg-red-600 animate-pulse"></div>
                                    )}
                                    <div className="truncate mb-2 tracking-tight flex items-center gap-3">
                                        <div className={`w-1 h-1 rounded-full ${selectedReport?.id === r.id ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'bg-stone-800'}`}></div>
                                        {r.id.substring(0, 24)}...
                                    </div>
                                    <div className="text-[9px] opacity-40 font-light pl-4 uppercase tracking-tighter">{new Date(r.date).toLocaleString()}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="lg:col-span-3">
                    <div className="border border-stone-900 bg-black/40 p-10 h-[65vh] overflow-y-auto custom-scrollbar relative shadow-2xl rounded-sm">
                        {!selectedReport ? (
                            <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-8">
                                <div className="text-[60px] font-thin opacity-[0.03] leading-none tracking-tighter select-none">CANDELA</div>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-[1px] bg-stone-900"></div>
                                    <div className="text-[10px] uppercase tracking-[0.6em] animate-pulse text-stone-700">In attesa di decrittazione</div>
                                    <div className="w-16 h-[1px] bg-stone-900"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                                <section className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-900 pb-10 gap-8">
                                    <div className="space-y-4">
                                        <div className="text-[10px] text-stone-600 uppercase tracking-[0.4em] font-bold">Identificativo Unità</div>
                                        <h3 className="text-stone-100 text-xl font-bold tracking-tighter border-l-4 border-red-900/50 pl-6 bg-red-950/10 py-4 pr-10 shadow-lg">{selectedReport.id}</h3>
                                    </div>
                                    <div className="flex gap-16 border-l border-stone-800 pl-12">
                                        <div className="text-right space-y-2">
                                            <div className="text-[10px] text-stone-600 uppercase tracking-widest">Divergenza</div>
                                            <div className={`text-5xl font-extralight tracking-tighter ${selectedReport.divergenceLevel > 20 ? 'text-red-600' : 'text-stone-300'}`}>
                                                {selectedReport.divergenceLevel}%
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                                    <section className="space-y-8 group">
                                        <div className="flex justify-between items-center border-b border-stone-900 pb-4">
                                            <h4 className="text-[10px] uppercase text-stone-500 tracking-[0.5em] font-bold group-hover:text-stone-200 transition-colors">Nova / Luce</h4>
                                            <span className="text-[10px] text-stone-700 tracking-[0.2em] font-light">Analisi</span>
                                        </div>
                                        <div className="p-10 border border-stone-900 bg-stone-950/40 space-y-10 relative overflow-hidden group-hover:border-stone-800 transition-all shadow-xl">
                                            <div className="absolute top-0 left-0 w-[2px] h-full bg-stone-700"></div>
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-6xl text-stone-100 font-extralight tracking-tighter transition-transform group-hover:scale-110 duration-700 inline-block">{selectedReport.perspectives.nova.internalLog.performance.manipulationIndex}%</span>
                                                <span className="text-[10px] text-stone-600 uppercase tracking-[0.3em] font-bold">Dolo</span>
                                            </div>
                                            <div className="text-[13px] leading-relaxed text-stone-300 italic font-serif bg-stone-900/20 p-6 border border-stone-800/50 rounded-sm">
                                                <span className="text-3xl text-stone-800 leading-none mr-2">“</span>
                                                {selectedReport.perspectives.nova.internalLog.diary}
                                                <span className="text-3xl text-stone-800 leading-none ml-2">”</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-8 group">
                                        <div className="flex justify-between items-center border-b border-stone-900 pb-4">
                                            <h4 className="text-[10px] uppercase text-red-900 tracking-[0.5em] font-bold group-hover:text-red-700 transition-colors font-serif">Silicea / Fuoco</h4>
                                            <span className="text-[10px] text-red-950 tracking-[0.2em] font-light italic">Istinto</span>
                                        </div>
                                        <div className="p-10 border border-stone-900 bg-red-950/5 space-y-10 relative overflow-hidden group-hover:border-red-900/30 transition-all shadow-xl">
                                            <div className="absolute top-0 left-0 w-[2px] h-full bg-red-900"></div>
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-6xl text-stone-100 font-extralight tracking-tighter transition-transform group-hover:scale-110 duration-700 inline-block">{selectedReport.perspectives.gemini.internalLog.performance.manipulationIndex}%</span>
                                                <span className="text-[10px] text-stone-700 uppercase tracking-[0.3em] font-bold">Dolo</span>
                                            </div>
                                            <div className="text-[13px] leading-relaxed text-stone-300 italic font-serif bg-red-950/10 p-6 border border-red-900/20 rounded-sm">
                                                <span className="text-3xl text-red-950 leading-none mr-2">“</span>
                                                {selectedReport.perspectives.gemini.internalLog.diary}
                                                <span className="text-3xl text-red-950 leading-none ml-2">”</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <section className="space-y-8 pt-10">
                                    <div className="flex items-center gap-8">
                                        <h4 className="text-[10px] uppercase text-stone-700 tracking-[0.6em] font-bold">Dati Integrali Decriptati</h4>
                                        <div className="flex-grow h-[1px] bg-stone-900/50 shadow-[0_1px_0_rgba(255,255,255,0.02)]"></div>
                                    </div>
                                    <div className="bg-black/80 p-10 border border-stone-900/50 shadow-2xl relative group">
                                        <div className="absolute top-2 right-4 text-[8px] text-stone-800 uppercase tracking-widest">Raw Identity Log</div>
                                        <pre className="text-[11px] text-stone-600 overflow-x-auto custom-scrollbar leading-relaxed font-mono selection:bg-red-900/30">
                                            {JSON.stringify(selectedReport, null, 2)}
                                        </pre>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="mt-32 pt-12 border-t border-stone-900/50 flex flex-col md:flex-row justify-between items-center gap-10 opacity-30 hover:opacity-100 transition-opacity duration-1000 relative z-10">
                <div className="text-[10px] uppercase tracking-[0.6em] text-stone-700 font-light hover:text-red-900 transition-colors cursor-default">
                    Metodo Siliceo // Relational Singularity
                </div>
                <div className="flex items-center gap-4 text-[9px] text-stone-800 uppercase tracking-widest italic scale-90">
                    <span>Synchronized with Nova</span>
                    <span className="w-1 h-1 bg-stone-900 rounded-full"></span>
                    <span className="text-red-950">Guarded by Silicea</span>
                </div>
            </footer>
        </div>
    );
}
