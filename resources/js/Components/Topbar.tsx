import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Settings,
    Search,
    Menu,
    LogOut,
    User,
    ChevronDown,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { logout } from '@/routes';
import admin from '@/routes/admin';
import produksi from '@/routes/produksi';

type TopbarUser = {
    name?: string;
    email?: string;
    role?: string;
} | null;

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown({ user }: { user?: TopbarUser }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    // Held in state, not a ref: the portal container is read during render,
    // and a ref mutation would not schedule the re-render that needs it.
    const [portalEl] = useState<HTMLDivElement | null>(() =>
        typeof document === 'undefined' ? null : document.createElement('div'),
    );
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
    const page = usePage();
    const currentUser = (user ??
        (page.props.auth?.user as TopbarUser) ??
        null) as TopbarUser;
    const isProductionUser = currentUser?.role === 'produksi';

    const profileHref = isProductionUser
        ? produksi.beranda.url()
        : admin.profil.index.url();
    const settingHref = isProductionUser
        ? produksi.beranda.url()
        : admin.pengaturan.index.url();

    // Tutup saat klik di luar
    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (
                ref.current &&
                event.target instanceof Node &&
                !ref.current.contains(event.target) &&
                !(portalEl && portalEl.contains(event.target))
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);

        return () => document.removeEventListener('mousedown', handler);
    }, [portalEl]);

    // Attach the portal container to the document
    useEffect(() => {
        if (!portalEl) {
            return;
        }

        document.body.appendChild(portalEl);

        return () => {
            document.body.removeChild(portalEl);
        };
    }, [portalEl]);

    // Position dropdown when opened or on resize/scroll
    useEffect(() => {
        if (!open) {
            return;
        }

        const update = () => {
            if (!ref.current) {
                return;
            }

            const rect = ref.current.getBoundingClientRect();
            const dropdownWidth = 208; // w-52 = 13rem = 208px
            const left = rect.right - dropdownWidth + window.scrollX;
            const top = rect.bottom + 8 + window.scrollY; // 8px gap (mt-2)
            setDropdownStyle({
                position: 'absolute',
                top: `${top}px`,
                left: `${left}px`,
                width: `${dropdownWidth}px`,
                zIndex: 9999,
            });
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);

        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [open]);

    const handleLogout = () => {
        router.post(logout.url());
    };

    const initials = currentUser?.name
        ? currentUser.name
              .split(' ')
              .map((part: string) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : 'A';

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2 pr-2.5 transition-all duration-200"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white ring-2 ring-primary/30">
                    {initials}
                </div>
                <div className="hidden text-left lg:block">
                    <p className="text-[13px] leading-none font-semibold text-text">
                        {currentUser?.name ?? 'Admin'}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-none text-slate-400 capitalize">
                        {currentUser?.role ?? 'admin'}
                    </p>
                </div>
                <ChevronDown
                    className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-200 lg:block ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown (rendered via portal to avoid stacking/overflow issues) */}
            {open &&
                portalEl &&
                createPortal(
                    <div
                        style={dropdownStyle}
                        className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
                    >
                        {/* User info header */}
                        <div className="border-b border-slate-100 bg-secondary/40 px-4 py-3">
                            <p className="text-[13px] font-semibold text-text">
                                {currentUser?.name ?? 'Admin'}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                {currentUser?.email ?? 'admin@ringgit.id'}
                            </p>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5">
                            <Link
                                href={profileHref}
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-secondary/60 hover:text-text"
                            >
                                <User className="h-4 w-4 text-slate-400" />
                                Profil
                            </Link>
                            <Link
                                href={settingHref}
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-secondary/60 hover:text-text"
                            >
                                <Settings className="h-4 w-4 text-slate-400" />
                                Pengaturan
                            </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-slate-100 p-1.5">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </button>
                        </div>
                    </div>,
                    portalEl,
                )}
        </div>
    );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export default function Topbar({ user }: { user?: TopbarUser }) {
    const { toggle } = useSidebar();

    return (
        <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-primary/10 bg-white/70 px-4 py-3 backdrop-blur-sm sm:px-6">
            {/* Hamburger — mobile only */}
            <button
                onClick={toggle}
                className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100/60 lg:hidden"
            >
                <Menu className="h-5 w-5" strokeWidth={2} />
            </button>

            {/* Search */}
            <div className="flex-1">
                <div className="relative max-w-sm">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/30"
                        strokeWidth={2}
                    />
                    <input
                        type="text"
                        placeholder="Cari pesanan, menu, pelanggan..."
                        className="w-full rounded-full border border-transparent bg-secondary/40 py-2 pr-4 pl-10 text-sm text-text placeholder-black/30 transition-all duration-200 outline-none focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Notification */}
                <button className="relative rounded-xl p-2 text-black/50 transition-all duration-200 hover:bg-secondary/60 hover:text-text">
                    <Bell className="h-4.5 w-4.5" strokeWidth={2} />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent ring-1 ring-white" />
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-slate-200" />

                {/* Profile */}
                <ProfileDropdown user={user} />
            </div>
        </div>
    );
}
