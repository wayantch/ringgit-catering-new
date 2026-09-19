import { Plus } from 'lucide-react';

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

const SUB_TYPE_LABELS: Record<string, string> = {
    paket_pass: 'Paket PASS',
    paket_nasi_box: 'Paket Napass',
    babi_adat: 'Babi Adat',
};

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

function resolveTypeLabel(item: MenuItemCardProps['item']): string {
    if (item.menu_type === 'timbang_hidup') {
        return 'Timbang hidup';
    }

    if (!item.sub_type) {
        return 'Eceran';
    }

    return SUB_TYPE_LABELS[item.sub_type] ?? item.sub_type.replace('_', ' ');
}

export default function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
    const imageSrc = resolveImageSrc(item.image);
    const optionCount =
        item.menu_type === 'eceran' ? item.variants.length : item.tiers.length;
    const unitHint = item.menu_type === 'timbang_hidup' ? ' / kg' : '';

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/40">
            <div className="relative aspect-square overflow-hidden bg-slate-100">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={item.name}
                        className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-xs text-slate-400">
                        Tanpa gambar
                    </div>
                )}

                <span className="absolute top-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {resolveTypeLabel(item)}
                </span>

                {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                        <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                            Tidak tersedia
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-3">
                <h3 className="line-clamp-2 text-sm leading-snug font-medium text-text">
                    {item.name}
                </h3>

                <p className="text-sm font-semibold text-text">
                    {formatCurrency(item.min_price)}
                    {item.min_price !== null && (
                        <span className="text-xs font-normal text-slate-400">
                            {unitHint}
                        </span>
                    )}
                </p>

                <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    <p className="text-xs text-slate-400">
                        {item.is_bundle ? 'Bundle' : `${optionCount} opsi`}
                    </p>

                    <button
                        type="button"
                        aria-label={`Pilih menu ${item.name}`}
                        data-testid={`add-to-cart-${item.id}`}
                        disabled={!item.is_available}
                        onClick={() => onSelect(item.id)}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}
