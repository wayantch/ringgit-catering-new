import { logout } from '@/routes';
import { router, usePage } from '@inertiajs/react';
import { LogOut, ShieldCheck, UserCircle2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type AuthUser = {
    name?: string;
    email?: string;
    role?: string;
};

type SharedProps = {
    auth?: {
        user?: AuthUser;
    };
};

export default function ProduksiProfileMenu() {
    const { props } = usePage<SharedProps>();
    const user = props.auth?.user;
    const [open, setOpen] = useState(false);

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

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-slate-700 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                    {initials}
                </span>
                <span className="hidden text-xs font-semibold sm:block">
                    Profil
                </span>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-4 sm:items-center sm:justify-end">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-black/5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-text">
                                Profil Produksi
                            </h2>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
                            <div className="flex items-start gap-3">
                                <UserCircle2 className="mt-0.5 h-5 w-5 text-primary" />
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

                        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                            <div className="flex items-start gap-2">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-xs font-semibold text-primary">
                                        Penanggung Jawab Produksi
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        Shift saat ini ditangani oleh{' '}
                                        <span className="font-semibold text-text">
                                            {user?.name ?? 'Tim Produksi'}
                                        </span>
                                        .
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
