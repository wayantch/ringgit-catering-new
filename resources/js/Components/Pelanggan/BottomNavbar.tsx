import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    UtensilsCrossed,
    ShoppingCart,
    ClipboardList,
    User,
} from 'lucide-react';
import { beranda, menu } from '@/routes/user';
import keranjang from '@/routes/user/keranjang';
import pesanan from '@/routes/user/pesanan';
import { index as profilIndex } from '@/routes/user/profil';
import type { RouteDefinition } from '@/wayfinder';

interface SharedProps {
    cartCount?: number;
}

export default function BottomNavbar() {
    const { url, props } = usePage<SharedProps>();
    const cartCount = props.cartCount ?? 0;

    const tabs = [
        { name: 'Beranda', path: '/user/beranda', icon: Home, href: beranda() },
        {
            name: 'Menu',
            path: '/user/menu',
            icon: UtensilsCrossed,
            href: menu(),
        },
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
        {
            name: 'Profil',
            path: '/user/profil',
            icon: User,
            href: profilIndex(),
        },
    ];

    const isActive = (tabPath: string) => {
        return url.startsWith(tabPath);
    };

    return (
        <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 w-full border-t border-primary/10 bg-white/90 pb-4 backdrop-blur-md">
            <div className="m-auto flex h-24 max-w-7xl items-end justify-around">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab.path);

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href as RouteDefinition<'get'>}
                            className="group relative flex flex-col items-center justify-center px-2 py-3"
                        >
                            <div
                                className={`relative transition-colors ${active ? 'text-primary' : 'text-slate-400'}`}
                            >
                                <Icon size={24} />
                                {tab.name === 'Keranjang' && cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] leading-5 text-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`mt-1 text-xs font-medium transition-colors ${
                                    active ? 'text-primary' : 'text-slate-600'
                                }`}
                            >
                                {tab.name}
                            </span>
                            {active && (
                                <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary"></div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
