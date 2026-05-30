import { ArrowRight, Package, ShoppingCart } from 'lucide-react';

interface MenuItemCardProps {
    item: {
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        menu_type: 'timbang_hidup' | 'eceran';
        sub_type:
            | 'paket_pass'
            | 'paket_nasi_box'
            | 'babi_adat'
            | 'saksang'
            | 'panggang'
            | 'sop_tulang'
            | null;
        is_bundle: boolean;
        bundle_desc: string | null;
        is_available: boolean;
        min_price: number | null;
        category?: {
            name: string | null;
        } | null;
        tiers: Array<{
            id: string;
            kode: string;
            berat_min: number;
            berat_max: number | null;
        }>;
        variants: Array<{ id: string; label: string; harga: number }>;
    };
    onSelect: (
        menuId: string,
        opts?: { variantId?: string | null; quantity?: number | null },
    ) => void;
}

function resolveImageSrc(image: string | null): string | null {
    if (!image) {
        return null;
    }

    if (
        image.startsWith('http://') ||
        image.startsWith('https://') ||
        image.startsWith('/')
    ) {
        return image;
    }

    return `/storage/${image}`;
}

function formatCurrency(value: number | null): string {
    if (value === null) {
        return 'Harga menyusul';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

const SUB_TYPE_CONFIG: Record<
    string,
    { label: string; cls: string; emoji?: string }
> = {
    paket_pass: {
        label: 'Paket PASS',
        cls: 'bg-violet-50 text-violet-700',
        emoji: '🎁',
    },
    paket_nasi_box: {
        label: 'Paket Napass',
        cls: 'bg-amber-50 text-amber-700',
        emoji: '🍱',
    },
    babi_adat: {
        label: 'Babi Adat',
        cls: 'bg-rose-50 text-rose-700',
        emoji: '🏺',
    },
};

function renderTypeLabel(
    item: MenuItemCardProps['item'],
): JSX.Element | string {
    if (item.menu_type === 'timbang_hidup') {
        return (
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                Timbang hidup
            </span>
        );
    }

    if (!item.sub_type) {
        return (
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                Eceran
            </span>
        );
    }

    const cfg = SUB_TYPE_CONFIG[item.sub_type];

    if (cfg) {
        return (
            <span
                className={`${cfg.cls} inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold`}
            >
                {cfg.emoji} {cfg.label}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
            {item.sub_type.replace('_', ' ')}
        </span>
    );
}

export default function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
    const imageSrc = resolveImageSrc(item.image);
    const optionCount =
        item.menu_type === 'eceran' ? item.variants.length : item.tiers.length;

    return (
        <article className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_54px_-32px_rgba(15,23,42,0.55)]">
            <div className="relative aspect-video overflow-hidden bg-slate-100">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eef2ea_0%,#f8f7f2_100%)] text-xs text-slate-400">
                        Gambar belum tersedia
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(17,24,39,0.14),transparent_42%)]" />

                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                        {renderTypeLabel(item)}
                    </span>
                    {item.is_bundle && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
                            <Package className="h-3.5 w-3.5" />
                            Bundle
                        </span>
                    )}
                </div>

                {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                            Tidak tersedia
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-3 p-5">
                <div>
                    <h3 className="line-clamp-2 text-base leading-6 font-semibold text-text">
                        {item.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {item.description ||
                            item.category?.name ||
                            'Menu pilihan'}
                    </p>
                </div>

                <div className="text-[11px] text-slate-500">
                    {item.bundle_desc && (
                        <span className="line-clamp-1 rounded-lg bg-slate-100 px-2.5 py-1 font-medium">
                            {item.bundle_desc}
                        </span>
                    )}
                </div>
                <hr className="my-4 border-slate-200" />

                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                            Mulai dari
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                            {formatCurrency(item.min_price)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                            {item.is_bundle
                                ? 'Bundle siap pilih'
                                : `${optionCount} opsi tersedia`}
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label={`Pilih menu ${item.name}`}
                        data-testid={`add-to-cart-${item.id}`}
                        disabled={!item.is_available}
                        onClick={() => onSelect(item.id)}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Pilih
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}
