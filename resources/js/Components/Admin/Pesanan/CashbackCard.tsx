import { Gift } from 'lucide-react';
import React from 'react';

interface BreakdownItem {
    menu_name: string;
    kode: 'A' | 'B' | 'C';
    cashback: number;
}

interface Props {
    has_cashback: boolean;
    cashback_breakdown: BreakdownItem[];
    total_cashback: number;
    payment_method: 'full' | 'dp' | null;
}

const fmt = (n: number | null) =>
    n === null
        ? '—'
        : new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
          }).format(n);

export default function CashbackCard({
    has_cashback,
    cashback_breakdown,
    total_cashback,
    payment_method,
}: Props) {
    if (
        !has_cashback ||
        total_cashback <= 0 ||
        payment_method !== 'full'
    ) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <span className="text-xl">
                        <Gift className="h-5 w-5 text-slate-400" />
                    </span>
                    <span>Cashback Full Payment</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    ✓ Cashback Diberikan
                </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
                {cashback_breakdown.map((b) => (
                    <div
                        key={`${b.menu_name}-${b.kode}`}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <div className="font-medium">
                                {b.menu_name} (Gol. {b.kode})
                            </div>
                        </div>
                        <div className="font-semibold text-primary">
                            {fmt(b.cashback)}
                        </div>
                    </div>
                ))}

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 font-semibold text-primary">
                    <span>Total Cashback</span>
                    <span>{fmt(total_cashback)}</span>
                </div>
            </div>
        </div>
    );
}
