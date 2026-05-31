import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type StaffRole = 'admin' | 'produksi';

export default function AdminLogin() {
    const [mounted, setMounted] = useState(false);
    const [staffRole, setStaffRole] = useState<StaffRole>('admin');

    const form = useForm({
        email: '',
        password: '',
        role: 'admin' as StaffRole,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const switchRole = (role: StaffRole) => {
        form.clearErrors();
        form.setData('role', role);
        setStaffRole(role);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/admin/login', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('password');
            },
        });
    };

    return (
        <>
            <Head title="Ringgit Catering - Admin" />

            <main className="relative min-h-screen overflow-hidden bg-white text-text">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.08),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(201,124,93,0.1),transparent_26%),radial-gradient(circle_at_12%_82%,rgba(217,160,102,0.1),transparent_28%)]" />

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="animate-float-medium absolute -top-10 -right-12 h-64 w-80 rounded-[42%_58%_54%_46%/45%_40%_60%_55%] bg-linear-to-br from-accent via-accent-2 to-primary opacity-15 blur-3xl" />
                    <div className="animate-float-slow absolute top-16 right-14 h-36 w-56 rotate-[-18deg] rounded-[35%_65%_55%_45%/52%_44%_56%_48%] bg-[radial-gradient(circle_at_30%_30%,rgba(245,241,232,0.92),rgba(122,143,107,0.08)_48%,rgba(201,124,93,0.18)_100%)] opacity-20 blur-2xl" />
                    <div className="animate-float-slow absolute -bottom-12 -left-8 h-56 w-72 rotate-12 rounded-[48%_52%_40%_60%/58%_36%_64%_42%] bg-[radial-gradient(circle_at_35%_35%,rgba(122,143,107,0.18),rgba(245,241,232,0.08)_42%,rgba(201,124,93,0.14)_100%)] opacity-20 blur-3xl" />
                    <div className="animate-float-medium absolute top-[18%] left-[10%] h-4 w-4 rounded-full bg-primary opacity-20 blur-[1px]" />
                    <div className="animate-float-slow absolute right-[18%] bottom-[22%] h-5 w-5 rounded-full bg-accent opacity-20 blur-[1px]" />
                </div>

                <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
                    <section
                        className={`relative mx-auto w-full max-w-2xl rounded-[28px] bg-white/95 p-6 shadow-[0_20px_60px_-28px_rgba(46,46,46,0.18)] ring-1 ring-black/5 backdrop-blur-sm transition duration-500 ease-out sm:p-8 lg:p-10 ${mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.995] opacity-0'}`}
                    >
                        <div className="flex flex-col gap-6">
                            <header className="space-y-2 self-center text-center">
                                <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium tracking-[0.28em] text-primary uppercase">
                                    Ringgit Catering
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                                        Panel Admin
                                    </h1>
                                    <p className="text-sm text-black/50">
                                        Masuk ke sistem internal
                                    </p>
                                </div>
                            </header>

                            <div className="grid gap-3 rounded-2xl bg-secondary/50 p-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => switchRole('admin')}
                                    aria-pressed={staffRole === 'admin'}
                                    className={`rounded-[14px] px-4 py-3 text-left transition ${staffRole === 'admin' ? 'bg-white text-primary shadow ring-1 ring-black/5' : 'text-black/60 hover:bg-white/70 hover:text-text'}`}
                                >
                                    <span className="block text-sm font-semibold">
                                        Admin
                                    </span>
                                    <span className="block text-xs text-black/50">
                                        Kelola sistem
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchRole('produksi')}
                                    aria-pressed={staffRole === 'produksi'}
                                    className={`rounded-[14px] px-4 py-3 text-left transition ${staffRole === 'produksi' ? 'bg-white text-primary shadow ring-1 ring-black/5' : 'text-black/60 hover:bg-white/70 hover:text-text'}`}
                                >
                                    <span className="block text-sm font-semibold">
                                        Produksi
                                    </span>
                                    <span className="block text-xs text-black/50">
                                        Kelola order
                                    </span>
                                </button>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-text"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.currentTarget.value,
                                            )
                                        }
                                        placeholder="admin@example.com"
                                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm placeholder-black/40 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    />
                                    {form.errors.email && (
                                        <p className="text-xs text-red-600">
                                            {form.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-text"
                                    >
                                        Kata Sandi
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={form.data.password}
                                        onChange={(e) =>
                                            form.setData(
                                                'password',
                                                e.currentTarget.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm placeholder-black/40 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    />
                                    {form.errors.password && (
                                        <p className="text-xs text-red-600">
                                            {form.errors.password}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full rounded-full bg-primary px-6 py-3 text-base font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Memproses...'
                                        : `Masuk sebagai ${staffRole === 'admin' ? 'Admin' : 'Produksi'}`}
                                </button>
                            </form>

                            <div className="text-center">
                                <p className="text-xs text-black/60">
                                    &copy; {new Date().getFullYear()} Ringgit
                                    Catering.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
