import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type LoginRole = 'admin' | 'produksi' | 'user';

type StaffRole = Exclude<LoginRole, 'user'>;

export default function Login() {
    const [mounted, setMounted] = useState(false);
    const [staffRole, setStaffRole] = useState<StaffRole>('admin');

    const form = useForm({
        email: '',
        password: '',
        role: 'admin' as LoginRole,
    });

    const isBuyer = form.data.role === 'user';

    useEffect(() => {
        setMounted(true);
    }, []);

    const switchMode = (role: LoginRole) => {
        form.clearErrors();
        form.setData('role', role);

        if (role !== 'user') {
            setStaffRole(role);
        }
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/login', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('password');
            },
        });
    };

    return (
        <>
            <Head title="Ringgit Catering Login" />

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
                        className={`relative mx-auto w-full max-w-2xl rounded-2xl bg-white/95 p-6 shadow-[0_28px_80px_-36px_rgba(46,46,46,0.28)] ring-1 ring-black/5 backdrop-blur-sm transition duration-700 ease-out sm:p-8 lg:p-10 ${mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.98] opacity-0'}`}
                    >
                        <div className="flex flex-col gap-6">
                            <header className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium tracking-[0.28em] text-primary uppercase">
                                    Ringgit Catering
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                                        Ringgit Catering
                                    </h1>
                                    <p className="text-sm text-black/60 sm:text-base">
                                        Masuk ke sistem
                                    </p>
                                </div>
                            </header>

                            <div className="grid gap-3 rounded-2xl bg-secondary/50 p-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => switchMode(staffRole)}
                                    className={`rounded-xl px-4 py-3 text-left transition ${!isBuyer ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-black/55 hover:bg-white/70 hover:text-text'}`}
                                >
                                    <span className="block text-sm font-semibold">
                                        Admin / Produksi
                                    </span>
                                    <span className="block text-xs text-black/50">
                                        Akses panel internal
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchMode('user')}
                                    className={`rounded-xl px-4 py-3 text-left transition ${isBuyer ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-black/55 hover:bg-white/70 hover:text-text'}`}
                                >
                                    <span className="block text-sm font-semibold">
                                        Pembeli
                                    </span>
                                    <span className="block text-xs text-black/50">
                                        Email + password dulu
                                    </span>
                                </button>
                            </div>

                            {!isBuyer ? (
                                <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(46,46,46,0.25)]">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-black/55">
                                                Role aktif
                                            </p>
                                            <p className="text-base font-semibold text-text capitalize">
                                                {staffRole}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 rounded-xl bg-secondary/70 p-1 text-sm font-medium">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStaffRole('admin');
                                                    switchMode('admin');
                                                }}
                                                className={`rounded-lg px-3 py-2 transition ${staffRole === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-black/55'}`}
                                            >
                                                Admin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStaffRole('produksi');
                                                    switchMode('produksi');
                                                }}
                                                className={`rounded-lg px-3 py-2 transition ${staffRole === 'produksi' ? 'bg-white text-primary shadow-sm' : 'text-black/55'}`}
                                            >
                                                Produksi
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-black/50">
                                        Form ini dipakai untuk admin dan
                                        produksi. Hak akses akan mengikuti role
                                        yang dipilih.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 rounded-2xl border border-black/5 bg-secondary/40 p-4 shadow-[0_10px_30px_-22px_rgba(46,46,46,0.18)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-black/55">
                                                Mode pembeli
                                            </p>
                                            <p className="text-base font-semibold text-text">
                                                Login email + password
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-black/5">
                                            OTP soon
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-black/55">
                                        Login OTP akan segera tersedia. Struktur
                                        sudah disiapkan untuk alur email → kirim
                                        OTP → input OTP.
                                    </p>

                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {[
                                            'Email',
                                            'Kirim OTP',
                                            'Input OTP',
                                        ].map((step, index) => (
                                            <div
                                                key={step}
                                                className="rounded-xl border border-dashed border-primary/20 bg-white/70 px-3 py-3 text-sm text-black/55"
                                            >
                                                <div className="mb-2 text-xs font-semibold tracking-[0.24em] text-primary/70 uppercase">
                                                    0{index + 1}
                                                </div>
                                                <div>{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form className="space-y-4" onSubmit={submit}>
                                <input
                                    type="hidden"
                                    name="role"
                                    value={form.data.role}
                                />

                                <div className="grid gap-4">
                                    <label className="grid gap-2">
                                        <span className="text-sm font-medium text-text">
                                            Email
                                        </span>
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={form.data.email}
                                            onChange={(event) =>
                                                form.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-12 rounded-lg border border-black/10 bg-white px-4 text-sm transition outline-none placeholder:text-black/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
                                            placeholder="nama@ringgitcatering.com"
                                        />
                                        {form.errors.email ? (
                                            <span className="text-sm text-red-600">
                                                {form.errors.email}
                                            </span>
                                        ) : null}
                                    </label>

                                    <label className="grid gap-2">
                                        <span className="text-sm font-medium text-text">
                                            Password
                                        </span>
                                        <input
                                            type="password"
                                            autoComplete={
                                                isBuyer
                                                    ? 'current-password'
                                                    : 'current-password'
                                            }
                                            value={form.data.password}
                                            onChange={(event) =>
                                                form.setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-12 rounded-lg border border-black/10 bg-white px-4 text-sm transition outline-none placeholder:text-black/30 focus:border-primary focus:ring-4 focus:ring-primary/15"
                                            placeholder="Masukkan password"
                                        />
                                        {form.errors.password ? (
                                            <span className="text-sm text-red-600">
                                                {form.errors.password}
                                            </span>
                                        ) : null}
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {form.processing ? 'Memproses...' : 'Login'}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
