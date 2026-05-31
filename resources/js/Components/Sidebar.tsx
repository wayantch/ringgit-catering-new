import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingCart,
    UtensilsCrossed,
    Users,
    X,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { logout } from '@/routes';
import admin from '@/routes/admin';
import produksi from '@/routes/produksi';

export default function Sidebar() {
    const page = usePage();
    const url = page.url;
    const { isOpen, close } = useSidebar();
    const role = page.props.auth?.user?.role;
    const isProductionUser = role === 'produksi';
    const userName = page.props.auth?.user?.name ?? 'Admin';
    const userEmail = page.props.auth?.user?.email ?? 'admin@ringgit.id';
    // Ensure newOrdersCount is a number to satisfy TS checks
    const newOrdersCount = Number(page.props.newOrdersCount ?? 0);

    const isActive = (path: string) => url?.startsWith(path);

    const menuItems = isProductionUser
        ? [
              {
                  name: 'Dashboard',
                  path: produksi.beranda.url(),
                  icon: LayoutDashboard,
              },
              {
                  name: 'Pesanan',
                  path: produksi.pesanan.index.url(),
                  icon: ShoppingCart,
              },
              {
                  name: 'Menu',
                  path: '/produksi/menu',
                  icon: UtensilsCrossed,
              },
              {
                  name: 'Pelanggan',
                  path: '/produksi/pelanggan',
                  icon: Users,
              },
          ]
        : [
              {
                  name: 'Dashboard',
                  path: admin.dashboard.url(),
                  icon: LayoutDashboard,
              },
              {
                  name: 'Pesanan',
                  path: admin.pesanan.index.url(),
                  icon: ShoppingCart,
              },
              {
                  name: 'Menu',
                  path: admin.menu.index.url(),
                  icon: UtensilsCrossed,
              },
              {
                  name: 'Pelanggan',
                  path: admin.pelanggan.index.url(),
                  icon: Users,
              },
          ];

    const handleLogout = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = logout.url();

        const csrfToken = document.querySelector(
            'meta[name="csrf-token"]',
        ) as HTMLMetaElement;

        if (csrfToken) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = csrfToken.content;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
                    onClick={close}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 flex h-screen w-64 transform flex-col border-r border-white/70 bg-white/90 px-5 py-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-transform duration-300 ease-in-out lg:fixed lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Close Button - Mobile Only */}
                <button
                    onClick={close}
                    className="absolute top-5 right-5 hidden rounded-full p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
                >
                    <X className="h-5 w-5" strokeWidth={2} />
                </button>

                {/* Logo Section */}
                <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200/70 bg-linear-to-br from-white to-primary/5 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_28px_-16px_rgba(122,143,107,0.85)] ring-1 ring-primary/20">
                            <span className="text-lg font-extrabold">RC</span>
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="text-sm leading-tight font-semibold text-slate-900">
                                Ringgit
                            </span>
                            <span className="text-xs text-slate-500">
                                Catering
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 mb-3 flex items-center justify-between px-1">
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                        Menu
                    </p>
                    <div className="h-px flex-1 bg-slate-200/80" />
                </div>
                {/* Menu Items */}
                <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={close}
                                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 ${
                                    active
                                        ? 'border border-primary/10 bg-linear-to-r from-primary/12 to-primary/5 text-primary shadow-[0_14px_30px_-22px_rgba(122,143,107,0.7)]'
                                        : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                } `}
                            >
                                {active && (
                                    <span className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-lg" />
                                )}

                                <span
                                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${
                                        active
                                            ? 'bg-primary/15 text-primary'
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700'
                                    } `}
                                >
                                    <Icon className="h-5 w-5" strokeWidth={2} />

                                    {item.name === 'Pesanan' &&
                                        typeof newOrdersCount === 'number' &&
                                        newOrdersCount > 0 &&
                                        !active && (
                                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] leading-none font-semibold text-white shadow-sm ring-2 ring-white">
                                                {newOrdersCount > 9
                                                    ? '9+'
                                                    : String(newOrdersCount)}
                                            </span>
                                        )}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`block truncate transition-colors duration-200 ${
                                            active
                                                ? 'font-semibold text-primary'
                                                : 'font-medium text-slate-700'
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </span>

                                <ChevronRight
                                    className={`h-4 w-4 transition-transform duration-200 ${active ? 'translate-x-0.5 text-primary' : 'text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500'}`}
                                />
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-4 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                            <span className="text-sm font-bold">
                                {userName
                                    .split(' ')
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {userName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {userEmail}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            {isProductionUser ? 'Produksi' : 'Admin'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-auto inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Keluar
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
