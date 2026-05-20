import { router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Props {
    filters: { dari?: string; sampai?: string; tanggal?: string };
    onApply: (params: Record<string, string | undefined>) => void;
    onReset: () => void;
}

export default function PrintFilterBar({ filters, onApply, onReset }: Props) {
    const [mode, setMode] = useState(filters.tanggal ? 'single' : 'range');
    const [tanggal, setTanggal] = useState(filters.tanggal ?? '');
    const [dari, setDari] = useState(filters.dari ?? '');
    const [sampai, setSampai] = useState(filters.sampai ?? '');

    const apply = () => {
        if (mode === 'single') {
            onApply({ tanggal: tanggal || undefined });
        } else {
            onApply({ dari: dari || undefined, sampai: sampai || undefined });
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <label
                    className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${mode === 'single' ? 'bg-primary text-white' : 'border bg-white'}`}
                    onClick={() => setMode('single')}
                >
                    Tanggal Tertentu
                </label>
                <label
                    className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${mode === 'range' ? 'bg-primary text-white' : 'border bg-white'}`}
                    onClick={() => setMode('range')}
                >
                    Rentang Tanggal
                </label>
            </div>

            {mode === 'single' ? (
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="rounded-xl border px-3 py-2"
                    />
                    <button
                        type="button"
                        onClick={apply}
                        className="rounded-xl bg-primary px-4 py-2 text-white"
                    >
                        Terapkan
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-xl border px-4 py-2"
                    >
                        Reset
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dari}
                        onChange={(e) => setDari(e.target.value)}
                        className="rounded-xl border px-3 py-2"
                    />
                    <span className="text-sm">s/d</span>
                    <input
                        type="date"
                        value={sampai}
                        onChange={(e) => setSampai(e.target.value)}
                        className="rounded-xl border px-3 py-2"
                    />
                    <button
                        type="button"
                        onClick={apply}
                        className="rounded-xl bg-primary px-4 py-2 text-white"
                    >
                        Terapkan
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-xl border px-4 py-2"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
