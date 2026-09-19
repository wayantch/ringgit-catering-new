import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Home,
    ShoppingCart,
    User,
    UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { beranda, menu } from '@/routes/user';
import keranjang from '@/routes/user/keranjang';
import pesanan from '@/routes/user/pesanan';
import { index as profilIndex } from '@/routes/user/profil';
import type { RouteDefinition } from '@/wayfinder';

interface SharedProps {
    cartCount?: number;
    // Inertia's PageProps constraint expects an index signature.
    [key: string]: unknown;
}

const TABS = [
    { name: 'Beranda', path: '/user/beranda', icon: Home, href: beranda() },
    { name: 'Menu', path: '/user/menu', icon: UtensilsCrossed, href: menu() },
    {
        name: 'Keranjang',
        path: '/user/keranjang',
        icon: ShoppingCart,
        href: keranjang.index(),
    },
    {
        name: 'Pesanan',
        path: '/user/pesanan',
        icon: ClipboardList,
        href: pesanan.index(),
    },
    { name: 'Profil', path: '/user/profil', icon: User, href: profilIndex() },
];

/**
 * Mobile and tablet navigation. Desktop uses TopNavbar instead, so this is
 * hidden from `lg` up.
 */
export default function BottomNavbar() {
    const { url, props } = usePage<SharedProps>();
    const cartCount = props.cartCount ?? 0;

    const isActive = (tabPath: string): boolean => url.startsWith(tabPath);

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
            <ul className="mx-auto flex h-16 max-w-md items-stretch">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab.path);

                    return (
                        <li key={tab.name} className="flex-1">
                            <Link
                                href={tab.href as RouteDefinition<'get'>}
                                aria-current={active ? 'page' : undefined}
                                className="flex h-full flex-col items-center justify-center gap-1"
                            >
                                <span className="relative">
                                    <Icon
                                        className={cn(
                                            'size-5 transition-colors',
                                            active
                                                ? 'text-primary'
                                                : 'text-slate-400',
                                        )}
                                    />
                                    {tab.name === 'Keranjang' &&
                                        cartCount > 0 && (
                                            <span className="absolute -top-1.5 -right-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] leading-4 font-semibold text-white">
                                                {cartCount > 99
                                                    ? '99+'
                                                    : cartCount}
                                            </span>
                                        )}
                                </span>
                                <span
                                    className={cn(
                                        'text-[11px] transition-colors',
                                        active
                                            ? 'font-semibold text-primary'
                                            : 'text-slate-500',
                                    )}
                                >
                                    {tab.name}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
