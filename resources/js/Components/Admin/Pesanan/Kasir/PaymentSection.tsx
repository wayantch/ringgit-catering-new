import { BadgeInfo, CreditCard, Sparkles } from 'lucide-react';

interface Calculation {
    isPending: boolean;
    subtotal: number;
    uniqueCode: number;
    cashback: number;
    total: number;
    dpUniqueCode: number;
    dpAmount: number;
    remaining: number;
}

interface Props {
    paymentMethod: 'full' | 'dp';
    onPaymentMethodChange: (value: 'full' | 'dp') => void;
    calculation: Calculation;
    canSubmit: boolean;
    processing: boolean;
    onSubmit: () => void;
    error?: string;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function PaymentSection({
    paymentMethod,
    onPaymentMethodChange,
    calculation,
    canSubmit,
    processing,
    onSubmit,
    error,
}: Props) {
    return (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                    Metode Pembayaran
                </p>
                <h3 className="mt-1 text-lg font-semibold text-text">
                    Ringkasan pembayaran
                </h3>
            </div>

            <div className="mt-4 flex rounded-full bg-secondary/70 p-1">
                <button
                    type="button"
                    onClick={() => onPaymentMethodChange('full')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${paymentMethod === 'full' ? 'bg-primary text-white' : 'text-text'}`}
                >
                    <CreditCard className="size-3.5" />
                    Bayar Full
                </button>
                <button
                    type="button"
                    onClick={() => onPaymentMethodChange('dp')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${paymentMethod === 'dp' ? 'bg-primary text-white' : 'text-text'}`}
                >
                    <BadgeInfo className="size-3.5" />
                    DP 25%
                </button>
            </div>

            {calculation.isPending ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    Ada item harga menyusul. Total akan dihitung setelah harga
                    dikonfirmasi.
                </div>
            ) : (
                <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                            <span>Subtotal pesanan</span>
                            <span className="font-semibold text-text">
                                {formatCurrency(calculation.subtotal)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span>Kode unik</span>
                            <span className="font-semibold text-text">
                                + {formatCurrency(calculation.uniqueCode)}
                            </span>
                        </div>
                        {paymentMethod === 'full' &&
                            calculation.cashback > 0 && (
                                <div className="flex items-center justify-between gap-3">
                                    <span>Cashback</span>
                                    <span className="font-semibold text-emerald-600">
                                        - {formatCurrency(calculation.cashback)}
                                    </span>
                                </div>
                            )}
                        <div className="border-t border-dashed border-slate-200 pt-2">
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-semibold text-text">
                                    Total
                                </span>
                                <span className="text-base font-bold text-text">
                                    {formatCurrency(calculation.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {paymentMethod === 'dp' && (
                        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                            <div className="mb-3 flex items-center gap-2 text-primary">
                                <Sparkles className="size-4" />
                                <p className="text-sm font-semibold">DP 25%</p>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Nominal DP</span>
                                    <span className="font-semibold text-text">
                                        {formatCurrency(
                                            calculation.subtotal * 0.25,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Kode Unik DP</span>
                                    <span className="font-semibold text-text">
                                        +{' '}
                                        {formatCurrency(
                                            calculation.dpUniqueCode,
                                        )}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-primary/20 pt-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold text-text">
                                            Total DP
                                        </span>
                                        <span className="text-base font-bold text-primary">
                                            {formatCurrency(
                                                calculation.dpAmount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Sisa Pelunasan</span>
                                    <span className="font-semibold text-text">
                                        {formatCurrency(calculation.remaining)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-400">
                        Kode unik final ditentukan saat pesanan disimpan.
                    </p>
                </div>
            )}

            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="size-4" />
                    </div>
                    <p className="text-sm text-slate-600">
                        Pesanan akan disimpan sebagai input kasir. Semua nilai
                        pembayaran dihitung otomatis di service.
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit || processing}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                {processing ? 'Menyimpan...' : 'Simpan Pesanan'}
            </button>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    );
}
