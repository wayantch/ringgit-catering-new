import { router } from '@inertiajs/react';
import {
    Package,
    Leaf,
    UtensilsCrossed,
    ArrowRight,
    ChevronRight,
} from 'lucide-react';
import FadeUp from '../Common/FadeUp';

const MENU_ITEMS = [
    {
        Icon: Leaf,
        cat: 'Timbang hidup',
        name: 'Ayam kampung segar',
        price: 'Rp 45.000',
        badge: 'Populer',
    },
    {
        Icon: UtensilsCrossed,
        cat: 'Olahan',
        name: 'Rendang daging sapi',
        price: 'Rp 35.000',
        badge: null,
    },
    {
        Icon: Leaf,
        cat: 'Timbang hidup',
        name: 'Gurame air tawar',
        price: 'Rp 55.000',
        badge: null,
    },
];

function resolveImageSrc(image: string | null | undefined): string | null {
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

function resolveCategoryLabel(
    categoryType?: string,
    categoryName?: string,
    menuType?: string,
    subType?: string,
): string {
    const labels: Record<string, string> = {
        timbang_hidup: 'Timbang Hidup',
        olahan: 'Olahan',
        eceran: 'Eceran',
    };

    const typeLabel = labels[categoryType ?? ''] ?? categoryType ?? 'Menu';
    const nameLabel = categoryName ?? menuType ?? subType ?? '';

    if (!nameLabel) {
        return typeLabel;
    }

    return `${typeLabel} • ${nameLabel}`;
}

interface MenuSectionProps {
    menuItems?: any[];
    handleMenuClick: () => void;
}

export default function MenuSection({
    menuItems = [],
    handleMenuClick,
}: MenuSectionProps) {
    return (
        <section id="menu-section" className="bg-bg px-5 py-16">
            <div className="mx-auto max-w-6xl">
                <FadeUp className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="mb-2 text-[11px] font-semibold tracking-widest text-primary uppercase">
                            Menu pilihan
                        </p>
                        <h2 className="text-test text-2xl font-light md:text-3xl">
                            Sajian <span className="font-medium">terlaris</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => router.visit('/user/menu')}
                        className="hidden cursor-pointer items-center gap-1.5 border-0 bg-transparent text-[13px] font-medium text-primary transition-all duration-200 hover:gap-2.5 md:flex"
                    >
                        Lihat semua <ChevronRight size={15} />
                    </button>
                </FadeUp>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {(menuItems && menuItems.length > 0
                        ? menuItems
                        : MENU_ITEMS
                    ).map(
                        (
                            {
                                id,
                                name,
                                category_type,
                                menu_type,
                                sub_type,
                                base_price,
                                min_price,
                                price_label,
                                description,
                                image,
                                Icon,
                                cat,
                                price,
                                badge,
                            }: any,
                            i,
                        ) => {
                            // Handle both formats
                            let FinalIcon = Icon || Package;

                            if (
                                category_type === 'timbang_hidup' ||
                                cat === 'Timbang hidup'
                            ) {
                                FinalIcon = Leaf;
                            } else if (
                                category_type === 'olahan' ||
                                cat === 'Olahan'
                            ) {
                                FinalIcon = UtensilsCrossed;
                            }

                            const finalBadge =
                                badge ||
                                (i === 0
                                    ? 'Populer'
                                    : i === 1
                                      ? 'Favorit'
                                      : null);
                            const priceText =
                                price ||
                                price_label ||
                                (base_price !== null && base_price !== undefined
                                    ? `Rp ${Math.round(base_price).toLocaleString('id-ID')}`
                                    : min_price !== null &&
                                        min_price !== undefined
                                      ? `Rp ${Math.round(min_price).toLocaleString('id-ID')}`
                                      : 'Harga menyusul');
                            const imageSrc = resolveImageSrc(image);
                            const finalName = name;
                            const categoryLabel = resolveCategoryLabel(
                                category_type,
                                cat,
                                menu_type,
                                sub_type,
                            );

                            return (
                                <FadeUp key={id || finalName} delay={i * 0.07}>
                                    <div
                                        onClick={handleMenuClick}
                                        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-black/5 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        {/* image container */}
                                        <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-[#eef2eb]">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={finalName}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <FinalIcon
                                                    size={36}
                                                    color="#7a8f6b"
                                                    className="opacity-40 transition-transform duration-300 group-hover:scale-110"
                                                />
                                            )}
                                            {finalBadge && (
                                                <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                                                    {finalBadge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col p-4">
                                            <p className="mb-1 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                                                {categoryLabel}
                                            </p>
                                            <h3 className="text-test text-[15px] leading-6 font-semibold">
                                                {finalName}
                                            </h3>

                                            <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
                                                {description ||
                                                    'Sajian pilihan dengan rasa autentik dan kualitas terbaik.'}
                                            </p>

                                            <div className="mt-4 flex flex-1 flex-col justify-end gap-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[13px] font-semibold text-primary/80">
                                                        {priceText}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMenuClick();
                                                    }}
                                                    className="group/btn inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary/90"
                                                >
                                                    Pesan sekarang
                                                    <ArrowRight
                                                        size={14}
                                                        color="#fff"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </FadeUp>
                            );
                        },
                    )}
                </div>
            </div>
        </section>
    );
}
