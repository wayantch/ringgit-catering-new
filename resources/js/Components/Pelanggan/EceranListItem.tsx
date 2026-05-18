import { ShoppingCart } from 'lucide-react';

interface Props {
    item: {
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        is_available: boolean;
        min_price: number | null;
        variants: Array<{ id?: string; label: string; harga: number | null }>;
        category?: { name: string | null } | null;
    };
    onSelect: (
        id: string,
        opts?: { variantId?: string | null; quantity?: number | null },
    ) => void;
}

function resolveImageSrc(image: string | null): string | null {
    if (!image) return null;
    if (
        image.startsWith('http://') ||
        image.startsWith('https://') ||
        image.startsWith('/')
    )
        return image;
    return `/storage/${image}`;
}

function formatCurrency(value: number | null): string {
    if (value === null) return 'Harga menyusul';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export default function EceranListItem({ item, onSelect }: Props) {
    const img = resolveImageSrc(item.image);
    const price = item.min_price ?? item.variants?.[0]?.harga ?? null;

    return (
        <div className="flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-slate-50">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {img ? (
                    <img
                        src={img}
                        alt={item.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Gambar
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold text-text">
                        {item.name}
                    </h3>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                            {formatCurrency(price)}
                        </p>
                    </div>
                </div>

                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {item.description ?? item.category?.name ?? ''}
                </p>
            </div>

            <div className="flex items-center">
                <button
                    type="button"
                    aria-label={`Pilih ${item.name}`}
                    onClick={() =>
                        onSelect(item.id, {
                            variantId: item.variants?.[0]?.id ?? null,
                            quantity: 1,
                        })
                    }
                    disabled={!item.is_available}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-sm hover:bg-primary/5 disabled:opacity-50"
                >
                    <ShoppingCart className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
