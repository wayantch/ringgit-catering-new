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
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/pelanggan"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                            {mode === 'create' ? 'Tambah' : 'Edit'} Pelanggan
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900">
                            {mode === 'create'
                                ? 'Pelanggan Baru'
                                : 'Edit Pelanggan'}
                        </h1>
                    </div>
                </div>

                {/* Form */}
                <div className="">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section: Informasi Akun */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                                Informasi Akun
                            </h2>

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
                                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
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
                                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
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
                                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
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
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                <p className="text-sm text-primary">
                                    <span className="font-semibold">
                                        ℹ️ Informasi:
                                    </span>{' '}
                                    Akun akan dibuat tanpa password. Pelanggan
                                    bisa login menggunakan OTP yang dikirim ke
                                    email mereka. Kamu bisa mengirim undangan
                                    login setelah akun dibuat.
                                </p>
                            </div>
                        )}

                        {/* Send Invite Checkbox */}
                        {mode === 'create' && (
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
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
                                    <p className="font-medium text-slate-900">
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
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:enabled:bg-primary-600 disabled:opacity-60"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <Link
                                href="/admin/pelanggan"
                                className="rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
