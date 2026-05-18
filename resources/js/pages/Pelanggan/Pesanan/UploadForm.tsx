import type { PageProps } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import { Upload, Copy, Check } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import PelangganLayout from '@/Layouts/PelangganLayout';

interface Order {
    id: string;
    hashid: string;
    order_number: string;
    order_status?:
        | 'baru'
        | 'menunggu_verifikasi'
        | 'diproses'
        | 'selesai'
        | 'dibatalkan';
    total_amount: string | number;
    dp_amount: string | number;
    remaining_amount: string | number;
    cashback_eligible?: boolean;
    cashback_breakdown?: Array<{
        menu_name: string;
        kode: 'A' | 'B' | 'C';
        cashback: number;
    }>;
    total_cashback?: number;
}

interface Props extends PageProps {
    order: Order;
}

function UploadForm({ order }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const isCancelled = order.order_status === 'dibatalkan';
    const form = useForm<{
        payment_type: '' | 'dp' | 'pelunasan';
        proof_image: File | null;
    }>({
        payment_type: '',
        proof_image: null,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (order.order_status === 'dibatalkan') {
            return;
        }

        form.post(`/user/pesanan/${order.hashid}/upload-bukti`, {
            forceFormData: true,
            headers: {
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
        });
    };

    const formatCurrency = (value: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(value));
    };

    const cashbackBreakdown = order.cashback_breakdown ?? [];
    const totalCashback = order.total_cashback ?? 0;
    const cashbackEligible =
        order.cashback_eligible ?? cashbackBreakdown.length > 0;

    return (
        <>
            <Head title={`Upload Bukti - ${order.order_number}`} />

            <div className="text-text">
                {/* Header */}
                <header className="relative overflow-hidden bg-[linear-gradient(135deg,#6f8570_0%,#89a189_52%,#d9d1be_100%)] text-white">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-40"
                        style={{
                            background:
                                'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%)',
                        }}
                    />
                    <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-12">
                        <div className="flex items-center justify-between gap-4">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/80 uppercase backdrop-blur-sm">
                                    Ringgit Catering
                                </span>
                                <p className="mt-3 text-sm font-medium text-white/75 sm:text-base">
                                    {order.order_number}
                                </p>
                                <h1 className="mt-1 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                                    Upload bukti pembayaran.
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                                    Pilih jenis pembayaran lalu upload bukti
                                    dalam tampilan yang lebih rapi.
                                </p>
                            </div>

                            <div className="shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg shadow-black/10 backdrop-blur-md sm:h-14 sm:w-14">
                                    <Upload className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="relative -mt-6 sm:-mt-8">
                    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-10 sm:px-8">
                        {/* Payment Info Card */}
                        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
                            <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                Ringkasan
                            </p>
                            <h2 className="mt-1 text-lg font-semibold text-text">
                                Ringkasan Pembayaran
                            </h2>
                            <div className="mt-4 space-y-3 rounded-3xl bg-[#fbfaf6] p-4">
                                {/* If user hasn't selected a payment type yet, prompt them */}
                                {form.data.payment_type === '' && (
                                    <div className="text-sm leading-6 text-slate-600">
                                        Pilih jenis pembayaran untuk melihat
                                        rincian DP atau pelunasan.
                                    </div>
                                )}

                                {/* DP details only shown when DP is selected */}
                                {form.data.payment_type === 'dp' && (
                                    <>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm text-slate-600">
                                                DP (Uang Muka) — 25%
                                            </span>
                                            <span className="font-semibold text-primary">
                                                {formatCurrency(
                                                    order.dp_amount,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-2">
                                            <span className="text-sm text-slate-600">
                                                Sisa Pembayaran (Pelunasan)
                                            </span>
                                            <span className="font-medium text-primary">
                                                {formatCurrency(
                                                    order.remaining_amount,
                                                )}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {/* Pelunasan/full payment shows only total */}
                                {form.data.payment_type === 'pelunasan' && (
                                    <div className="border-t border-black/5 pt-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-semibold text-primary">
                                                Total (Pembayaran Penuh)
                                            </span>
                                            <span className="text-xl font-bold text-primary">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </span>
                                        </div>

                                        {cashbackEligible &&
                                            cashbackBreakdown.length > 0 && (
                                                <div className="mt-4 rounded-2xl border border-accent-2/20 bg-accent-2/10 p-4 text-sm text-accent">
                                                    <div className="flex items-center gap-2 font-semibold">
                                                        <Check className="size-4" />
                                                        Cashback Full Payment
                                                    </div>
                                                    <div className="mt-3 space-y-2 text-xs leading-5">
                                                        {cashbackBreakdown.map(
                                                            (item) => (
                                                                <div
                                                                    key={`${item.menu_name}-${item.kode}`}
                                                                    className="flex items-start justify-between gap-3"
                                                                >
                                                                    <span>
                                                                        {
                                                                            item.menu_name
                                                                        }{' '}
                                                                        (Gol.{' '}
                                                                        {
                                                                            item.kode
                                                                        }
                                                                        )
                                                                    </span>
                                                                    <span className="font-semibold">
                                                                        {formatCurrency(
                                                                            item.cashback,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                        <div className="flex items-center justify-between gap-3 border-t border-accent-2/20 pt-2 font-semibold">
                                                            <span>
                                                                Total Cashback
                                                            </span>
                                                            <span>
                                                                {formatCurrency(
                                                                    totalCashback,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                )}

                                {/* If no selection show total as reference */}
                                {form.data.payment_type === '' && (
                                    <div className="border-t border-black/5 pt-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-semibold text-primary">
                                                Total
                                            </span>
                                            <span className="text-xl font-bold text-primary">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Form */}
                        <form
                            onSubmit={submit}
                            className="space-y-4 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    Form
                                </p>
                                <h2 className="text-lg font-semibold text-text">
                                    Pilih jenis pembayaran & upload bukti
                                </h2>
                            </div>

                            {/* Payment Type Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-600">
                                    Jenis Pembayaran
                                </label>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        disabled={isCancelled}
                                        onClick={() =>
                                            form.setData('payment_type', 'dp')
                                        }
                                        aria-pressed={
                                            form.data.payment_type === 'dp'
                                        }
                                        className={`rounded-2xl border px-4 py-4 text-left transition-all duration-150 ${
                                            form.data.payment_type === 'dp'
                                                ? 'border-primary bg-primary text-white shadow-[0_10px_24px_-16px_rgba(122,143,107,0.65)]'
                                                : 'border-black/5 bg-[#fbfaf6] hover:border-primary/30 hover:bg-secondary/40'
                                        }`}
                                    >
                                        <p
                                            className={`text-sm font-semibold ${form.data.payment_type === 'dp' ? 'text-white' : 'text-text'}`}
                                        >
                                            DP (Uang Muka)
                                        </p>
                                        <p
                                            className={`mt-1 text-xs leading-5 ${form.data.payment_type === 'dp' ? 'text-white/80' : 'text-slate-500'}`}
                                        >
                                            Upload bukti untuk pembayaran DP.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isCancelled}
                                        onClick={() =>
                                            form.setData(
                                                'payment_type',
                                                'pelunasan',
                                            )
                                        }
                                        aria-pressed={
                                            form.data.payment_type ===
                                            'pelunasan'
                                        }
                                        className={`rounded-2xl border px-4 py-4 text-left transition-all duration-150 ${
                                            form.data.payment_type ===
                                            'pelunasan'
                                                ? 'border-primary bg-primary text-white shadow-[0_10px_24px_-16px_rgba(122,143,107,0.65)]'
                                                : 'border-black/5 bg-[#fbfaf6] hover:border-primary/30 hover:bg-secondary/40'
                                        }`}
                                    >
                                        <p
                                            className={`text-sm font-semibold ${form.data.payment_type === 'pelunasan' ? 'text-white' : 'text-text'}`}
                                        >
                                            Pembayaran Penuh
                                        </p>
                                        <p
                                            className={`mt-1 text-xs leading-5 ${form.data.payment_type === 'pelunasan' ? 'text-white/80' : 'text-slate-500'}`}
                                        >
                                            Upload bukti untuk pelunasan penuh.
                                        </p>
                                    </button>
                                </div>
                                {form.errors.payment_type && (
                                    <p className="text-xs text-red-500">
                                        {form.errors.payment_type}
                                    </p>
                                )}
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-600">
                                    Foto/Gambar Bukti Transfer
                                </label>

                                <div className="rounded-3xl border border-primary/10 bg-primary/5 p-4">
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                                        Rekening Tujuan
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-text">
                                        BCA a/n WAYAN RENDI PRAYOGA
                                    </p>
                                    <div className="mt-1 flex items-center gap-3">
                                        <p className="text-lg font-bold tracking-[0.12em] text-primary">
                                            023-1196-209
                                        </p>
                                        <button
                                            type="button"
                                            aria-label="Salin nomor rekening"
                                            onClick={() => {
                                                const text = '023-1196-209';

                                                try {
                                                    navigator.clipboard
                                                        .writeText(text)
                                                        .then(() => {
                                                            setCopied(true);
                                                            setTimeout(
                                                                () =>
                                                                    setCopied(
                                                                        false,
                                                                    ),
                                                                2000,
                                                            );
                                                        });
                                                } catch {
                                                    const el =
                                                        document.createElement(
                                                            'textarea',
                                                        );
                                                    el.value = text;
                                                    document.body.appendChild(
                                                        el,
                                                    );

                                                    el.select();
                                                    document.execCommand(
                                                        'copy',
                                                    );
                                                    document.body.removeChild(
                                                        el,
                                                    );
                                                    setCopied(true);
                                                    setTimeout(
                                                        () => setCopied(false),
                                                        2000,
                                                    );
                                                }
                                            }}
                                            className={`inline-flex items-center justify-center rounded-lg border p-2 ${copied ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'}`}
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Mohon transfer sesuai nominal tagihan
                                        lalu upload bukti pembayaran di bawah
                                        ini.
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-dashed border-primary/20 bg-[#fbfaf6] p-5 sm:p-6">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={isCancelled}
                                        onChange={(event) => {
                                            const file =
                                                event.target.files?.[0];
                                            form.setData(
                                                'proof_image',
                                                file ?? null,
                                            );

                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    setPreviewUrl(
                                                        ev.target
                                                            ?.result as string,
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                        id="proof-file"
                                    />
                                    <label
                                        htmlFor="proof-file"
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                            <Upload className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-text">
                                                Klik untuk upload atau drag file
                                                ke sini
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Format: JPG, PNG (max 2MB)
                                            </p>
                                        </div>
                                    </label>
                                </div>
                                {form.errors.proof_image && (
                                    <p className="text-xs text-red-500">
                                        {form.errors.proof_image}
                                    </p>
                                )}
                            </div>

                            {/* Preview */}
                            {previewUrl && (
                                <div className="space-y-2 rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase">
                                        Preview:
                                    </p>
                                    <img
                                        src={previewUrl}
                                        alt="Preview bukti pembayaran"
                                        className="h-40 w-full rounded-2xl object-contain"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    isCancelled ||
                                    !form.data.proof_image ||
                                    !form.data.payment_type
                                }
                                className="w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(122,143,107,0.45)] transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Mengunggah...'
                                    : isCancelled
                                      ? 'Pesanan Dibatalkan'
                                      : form.data.payment_type === 'dp'
                                        ? 'Upload Bukti DP'
                                        : form.data.payment_type === 'pelunasan'
                                          ? 'Upload Bukti Pelunasan'
                                          : 'Pilih Jenis Pembayaran'}
                            </button>
                        </form>

                        {/* Info Box */}
                        <div className="rounded-3xl border border-primary/10 bg-secondary/40 p-4 shadow-sm">
                            <p className="text-sm leading-6 text-slate-600">
                                <span className="font-semibold">Info:</span>{' '}
                                Setelah upload, bukti pembayaran Anda akan
                                diverifikasi oleh admin. Pesanan baru bisa
                                dilihat setelah bukti diverifikasi.
                            </p>
                            {order.order_status === 'dibatalkan' && (
                                <p className="mt-2 text-sm font-medium text-red-600">
                                    Pesanan ini sudah dibatalkan sehingga bukti
                                    pembayaran tidak dapat diupload lagi.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

UploadForm.layout = (page: ReactNode) => (
    <PelangganLayout>{page}</PelangganLayout>
);

export default UploadForm;
