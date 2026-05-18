import { Link, usePage } from '@inertiajs/react';
import {
    LogOut,
    LayoutDashboard,
    ShoppingCart,
    UtensilsCrossed,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
    const page = usePage();
    const url = page.url;
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { isOpen, close } = useSidebar();
    const role = page.props.auth?.user?.role;
    const isProductionUser = role === 'produksi';

    const isActive = (path: string) => url?.startsWith(path);

    const menuItems = isProductionUser
        ? [
              {
                  name: 'Dashboard',
                  path: '/produksi/dashboard',
                  icon: LayoutDashboard,
              },
              {
                  name: 'Pesanan',
                  path: '/produksi/pesanan',
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
                  path: '/admin/dashboard',
                  icon: LayoutDashboard,
              },
              {
                  name: 'Pesanan',
                  path: '/admin/pesanan',
                  icon: ShoppingCart,
              },
              {
                  name: 'Menu',
                  path: '/admin/menu',
                  icon: UtensilsCrossed,
              },
              {
                  name: 'Pelanggan',
                  path: '/admin/pelanggan',
                  icon: Users,
              },
          ];

    const handleLogout = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';

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
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={close}
                />
            )}

            <aside
                className={`soft-shadow-lg fixed top-0 left-0 z-50 flex h-screen w-64 transform flex-col rounded-2xl bg-slate-50 p-6 transition-transform duration-300 ease-in-out lg:fixed lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
            >
                {/* Close Button - Mobile Only */}
                <button
                    onClick={close}
                    className="absolute top-6 right-6 hidden rounded-lg p-1 text-slate-500 transition hover:bg-slate-200/30 lg:hidden"
                >
                    <X className="h-5 w-5" strokeWidth={2} />
                </button>

                {/* Logo Section */}
                <div className="flex items-center gap-4 pb-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/90 text-white ring-1 ring-primary/20">
                        <span className="text-lg font-extrabold">RC</span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="text-sm leading-tight font-semibold text-slate-900">
                            Ringgit
                        </span>
                        <span className="text-xs text-slate-500">Catering</span>
                    </div>
                </div>
                <hr className="my-6 border-slate-200" />

                <div className="mb-4">
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        Menu
                    </p>
                </div>
                {/* Menu Items */}
                <nav className="flex-1 space-y-2 overflow-y-auto">
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
                                        ? 'rounded-2xl bg-primary/10 text-primary shadow-sm'
                                        : 'text-slate-700 hover:scale-105 hover:bg-slate-200/30'
                                } `}
                            >
                                {/* Left indicator for active */}
                                {active && (
                                    <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-lg" />
                                )}

                                {/* Icon Container */}
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                                        active
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-slate-200/50 text-slate-600 group-hover:bg-slate-200/70'
                                    } `}
                                >
                                    <Icon className="h-5 w-5" strokeWidth={2} />
                                </span>

                                {/* Text */}
                                <span
                                    className={`transition-colors duration-200 ${
                                        active
                                            ? 'font-semibold text-primary'
                                            : 'font-medium text-slate-700'
                                    } `}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="mt-auto border-t border-slate-200 pt-4">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 ease-in-out hover:scale-105 hover:bg-red-50 hover:text-red-700 active:scale-95`}
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100/50">
                            <LogOut className="h-5 w-5" strokeWidth={2} />
                        </span>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="mx-4 max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 rounded-full bg-red-100 p-3">
                                <LogOut
                                    className="h-5 w-5 text-red-600"
                                    strokeWidth={2}
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Yakin ingin keluar?
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Anda akan keluar dari sistem Ringgit
                                    Catering.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 hover:shadow-md active:scale-95"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
