import { Link } from '@inertiajs/react';
import { Gift, ShieldCheck, Truck } from 'lucide-react';
import { useState } from 'react';
import { checkout } from '@/routes/user';
import type { CartItem } from './CartItemCard';

interface Summary {
    subtotal: number | string | null;
    has_pending_price?: boolean;
    unique_code: number | string | null;
    total: number | string | null;
    dp_amount?: number | string | null;
    dp_unique_code?: number | string | null;
    remaining?: number | string | null;
    remaining_amount?: number | string | null;
    cashback_eligible?: boolean;
    cashback_breakdown?: Array<{
        menu_name: string;
        kode: 'A' | 'B' | 'C';
        cashback: number;
    }>;
    total_cashback?: number;
    ongkir_subsidi_eligible?: boolean;
    ongkir_subsidi_max?: number | null;
}

interface OrderSummaryCardProps {
    summary: Summary;
    cartItems: CartItem[];
}

function formatCurrency(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    return Number(value);
}

export default function OrderSummaryCard({
    summary,
    cartItems,
}: OrderSummaryCardProps) {
    const [mode, setMode] = useState<'full' | 'dp'>('full');

    const subtotalFromItems = cartItems.reduce(
        (totalValue, item) => totalValue + Number(item.subtotal ?? 0),
        0,
    );
    const subtotal = subtotalFromItems || toNumber(summary.subtotal);
    const uniqueCode = toNumber(summary.unique_code);
    const total = subtotal + uniqueCode;
    const dpAmount = Math.round(subtotal * 0.25);
    const dpUniqueCode = uniqueCode;
    const dpTotal = dpAmount + dpUniqueCode;
    const remaining = Math.max(total - dpTotal, 0);

    const timbangItems = cartItems.filter(
        (item) => item.menu_type === 'timbang_hidup',
    );
    const eceranItems = cartItems.filter((item) => item.menu_type === 'eceran');
    const timbangSubtotal = timbangItems.reduce(
        (totalValue, item) => totalValue + Number(item.subtotal ?? 0),
        0,
    );
    const eceranSubtotal = eceranItems.reduce(
        (totalValue, item) => totalValue + Number(item.subtotal ?? 0),
        0,
    );

    const cashbackBreakdown =
        summary.cashback_breakdown ??
        timbangItems
            .filter((item) => Number(item.tier?.cashback ?? 0) > 0)
            .map((item) => ({
                menu_name: item.menu_item.name,
                kode: (item.tier?.kode ?? 'A') as 'A' | 'B' | 'C',
                cashback: Number(item.tier?.cashback ?? 0),
            }));

    const totalCashback =
        summary.total_cashback ??
        cashbackBreakdown.reduce(
            (totalCashbackValue, item) => totalCashbackValue + item.cashback,
            0,
        );
    const cashbackEligible =
        summary.cashback_eligible ?? cashbackBreakdown.length > 0;
    const hasPendingPrice =
        summary.has_pending_price ??
        cartItems.some(
            (item) =>
                item.subtotal === null ||
                (item.menu_type === 'timbang_hidup' &&
                    item.harga_per_kg === null),
        );
    const ongkirEligible =
        summary.ongkir_subsidi_eligible ??
        cartItems.some((item) => item.menu_item?.free_ongkir_km !== null);
    const ongkirMaxValue = cartItems.reduce(
        (max, item) => Math.max(max, item.menu_item?.free_ongkir_km ?? 0),
        0,
    );
    const ongkirMax = summary.ongkir_subsidi_max ?? (ongkirMaxValue || null);

    return (
        <aside className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:sticky lg:top-4">
            <div className="border-b border-black/5 px-4 py-4 sm:px-5">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase sm:tracking-[0.2em] sm:text-slate-400">
                    Ringkasan Pesanan
                </p>
                <h2 className="mt-1 text-lg font-semibold text-text">
                    Ringkasan Pesanan
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-slate-500">
                    Berikut adalah ringkasan pesanan untuk mengetahui total
                    pembayaran sebelum melanjutkan ke checkout.
                </p>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                {/* <div className="space-y-3 rounded-2xl bg-[#fbfaf6] p-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                            <span>
                                Timbang Hidup ({timbangItems.length} item)
                            </span>
                            <span className="font-medium text-text">
                                {formatCurrency(timbangSubtotal)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                            <span>
                                Eceran & Paket ({eceranItems.length} item)
                            </span>
                            <span className="font-medium text-text">
                                {formatCurrency(eceranSubtotal)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-slate-600">
                        <span>Kode Unik</span>
                        <span className="font-medium text-text">
                            + {uniqueCode}
                        </span>
                    </div>

                    {cashbackEligible && totalCashback > 0 && (
                        <div className="flex items-center justify-between gap-3 text-slate-600">
                            <span>Cashback</span>
                            <span className="font-medium text-text">
                                - {formatCurrency(totalCashback)}
                            </span>
                        </div>
                    )}

                    <div
                        className={`flex items-center justify-between gap-3 border-t border-black/5 pt-2 font-semibold ${
                            cashbackEligible && totalCashback > 0
                                ? 'text-slate-400'
                                : 'text-primary'
                        }`}
                    >
                        <span
                            className={
                                cashbackEligible && totalCashback > 0
                                    ? 'line-through'
                                    : ''
                            }
                        >
                            Total
                        </span>
                        <span
                            className={
                                cashbackEligible && totalCashback > 0
                                    ? 'line-through'
                                    : ''
                            }
                        >
                            {formatCurrency(mode === 'full' ? total : dpTotal)}
                        </span>
                    </div>

                    {cashbackEligible && totalCashback > 0 && (
                        <div className="flex items-center justify-between gap-3 font-semibold text-primary">
                            <span>Total setelah Cashback</span>
                            <span>
                                {formatCurrency(
                                    (mode === 'full' ? total : dpTotal) -
                                        totalCashback,
                                )}
                            </span>
                        </div>
                    )}
                </div> */}

                <div className="space-y-2 rounded-2xl border border-black/5 bg-white p-4 text-sm shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setMode('full')}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition sm:text-xs ${
                                mode === 'full'
                                    ? 'bg-primary text-white'
                                    : 'bg-secondary text-primary'
                            }`}
                        >
                            <ShieldCheck className="size-3.5" />
                            Bayar Penuh
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('dp')}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition sm:text-xs ${
                                mode === 'dp'
                                    ? 'bg-primary text-white'
                                    : 'bg-secondary text-primary'
                            }`}
                        >
                            <Gift className="size-3.5" />
                            DP 25%
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                            <span className="min-w-0">
                                Timbang Hidup ({timbangItems.length} item)
                            </span>
                            <span className="shrink-0 font-medium text-text">
                                {formatCurrency(timbangSubtotal)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                            <span className="min-w-0">
                                Eceran & Paket ({eceranItems.length} item)
                            </span>
                            <span className="shrink-0 font-medium text-text">
                                {formatCurrency(eceranSubtotal)}
                            </span>
                        </div>
                    </div>

                    {mode === 'full' ? (
                        <>
                            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                                <span>Kode unik</span>
                                <span className="font-medium text-text">
                                    + {uniqueCode}
                                </span>
                            </div>
                            {cashbackEligible && totalCashback > 0 && (
                                <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                                    <span>Cashback</span>
                                    <span className="font-medium text-text">
                                        - {formatCurrency(totalCashback)}
                                    </span>
                                </div>
                            )}
                            <div
                                className={`flex items-center justify-between gap-3 border-t border-black/5 pt-2 text-sm font-semibold ${
                                    cashbackEligible && totalCashback > 0
                                        ? 'text-slate-400'
                                        : 'text-primary'
                                }`}
                            >
                                <span
                                    className={
                                        cashbackEligible && totalCashback > 0
                                            ? 'line-through'
                                            : ''
                                    }
                                >
                                    Total
                                </span>
                                <span
                                    className={
                                        cashbackEligible && totalCashback > 0
                                            ? 'line-through'
                                            : ''
                                    }
                                >
                                    {formatCurrency(total)}
                                </span>
                            </div>
                            {cashbackEligible && totalCashback > 0 && (
                                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-primary">
                                    <span>Total setelah cashback</span>
                                    <span>
                                        {formatCurrency(total - totalCashback)}
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                                <span>DP 25%</span>
                                <span className="font-medium text-text">
                                    {formatCurrency(dpAmount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                                <span>Kode unik DP</span>
                                <span className="font-medium text-text">
                                    + {dpUniqueCode}
                                </span>
                            </div>
                            <hr className="my-2 border-black/5" />

                            <div className="flex items-center justify-between gap-3 text-sm font-semibold text-primary">
                                <span>Total DP</span>
                                <span>{formatCurrency(dpTotal)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                                <span>Sisa pelunasan</span>
                                <span className="font-medium text-text">
                                    {formatCurrency(remaining)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {hasPendingPrice && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Ada item dengan harga menyusul. Total akan dihitung
                        setelah dikonfirmasi.
                    </div>
                )}

                {ongkirEligible && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <div className="flex items-center gap-2 font-semibold">
                            <Truck className="size-4" />
                            Gratis Ongkir s/d {ongkirMax} km (Jabodetabek)
                        </div>
                    </div>
                )}

                {/* <p className="text-xs leading-5 text-slate-400">
                    {paymentLabel} dipilih hanya untuk tampilan ringkasan. Kode
                    unik final ditentukan saat simpan pesanan.
                </p> */}

                <Link
                    href={checkout()}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3.5 text-center text-base font-semibold text-white transition hover:bg-primary-600 sm:py-3 sm:text-sm"
                >
                    Lanjut Checkout
                </Link>
            </div>
        </aside>
    );
}
