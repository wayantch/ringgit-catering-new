import { ShoppingCart } from 'lucide-react';
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

export default function MenuPickerCard({ item, quantity, onAdd }: Props) {
    const isActive = quantity > 0;
    const displayPrice = resolveDisplayPrice(item);

    return (
        <article className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)]">
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
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

                {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                            Tidak tersedia
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-sm leading-6 font-semibold text-text sm:text-base">
                            {item.name}
                        </h3>
                        {isActive && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                                Aktif
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">
                        {item.category.name}
                    </p>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                            Harga
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary sm:text-base">
                            {formatCurrency(displayPrice)}
                        </p>
                    </div>

                    {!item.is_available ? (
                        <button
                            type="button"
                            disabled
                            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-slate-200 px-4 text-sm font-semibold text-slate-500"
                        >
                            Tidak Tersedia
                        </button>
                    ) : isActive ? (
                        <div className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 text-sm font-semibold text-primary">
                            Sudah dipilih
                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-text shadow-sm ring-1 ring-black/5">
                                {quantity}
                            </span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onAdd(item)}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Tambah
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
