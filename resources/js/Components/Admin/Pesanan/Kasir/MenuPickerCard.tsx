import { Plus, Minus, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type CategoryType = 'timbang_hidup' | 'olahan' | 'eceran';

export interface MenuPickerCardItem {
    id: number;
    name: string;
    image: string | null;
    base_price: number | null;
    unit: string;
    is_available: boolean;
    tiers: Array<{
        id: string;
        kode: string;
        is_half: boolean;
        berat_min: number;
        berat_max: number | null;
        harga_mentah: number;
        harga_matang: number;
        cashback: number;
    }>;
    category: {
        id: number;
        name: string;
        type: CategoryType;
    };
}

interface Props {
    item: MenuPickerCardItem;
    quantity: number;
    onAdd: (item: MenuPickerCardItem) => void;
    onIncrement: (item: MenuPickerCardItem) => void;
    onDecrement: (item: MenuPickerCardItem) => void;
}

const CATEGORY_BADGE: Record<CategoryType, string> = {
    timbang_hidup: 'bg-amber-50 text-amber-700',
    olahan: 'bg-emerald-50 text-emerald-700',
    eceran: 'bg-blue-50 text-blue-700',
};

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

function MenuImageFallback({ item }: { item: MenuPickerCardItem }): ReactNode {
    return (
        <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm ring-1 ring-black/5">
                🍽️
            </div>
            <div className="sr-only">{item.name}</div>
        </div>
    );
}

function resolveDisplayPrice(item: MenuPickerCardItem): number | null {
    if (item.menu_type !== 'timbang_hidup') {
        return item.base_price;
    }

    if (item.tiers.length === 0) {
        return item.base_price;
    }

    return item.tiers.reduce<number | null>((lowest, tier) => {
        const current = Number(tier.harga_mentah);

        if (lowest === null) {
            return current;
        }

        return current < lowest ? current : lowest;
    }, null);
}

export default function MenuPickerCard({
    item,
    quantity,
    onAdd,
    onIncrement,
    onDecrement,
}: Props) {
    const isActive = quantity > 0;
    const displayPrice = resolveDisplayPrice(item);

    return (
        <article
            className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isActive ? 'ring-2 ring-primary/30' : ''} ${!item.is_available ? 'opacity-75' : ''}`}
        >
            <div className="relative aspect-4/3 overflow-hidden bg-secondary/40">
                {item.image ? (
                    <img
                        src={
                            item.image.startsWith('/')
                                ? item.image
                                : `/storage/${item.image}`
                        }
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <MenuImageFallback item={item} />
                )}

                {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 backdrop-blur-[1px]">
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                            Tidak Tersedia
                        </span>
                    </div>
                )}

                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_BADGE[item.category.type]}`}
                    >
                        {item.category.name}
                    </span>
                    {item.base_price === null && (
                        <span className="rounded-full bg-accent-2/10 px-2.5 py-1 text-[11px] font-semibold text-accent-2">
                            Harga Menyusul
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-text">
                            {item.name}
                        </h3>
                        {isActive && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                                Aktif
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400">Per {item.unit}</p>
                    <p className="text-sm font-semibold text-text">
                        {formatCurrency(displayPrice)}
                    </p>
                </div>

                {!item.is_available ? (
                    <button
                        type="button"
                        disabled
                        className="flex w-full items-center justify-center rounded-xl bg-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500"
                    >
                        Tidak Tersedia
                    </button>
                ) : isActive ? (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onDecrement(item)}
                            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-primary/20 hover:text-primary"
                        >
                            <Minus className="size-4" />
                        </button>
                        <div className="min-w-0 flex-1 rounded-xl bg-secondary/60 px-3 py-2 text-center">
                            <p className="text-sm font-semibold text-text">
                                {quantity}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onIncrement(item)}
                            className="flex size-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-600"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => onAdd(item)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
                    >
                        <Plus className="size-4" />
                        Tambah
                        <ChevronRight className="size-4" />
                    </button>
                )}
            </div>
        </article>
    );
}
