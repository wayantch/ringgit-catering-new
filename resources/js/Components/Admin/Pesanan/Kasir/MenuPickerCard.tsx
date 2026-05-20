import { ArrowRight, Package, Plus, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';

type CategoryType = 'timbang_hidup' | 'olahan' | 'eceran';

export interface MenuPickerCardItem {
    id: number;
    name: string;
    image: string | null;
    menu_type: CategoryType;
    sub_type:
        | 'babi_adat'
        | 'paket_pass'
        | 'paket_nasi_box'
        | 'saksang'
        | 'panggang'
        | 'sop_tulang'
        | null;
    base_price: number | null;
    babi_mentah_price: number | null;
    babi_matang_price: number | null;
    bundle_desc: string | null;
    free_ongkir_km: number | null;
    unit: string;
    is_available: boolean;
    variants: Array<{
        id: string;
        label: string;
        harga: number;
    }>;
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
        <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eef2ea_0%,#f8f7f2_100%)] text-xs text-slate-400">
            Gambar belum tersedia
            <div className="sr-only">{item.name}</div>
        </div>
    );
}

function resolveDisplayPrice(item: MenuPickerCardItem): number | null {
    if (item.menu_type !== 'timbang_hidup') {
        if (item.sub_type === 'babi_adat') {
            const prices = [
                item.babi_mentah_price,
                item.babi_matang_price,
                item.base_price,
            ].filter((price): price is number => price !== null);

            return prices.length > 0 ? Math.min(...prices) : null;
        }

        const prices = [
            ...item.variants.map((variant) => variant.harga),
            item.base_price,
        ].filter((price): price is number => price !== null);

        return prices.length > 0 ? Math.min(...prices) : null;
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
        <article className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
            <div className="relative aspect-video overflow-hidden bg-slate-100">
                {item.image ? (
                    <img
                        src={
                            item.image.startsWith('/')
                                ? item.image
                                : `/storage/${item.image}`
                        }
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <MenuImageFallback item={item} />
                )}

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(17,24,39,0.14),transparent_42%)]" />

                {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                            Tidak tersedia
                        </span>
                    </div>
                )}

                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                        {item.category.name}
                    </span>
                </div>
            </div>

            <div className="space-y-2 p-5">
                <div>
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-base leading-6 font-semibold text-text">
                            {item.name}
                        </h3>
                        {isActive && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                                Aktif
                            </span>
                        )}
                    </div>
                    {/* <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {item.bundle_desc ||
                            item.category.name ||
                            'Menu pilihan'}
                    </p> */}
                </div>

                {/* <div className="text-[11px] text-slate-500">
                    {item.bundle_desc && (
                        <span className="line-clamp-1 rounded-lg bg-slate-100 px-2.5 py-1 font-medium">
                            {item.bundle_desc}
                        </span>
                    )}
                </div> */}

                <hr className="my-4 border-slate-200" />

                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                            Mulai dari
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                            {formatCurrency(displayPrice)}
                        </p>
                    </div>

                    {!item.is_available ? (
                        <button
                            type="button"
                            disabled
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-200 px-4 text-sm font-semibold text-slate-500"
                        >
                            Tidak Tersedia
                        </button>
                    ) : isActive ? (
                        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 text-sm font-semibold text-primary">
                            Sudah dipilih
                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-text shadow-sm ring-1 ring-black/5">
                                {quantity}
                            </span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onAdd(item)}
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Tambah
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
