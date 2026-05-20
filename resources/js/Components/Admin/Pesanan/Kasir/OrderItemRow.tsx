import { Trash2 } from 'lucide-react';

export interface OrderItemRowData {
    tempId: string;
    menu_item_id: number;
    menu_name: string;
    menu_category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    menu_unit: string;
    menu_image: string | null;
    base_price: number | null;
    qty: number;
    price: number | null;
    kondisi_produk: string;
    adat_type: string | null;
    notes: string;
    quantityStep: number;
    quantityBounds?: { min: number; max: number | null } | null;
}

interface Props {
    item: OrderItemRowData;
    isPendingRemoval: boolean;
    onStartRemove: (tempId: string) => void;
    onCancelRemove: () => void;
    onConfirmRemove: (tempId: string) => void;
    onIncrement: (tempId: string) => void;
    onDecrement: (tempId: string) => void;
}

const formatCurrency = (value: number | null): string => {
    if (value === null) {
        return 'Harga menyusul';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatQty = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 2,
    }).format(value);
};

const getBadgeClass = (value: string): string => {
    switch (value) {
        case 'adat':
            return 'bg-violet-50 text-violet-600';
        case 'saksang':
            return 'bg-red-50 text-red-600';
        case 'panggang':
            return 'bg-orange-50 text-orange-600';
        case 'sop':
            return 'bg-emerald-50 text-emerald-600';
        case 'mateng':
            return 'bg-emerald-50 text-emerald-600';
        case 'satuan':
            return 'bg-slate-100 text-slate-600';
        default:
            return 'bg-amber-50 text-amber-600';
    }
};

const getLabel = (value: string): string => {
    const labels: Record<string, string> = {
        adat: 'Adat',
        saksang: 'Saksang',
        panggang: 'Panggang',
        sop: 'Sop',
        mentah: 'Mentah',
        mateng: 'Mateng',
        satuan: 'Satuan',
    };

    return labels[value] ?? value;
};

export default function OrderItemRow({
    item,
    isPendingRemoval,
    onStartRemove,
    onCancelRemove,
    onConfirmRemove,
    onIncrement,
    onDecrement,
}: Props) {
    const subtotal = item.price === null ? null : item.price * item.qty;

    return (
        <div
            className={`rounded-2xl border bg-white p-4 shadow-sm transition ${isPendingRemoval ? 'border-red-200 bg-red-50/40' : 'border-black/5'}`}
        >
            {isPendingRemoval ? (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-white px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-red-600">
                            Yakin hapus?
                        </p>
                        <p className="text-xs text-red-500">
                            Item ini akan dihapus dari pesanan.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => onConfirmRemove(item.tempId)}
                            className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Ya
                        </button>
                        <button
                            type="button"
                            onClick={onCancelRemove}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-text transition hover:border-primary/20 hover:text-primary"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-secondary/60">
                        {item.menu_image ? (
                            <img
                                src={
                                    item.menu_image.startsWith('/')
                                        ? item.menu_image
                                        : `/storage/${item.menu_image}`
                                }
                                alt={item.menu_name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg">
                                🍽️
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-text">
                                    {item.menu_name}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getBadgeClass(item.kondisi_produk)}`}
                                    >
                                        {getLabel(item.kondisi_produk)}
                                    </span>
                                    {item.adat_type && (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                            {item.adat_type}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onStartRemove(item.tempId)}
                                className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>

                        {item.menu_category_type === 'timbang_hidup' && (
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>{item.menu_unit}</span>
                                <span>•</span>
                                <span>{formatQty(item.qty)} qty</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onDecrement(item.tempId)}
                                    className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-primary/20 hover:text-primary"
                                >
                                    -
                                </button>
                                <span className="min-w-14 rounded-xl bg-secondary/50 px-3 py-2 text-center text-sm font-semibold text-text">
                                    {formatQty(item.qty)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onIncrement(item.tempId)}
                                    className="flex size-9 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-600"
                                >
                                    +
                                </button>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-slate-400">Harga</p>
                                <p className="text-sm font-semibold text-text">
                                    {formatCurrency(item.price)}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Subtotal:{' '}
                                    {subtotal === null
                                        ? 'Menunggu harga'
                                        : formatCurrency(subtotal)}
                                </p>
                            </div>
                        </div>

                        {item.notes.trim() !== '' && (
                            <p className="text-xs text-slate-500 italic">
                                {item.notes}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
