import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ClipboardList,
    LogOut,
    Search,
    ShoppingCart,
    User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { beranda, menu } from '@/routes/user';
import keranjang from '@/routes/user/keranjang';
import pesanan from '@/routes/user/pesanan';
import { index as profilIndex } from '@/routes/user/profil';
import type { RouteDefinition } from '@/wayfinder';

interface SharedProps {
    cartCount?: number;
    auth?: {
        user?: {
            name?: string;
            email?: string;
        } | null;
    };
    // Inertia's PageProps constraint expects an index signature.
    [key: string]: unknown;
}

const NAV_LINKS = [
    { name: 'Beranda', path: '/user/beranda', href: beranda() },
    { name: 'Menu', path: '/user/menu', href: menu() },
    { name: 'Pesanan', path: '/user/pesanan', href: pesanan.index() },
];

function ProfileMenu({ name, email }: { name: string; email: string }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (event: MouseEvent): void => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full py-1.5 pr-2 pl-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
            >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-32 truncate font-medium">{name}</span>
                <ChevronDown
                    className={cn(
                        'size-4 text-slate-400 transition-transform',
                        open && 'rotate-180',
                    )}
                />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5"
                >
                    <div className="border-b border-slate-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-text">
                            {name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {email}
                        </p>
                    </div>

                    <Link
                        href={profilIndex() as RouteDefinition<'get'>}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                    >
                        <User className="size-4 text-slate-400" />
                        Profil saya
                    </Link>

                    <Link
                        href={pesanan.index() as RouteDefinition<'get'>}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                    >
                        <ClipboardList className="size-4 text-slate-400" />
                        Pesanan saya
                    </Link>

                    <button
                        type="button"
                        onClick={() => router.post(logout())}
                        className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut className="size-4" />
                        Keluar
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Desktop-only header. The mobile breakpoints navigate through BottomNavbar
 * instead, so this stays hidden below `lg`.
 */
export default function TopNavbar() {
    const { url, props } = usePage<SharedProps>();
    const cartCount = props.cartCount ?? 0;
    const user = props.auth?.user;
    const [term, setTerm] = useState('');

    const isActive = (path: string): boolean => url.startsWith(path);

    const handleSearch = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        // Menu filtering is client-side; the query lands as ?q= for the page to
        // pick up so the header search works from anywhere.
        router.get(menu(), term.trim() === '' ? {} : { q: term.trim() });
    };

    return (
        <header className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white lg:block">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-6 py-3 xl:px-8">
                <Link
                    href={beranda() as RouteDefinition<'get'>}
                    className="shrink-0 text-base font-semibold tracking-tight text-text"
                >
                    Ringgit<span className="text-primary">Catering</span>
                </Link>

                <form onSubmit={handleSearch} className="min-w-0 flex-1">
                    <label className="flex items-center gap-2.5 rounded-xl bg-slate-100 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30">
                        <Search className="size-4 shrink-0 text-slate-400" />
                        <input
                            value={term}
                            onChange={(event) => setTerm(event.target.value)}
                            placeholder="Cari menu..."
                            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-slate-400"
                        />
                    </label>
                </form>

                <div className="flex shrink-0 items-center gap-1">
                    <Link
                        href={keranjang.index() as RouteDefinition<'get'>}
                        aria-label="Keranjang"
                        className={cn(
                            'relative rounded-full p-2.5 transition hover:bg-slate-100',
                            isActive('/user/keranjang')
                                ? 'text-primary'
                                : 'text-slate-500',
                        )}
                    >
                        <ShoppingCart className="size-5" />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] leading-4 font-semibold text-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>

                    <span
                        aria-hidden="true"
                        className="mx-2 h-6 w-px bg-slate-200"
                    />

                    {user?.name ? (
                        <ProfileMenu
                            name={user.name}
                            email={user.email ?? ''}
                        />
                    ) : null}
                </div>
            </div>

            <nav className="mx-auto w-full max-w-7xl px-6 xl:px-8">
                <ul className="-mb-px flex items-center gap-1">
                    {NAV_LINKS.map((link) => {
                        const active = isActive(link.path);

                        return (
                            <li key={link.name}>
                                <Link
                                    href={link.href as RouteDefinition<'get'>}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'inline-block border-b-2 px-3 pb-2.5 text-sm transition',
                                        active
                                            ? 'border-primary font-semibold text-primary'
                                            : 'border-transparent text-slate-500 hover:text-text',
                                    )}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}
