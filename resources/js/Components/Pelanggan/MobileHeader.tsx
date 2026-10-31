import { Link, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { beranda } from '@/routes/user';
import keranjang from '@/routes/user/keranjang';
import { index as profilIndex } from '@/routes/user/profil';
import type { RouteDefinition } from '@/wayfinder';

interface SharedProps {
    cartCount?: number;
    auth?: {
        user?: {
            name?: string;
        } | null;
    };
    // Inertia's PageProps constraint expects an index signature.
    [key: string]: unknown;
}

/**
 * Top bar for mobile and tablet. Desktop has TopNavbar instead, so this is
 * hidden from `lg` up. It carries the brand plus the two things worth reaching
 * without going through the bottom tabs: the cart and the account.
 */
export default function MobileHeader() {
    const { props } = usePage<SharedProps>();
    const cartCount = props.cartCount ?? 0;
    const name = props.auth?.user?.name ?? '';

    return (
        <header className="liquid-glass-bar liquid-glass-bar-bottom sticky top-0 z-30 lg:hidden">
            <div className="flex h-14 items-center justify-between gap-3 px-4">
                <Link
                    href={beranda() as RouteDefinition<'get'>}
                    className="text-base font-semibold tracking-tight text-text"
                >
                    Ringgit<span className="text-primary">Catering</span>
                </Link>

                <div className="flex items-center gap-1">
                    <Link
                        href={keranjang.index() as RouteDefinition<'get'>}
                        aria-label={
                            cartCount > 0
                                ? `Keranjang, ${cartCount} item`
                                : 'Keranjang'
                        }
                        className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                    >
                        <ShoppingCart className="size-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] leading-4 font-semibold text-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {name !== '' && (
                        <Link
                            href={profilIndex() as RouteDefinition<'get'>}
                            aria-label="Profil saya"
                            className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                        >
                            {name.charAt(0).toUpperCase()}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
