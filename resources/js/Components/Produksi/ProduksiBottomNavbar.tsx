import { Link, usePage, router } from '@inertiajs/react';
import { Home, ClipboardList, History, User, LogOut, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { logout } from '@/routes';
import produksi from '@/routes/produksi';
import type { RouteDefinition } from '@/wayfinder';

interface SharedProps {
    pesananDiprosesCount?: number;
    auth?: {
        user?: {
            name?: string;
            email?: string;
            role?: string;
        };
    };
}

export default function BottomNavbar() {
    const { url, props } = usePage<SharedProps>();
    const pesananDiprosesCount = props.pesananDiprosesCount ?? 0;
    const user = props.auth?.user;
    const [profileOpen, setProfileOpen] = useState(false);

    const initials = useMemo(() => {
        const name = user?.name?.trim();

        if (!name) {
            return 'PR';
        }

        return name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }, [user?.name]);

    const onLogout = (): void => {
        router.post(logout());
    };

    const tabs = [
        {
            name: 'Beranda',
            path: '/produksi/beranda',
            icon: Home,
            href: produksi.beranda.url(),
        },
        {
            name: 'Pesanan',
            path: '/produksi/pesanan',
            icon: ClipboardList,
            href: produksi.pesanan.index.url(),
        },
        {
            name: 'Riwayat',
            path: '/produksi/riwayat',
            icon: History,
            href: produksi.riwayat.url(),
        },
        {
            name: 'Profil',
            path: null,
            icon: User,
            href: null,
        },
    ];
    const isActive = (tabPath: string) => {
        return url.startsWith(tabPath);
    };

    return (
        <>
            <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 w-full border-t border-primary/10 bg-white/90 pb-4 backdrop-blur-md">
                <div className="m-auto flex h-24 max-w-7xl items-end justify-around">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(tab.path);
                        const badgeCount =
                            tab.name === 'Pesanan' ? pesananDiprosesCount : 0;

                        if (tab.name === 'Profil') {
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setProfileOpen(true)}
                                    className="group relative flex flex-col items-center justify-center px-2 py-3 transition-colors hover:text-primary"
                                >
                                    <div className="relative text-slate-400 transition-colors">
                                        <Icon size={24} />
                                    </div>
                                    <span className="mt-1 text-xs font-medium text-slate-600">
                                        {tab.name}
                                    </span>
                                </button>
                            );
                        }

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
                                    {badgeCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {badgeCount > 99
                                                ? '99+'
                                                : badgeCount}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`mt-1 text-xs font-medium transition-colors ${
                                        active
                                            ? 'text-primary'
                                            : 'text-slate-600'
                                    }`}
                                >
                                    {tab.name}
                                </span>
                                {active && (
                                    <div className="absolute bottom-0 h-2 w-2 rounded-full bg-primary"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Profile Modal/Sheet */}
            {profileOpen && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-4 sm:items-center sm:justify-center">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-text">
                                Profil Produksi
                            </h2>
                            <button
                                type="button"
                                onClick={() => setProfileOpen(false)}
                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text">
                                        {user?.name ?? 'Tim Produksi'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {user?.email ?? '-'}
                                    </p>
                                    <p className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary capitalize">
                                        {user?.role ?? 'produksi'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
