import type { PageProps } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    Banknote,
    MessageCircleMore,
    Percent,
    TimerReset,
    WalletCards,
} from 'lucide-react';
import React, { type FormEvent, type ReactNode } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertError, alertSukses } from '@/lib/alert';
import pengaturan from '@/routes/admin/pengaturan';

interface Props extends PageProps {
    setting: {
        id: number;
        business_name: string;
        whatsapp_number: string | null;
        bank_name: string | null;
        bank_account_number: string | null;
        bank_account_holder_name: string | null;
        dp_percentage: number;
        order_edit_limit_days: number;
        otp_expiry_minutes: number;
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

export default function Index({ setting }: Props) {
    const form = useForm({
        business_name: setting.business_name ?? '',
        whatsapp_number: setting.whatsapp_number ?? '',
        bank_name: setting.bank_name ?? '',
        bank_account_number: setting.bank_account_number ?? '',
        bank_account_holder_name: setting.bank_account_holder_name ?? '',
        dp_percentage: String(setting.dp_percentage ?? 0),
        order_edit_limit_days: String(setting.order_edit_limit_days ?? 0),
        otp_expiry_minutes: String(setting.otp_expiry_minutes ?? 10),
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.patch(pengaturan.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                alertSukses(
                    'Pengaturan bisnis berhasil diperbarui.',
                    'Berhasil',
                );
            },
            onError: () => {
                alertError('Gagal memperbarui pengaturan bisnis.', 'Error');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Bisnis" />

            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                                Pengaturan Bisnis
                            </p>
                            <h1 className="mt-2 text-2xl font-bold text-text sm:text-3xl">
                                Data bisnis dan pengaturan operasional
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Perbarui identitas bisnis, data rekening, DP,
                                batas edit pesanan, dan masa berlaku OTP.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl bg-secondary/50 px-4 py-3">
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    Bisnis
                                </p>
                                <p className="mt-1 text-sm font-semibold text-text">
                                    {setting.business_name}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-secondary/50 px-4 py-3">
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    DP
                                </p>
                                <p className="mt-1 text-sm font-semibold text-text">
                                    {setting.dp_percentage}%
                                </p>
                            </div>
                            <div className="rounded-2xl bg-secondary/50 px-4 py-3 sm:col-span-2 lg:col-span-1">
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    OTP
                                </p>
                                <p className="mt-1 text-sm font-semibold text-text">
                                    {setting.otp_expiry_minutes} menit
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <SectionRow
                        title="Identitas Bisnis"
                        description="Data dasar bisnis yang tampil di halaman admin dan dokumen internal."
                    >
                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text">
                                        Nama Bisnis
                                    </label>
                                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        <Input
                                            value={form.data.business_name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'business_name',
                                                    event.currentTarget.value,
                                                )
                                            }
                                            placeholder="Nama bisnis"
                                            error={form.errors.business_name}
                                            className="border-0 px-0 py-3 focus:ring-0"
                                        />
                                    </div>
                                    <FieldError
                                        message={form.errors.business_name}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text">
                                        Nomor WhatsApp
                                    </label>
                                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                        <MessageCircleMore className="h-4 w-4 text-slate-400" />
                                        <Input
                                            value={form.data.whatsapp_number}
                                            onChange={(event) =>
                                                form.setData(
                                                    'whatsapp_number',
                                                    event.currentTarget.value,
                                                )
                                            }
                                            placeholder="08123456789"
                                            error={form.errors.whatsapp_number}
                                            className="border-0 px-0 py-3 focus:ring-0"
                                        />
                                    </div>
                                    <FieldError
                                        message={form.errors.whatsapp_number}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text">
                                        Nama Bank
                                    </label>
                                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                        <Banknote className="h-4 w-4 text-slate-400" />
                                        <Input
                                            value={form.data.bank_name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'bank_name',
                                                    event.currentTarget.value,
                                                )
                                            }
                                            placeholder="Bank"
                                            error={form.errors.bank_name}
                                            className="border-0 px-0 py-3 focus:ring-0"
                                        />
                                    </div>
                                    <FieldError
                                        message={form.errors.bank_name}
                                    />
                                </div>
                            </div>

                            <SectionRow
                                title="Data Rekening"
                                description="Gunakan data ini untuk transfer pembayaran dan verifikasi manual."
                            >
                                <div className="space-y-5">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Nomor Rekening
                                            </label>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                                <WalletCards className="h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={
                                                        form.data
                                                            .bank_account_number
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'bank_account_number',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="1234567890"
                                                    error={
                                                        form.errors
                                                            .bank_account_number
                                                    }
                                                    className="border-0 px-0 py-3 focus:ring-0"
                                                />
                                            </div>
                                            <FieldError
                                                message={
                                                    form.errors
                                                        .bank_account_number
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Nama Pemilik Rekening
                                            </label>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                                <UserIcon />
                                                <Input
                                                    value={
                                                        form.data
                                                            .bank_account_holder_name
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'bank_account_holder_name',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Nama pemilik rekening"
                                                    error={
                                                        form.errors
                                                            .bank_account_holder_name
                                                    }
                                                    className="border-0 px-0 py-3 focus:ring-0"
                                                />
                                            </div>
                                            <FieldError
                                                message={
                                                    form.errors
                                                        .bank_account_holder_name
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SectionRow>

                            <SectionRow
                                title="Pengaturan Operasional"
                                description="Kontrol DP, batas edit pesanan, dan masa berlaku OTP pelanggan."
                            >
                                <div className="space-y-5">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Persentase DP
                                            </label>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                                <Percent className="h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={
                                                        form.data.dp_percentage
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'dp_percentage',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="30"
                                                    error={
                                                        form.errors
                                                            .dp_percentage
                                                    }
                                                    className="border-0 px-0 py-3 focus:ring-0"
                                                />
                                            </div>
                                            <FieldError
                                                message={
                                                    form.errors.dp_percentage
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Batas Edit Pesanan (Hari)
                                            </label>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                                <TimerReset className="h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        form.data
                                                            .order_edit_limit_days
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'order_edit_limit_days',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="2"
                                                    error={
                                                        form.errors
                                                            .order_edit_limit_days
                                                    }
                                                    className="border-0 px-0 py-3 focus:ring-0"
                                                />
                                            </div>
                                            <FieldError
                                                message={
                                                    form.errors
                                                        .order_edit_limit_days
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Menit Kadaluarsa OTP
                                            </label>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                                                <TimerReset className="h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        form.data
                                                            .otp_expiry_minutes
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'otp_expiry_minutes',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="10"
                                                    error={
                                                        form.errors
                                                            .otp_expiry_minutes
                                                    }
                                                    className="border-0 px-0 py-3 focus:ring-0"
                                                />
                                            </div>
                                            <FieldError
                                                message={
                                                    form.errors
                                                        .otp_expiry_minutes
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SectionRow>
                        </div>
                    </SectionRow>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)] transition-all duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Building2 className="h-4 w-4" />
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function UserIcon() {
    return <span className="h-4 w-4 rounded-full border border-slate-300" />;
}
