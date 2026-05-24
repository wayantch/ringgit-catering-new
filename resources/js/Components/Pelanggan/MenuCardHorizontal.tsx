import { router } from '@inertiajs/react';
import keranjang from '@/routes/user/keranjang';

interface MenuCardHorizontalProps {
    menu: {
        id: number;
        name: string;
        image: string | null;
        base_price: string | number | null;
        is_available: boolean;
    };
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

function formatCurrency(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return 'Harga menyusul';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}
export default function MenuCardHorizontal({ menu }: MenuCardHorizontalProps) {
    const imageSrc = resolveImageSrc(menu.image);

    const onAddToCart = (): void => {
        if (!menu.is_available) {
            return;
        }

        router.post(
            keranjang.store(),
            {
                menu_item_id: menu.id,
                kondisi_produk: 'mentah',
                quantity: 1,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <article className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
            <div className="relative aspect-square overflow-hidden bg-slate-100">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={menu.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eef2ea_0%,#f8f7f2_100%)] text-xs text-slate-400">
                        Gambar belum tersedia
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(17,24,39,0.16),transparent_46%)]" />

                {!menu.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                            Tidak Tersedia
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-3 p-3">
                <h3 className="line-clamp-2 text-sm leading-5 font-semibold text-text">
                    {menu.name}
                </h3>

                <div className="flex items-center justify-between gap-2">
                    {menu.base_price === null ? (
                        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                            Harga Menyusul
                        </span>
                    ) : (
                        <span className="text-sm font-semibold text-primary">
                            {formatCurrency(menu.base_price)}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onAddToCart}
                        disabled={!menu.is_available}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        +
                    </button>
                </div>
            </div>
        </article>
    );
}
