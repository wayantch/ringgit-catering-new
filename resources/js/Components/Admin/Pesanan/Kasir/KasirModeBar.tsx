import { BadgeCheck, Minimize2, ShoppingBag, Users, X } from 'lucide-react';

interface Props {
    itemCount: number;
    total: number;
    isPending: boolean;
    customerTypeLabel: string;
    paymentMethodLabel: string;
    isFullscreen: boolean;
    onExit: () => void;
}

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

export default function KasirModeBar({
    itemCount,
    total,
    isPending,
    customerTypeLabel,
    paymentMethodLabel,
    isFullscreen,
    onExit,
}: Props) {
    return (
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white uppercase">
                    <ShoppingBag className="size-3.5" />
                    Mode Kasir
                </span>
                {!isFullscreen && (
                    <span className="hidden text-[11px] text-slate-400 sm:inline">
                        Layar penuh tidak tersedia di browser ini
                    </span>
                )}
            </div>

            <dl className="flex flex-1 flex-wrap items-center justify-end gap-2 text-xs sm:gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                    <Users className="size-3.5 text-primary" />
                    <dt className="sr-only">Mode pelanggan</dt>
                    <dd className="font-semibold">{customerTypeLabel}</dd>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                    <BadgeCheck className="size-3.5 text-primary" />
                    <dt className="sr-only">Metode pembayaran</dt>
                    <dd className="font-semibold">{paymentMethodLabel}</dd>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                    <dt className="sr-only">Item dipilih</dt>
                    <dd className="font-semibold">{itemCount} item</dd>
                    <dt className="sr-only">Total</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                        {isPending ? 'Harga menyusul' : formatCurrency(total)}
                    </dd>
                </div>
            </dl>

            <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
                {isFullscreen ? (
                    <Minimize2 className="size-3.5" />
                ) : (
                    <X className="size-3.5" />
                )}
                Keluar
                <kbd className="ml-0.5 hidden rounded border border-slate-200 bg-slate-50 px-1 font-sans text-[10px] text-slate-400 sm:inline">
                    Esc
                </kbd>
            </button>
        </header>
    );
}
