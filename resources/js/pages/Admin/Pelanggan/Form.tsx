import { useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, User, Phone } from 'lucide-react';
import type { FormEvent } from 'react';
import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertSukses, alertError } from '@/lib/alert';

interface Props {
    mode: 'create' | 'edit';
    pelanggan?: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    } | null;
}

export default function Form({ mode, pelanggan }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: pelanggan?.name || '',
        email: pelanggan?.email || '',
        phone: pelanggan?.phone || '',
        send_invite: false,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (mode === 'create') {
            post('/admin/pelanggan', {
                onSuccess: () => {
                    alertSukses('Pelanggan berhasil ditambahkan', 'Berhasil');
                },
                onError: () => {
                    alertError('Gagal menambahkan pelanggan', 'Error');
                },
            });
        } else if (pelanggan) {
            put(`/admin/pelanggan/${pelanggan.id}`, {
                onSuccess: () => {
                    alertSukses('Pelanggan berhasil diperbarui', 'Berhasil');
                },
                onError: () => {
                    alertError('Gagal memperbarui pelanggan', 'Error');
                },
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 p-4 lg:p-6">
                <section className="overflow-hidden rounded-[32px] border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="max-w-3xl space-y-3">
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
                                {mode === 'create'
                                    ? 'Tambah Pelanggan'
                                    : 'Edit Pelanggan'}
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                                {mode === 'create'
                                    ? 'Pelanggan Baru'
                                    : 'Perbarui Pelanggan'}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Isi identitas pelanggan dengan tampilan form
                                yang lebih clean dan fokus.
                            </p>
                        </div>

                        <Link
                            href="/admin/pelanggan"
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-600 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:text-primary"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>
                </section>

                {/* Form */}
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section: Informasi Akun */}
                        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                        Informasi Akun
                                    </p>
                                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-text">
                                        Data Dasar Pelanggan
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Nama */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-text"
                                    >
                                        Nama Lengkap{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                        <User className="h-4 w-4 text-slate-400" />
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="Nama lengkap pelanggan"
                                            className="flex-1 border-0 bg-transparent py-3 outline-none"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-text"
                                    >
                                        Email{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="email@example.com"
                                            disabled={mode === 'edit'}
                                            className="flex-1 border-0 bg-transparent py-3 outline-none disabled:text-slate-500"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-text"
                                    >
                                        Nomor HP
                                    </label>
                                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            placeholder="08123456789"
                                            className="flex-1 border-0 bg-transparent py-3 outline-none"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        {mode === 'create' && (
                            <div className="rounded-[24px] border border-primary/20 bg-primary/5 px-4 py-4 text-primary shadow-sm">
                                <p className="text-sm leading-6">
                                    <span className="font-semibold">
                                        ℹ️ Informasi:
                                    </span>{' '}
                                    Akun akan dibuat tanpa password. Pelanggan
                                    bisa login menggunakan OTP yang dikirim ke
                                    email mereka.
                                </p>
                            </div>
                        )}

                        {/* Send Invite Checkbox */}
                        {mode === 'create' && (
                            <div className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                                <input
                                    id="send_invite"
                                    type="checkbox"
                                    checked={data.send_invite}
                                    onChange={(e) =>
                                        setData('send_invite', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <label
                                    htmlFor="send_invite"
                                    className="flex-1 cursor-pointer"
                                >
                                    <p className="font-semibold text-text">
                                        Kirim undangan login
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Kirim OTP ke email pelanggan setelah
                                        akun dibuat
                                    </p>
                                </label>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 rounded-[28px] border border-white/70 bg-white/90 px-5 py-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
                            <Link
                                href="/admin/pelanggan"
                                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
