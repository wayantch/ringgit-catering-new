import type { PageProps } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, Phone, Shield, User } from 'lucide-react';
import React, { type FormEvent, type ReactNode } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertError, alertSukses } from '@/lib/alert';
import profile from '@/routes/admin/profil';

interface Props extends PageProps {
    user: {
        name: string;
        email: string;
        phone: string | null;
        role: 'admin' | 'produksi' | 'pembeli' | 'user';
    };
}

function SectionRow({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div className="pt-1">
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {description}
                </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                {children}
            </div>
        </section>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
}

function Input({
    error,
    className = '',
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-text transition-all duration-150 outline-none placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 ${error ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
        />
    );
}

export default function Index({ user }: Props) {
    const profileForm = useForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        profileForm.patch(profile.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                alertSukses('Profil admin berhasil diperbarui.', 'Berhasil');
            },
            onError: () => {
                alertError('Gagal memperbarui profil admin.', 'Error');
            },
        });
    };

    const submitPassword = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        passwordForm.patch(profile.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset(
                    'current_password',
                    'password',
                    'password_confirmation',
                );
                alertSukses('Password admin berhasil diperbarui.', 'Berhasil');
            },
            onError: () => {
                alertError('Gagal memperbarui password admin.', 'Error');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Profil Admin" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                                Profil Admin
                            </p>
                            <h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl">
                                Informasi akun dan keamanan login
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Perbarui data akun admin dan kelola password
                                dari satu halaman.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-secondary/50 px-4 py-3">
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    Nama
                                </p>
                                <p className="mt-1 text-sm font-semibold text-text">
                                    {user.name}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-secondary/50 px-4 py-3">
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    Email
                                </p>
                                <p className="mt-1 text-sm font-semibold text-text">
                                    {user.email}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-secondary/50 px-4 py-3">
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    Role
                                </p>
                                <p className="mt-1 text-sm font-semibold text-text capitalize">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <SectionRow
                    title="Informasi Akun"
                    description="Perbarui nama dan nomor HP untuk kebutuhan kontak internal."
                >
                    <form onSubmit={submitProfile} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-text">
                                    Nama
                                </label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <Input
                                        value={profileForm.data.name}
                                        onChange={(event) =>
                                            profileForm.setData(
                                                'name',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Nama admin"
                                        error={profileForm.errors.name}
                                        className="border-0 px-0 py-3 focus:ring-0"
                                    />
                                </div>
                                <FieldError message={profileForm.errors.name} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text">
                                    Nomor HP
                                </label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <Input
                                        value={profileForm.data.phone}
                                        onChange={(event) =>
                                            profileForm.setData(
                                                'phone',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="08123456789"
                                        error={profileForm.errors.phone}
                                        className="border-0 px-0 py-3 focus:ring-0"
                                    />
                                </div>
                                <FieldError
                                    message={profileForm.errors.phone}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)] transition-all duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <User className="h-4 w-4" />
                                {profileForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Profil'}
                            </button>
                        </div>
                    </form>
                </SectionRow>

                <SectionRow
                    title="Ganti Password"
                    description="Isi password lama lalu masukkan password baru untuk mengganti kredensial login."
                >
                    <form onSubmit={submitPassword} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-text">
                                    Password Lama
                                </label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                    <LockIcon />
                                    <Input
                                        type="password"
                                        value={
                                            passwordForm.data.current_password
                                        }
                                        onChange={(event) =>
                                            passwordForm.setData(
                                                'current_password',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Password lama"
                                        error={
                                            passwordForm.errors.current_password
                                        }
                                        className="border-0 px-0 py-3 focus:ring-0"
                                    />
                                </div>
                                <FieldError
                                    message={
                                        passwordForm.errors.current_password
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text">
                                    Password Baru
                                </label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                    <KeyRound className="h-4 w-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(event) =>
                                            passwordForm.setData(
                                                'password',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Password baru"
                                        error={passwordForm.errors.password}
                                        className="border-0 px-0 py-3 focus:ring-0"
                                    />
                                </div>
                                <FieldError
                                    message={passwordForm.errors.password}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text">
                                    Konfirmasi Password Baru
                                </label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={
                                            passwordForm.data
                                                .password_confirmation
                                        }
                                        onChange={(event) =>
                                            passwordForm.setData(
                                                'password_confirmation',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Ulangi password baru"
                                        error={
                                            passwordForm.errors
                                                .password_confirmation
                                        }
                                        className="border-0 px-0 py-3 focus:ring-0"
                                    />
                                </div>
                                <FieldError
                                    message={
                                        passwordForm.errors
                                            .password_confirmation
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-text px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(46,46,46,0.4)] transition-all duration-200 hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <KeyRound className="h-4 w-4" />
                                {passwordForm.processing
                                    ? 'Menyimpan...'
                                    : 'Ubah Password'}
                            </button>
                        </div>
                    </form>
                </SectionRow>
            </div>
        </AdminLayout>
    );
}

function LockIcon() {
    return <span className="h-4 w-4 rounded-sm border border-slate-300" />;
}
