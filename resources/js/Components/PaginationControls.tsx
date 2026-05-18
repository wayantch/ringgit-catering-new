import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationControlsProps {
    currentPage: number;
    lastPage: number;
    total: number;
    itemLabel?: string;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({
    currentPage,
    lastPage,
    total,
    itemLabel = 'item',
    onPageChange,
}: PaginationControlsProps) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-xs text-slate-600">
                Halaman <span className="font-semibold">{currentPage}</span>{' '}
                dari <span className="font-semibold">{lastPage}</span>
                <span className="mx-2 text-slate-300">•</span>
                Total <span className="font-semibold">{total}</span> {itemLabel}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:enabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:enabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
