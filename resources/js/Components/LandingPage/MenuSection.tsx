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
        price: 'Rp 45.000 / kg',
        badge: 'Populer',
    },
    {
        Icon: UtensilsCrossed,
        cat: 'Olahan',
        name: 'Rendang daging sapi',
        price: 'Rp 35.000 / porsi',
        badge: null,
    },
    {
        Icon: Leaf,
        cat: 'Timbang hidup',
        name: 'Gurame air tawar',
        price: 'Rp 55.000 / kg',
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
                            Sajian{' '}
                            <span className="font-medium">terpopuler</span>
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
                                base_price,
                                unit,
                                description,
                                image,
                                Icon,
                                cat,
                                price,
                                badge,
                                ...rest
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
                                (base_price
                                    ? `Rp ${Math.round(base_price).toLocaleString('id-ID')} / ${unit}`
                                    : `${unit}`);
                            const imageSrc = resolveImageSrc(image);
                            const finalName = name;

                            return (
                                <FadeUp key={id || finalName} delay={i * 0.07}>
                                    <div
                                        onClick={handleMenuClick}
                                        className="group cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                    >
                                        {/* image container */}
                                        <div className="relative flex h-54 items-center justify-center overflow-hidden bg-[#eef2eb]">
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
                                        <div className="p-4">
                                            <p className="mb-1 text-[11px] font-medium tracking-wide text-primary uppercase">
                                                {category_type || cat}
                                            </p>
                                            <h3 className="text-test mb-3 text-[14px] font-semibold">
                                                {finalName}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[13px] font-semibold text-primary/80">
                                                    {priceText}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMenuClick();
                                                    }}
                                                    className="group/btn flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-secondary transition-colors duration-200 hover:bg-primary hover:text-white"
                                                >
                                                    <ArrowRight
                                                        size={14}
                                                        color="#7a8f6b"
                                                        className="group-hover/btn:text-white"
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
