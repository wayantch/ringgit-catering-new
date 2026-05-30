import type { PageProps } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    CalendarDays,
    Clock,
    Copy,
    MapPin,
    Phone,
    ReceiptText,
    Upload,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import PelangganLayout from '@/Layouts/PelangganLayout';

interface DraftCheckout {
    order_type: 'takeaway' | 'delivery';
    booking_date: string;
    booking_time: string;
    delivery_address?: string | null;
    notes?: string | null;
    phone: string;
}

interface DraftSummary {
    subtotal: number | string;
    total: number | string;
    unique_code: number | string | null;
    cashback_total: number | string;
    total_after_cashback: number | string;
    dp_amount: number | string;
    dp_total: number | string;
    dp_unique_code: number | string | null;
    remaining_amount: number | string;
}

interface DraftPayload {
    checkout: DraftCheckout;
    summary: DraftSummary;
    cart_count: number;
}

interface Props extends PageProps {
    draft: DraftPayload;
}

function formatCurrency(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function UploadDraftForm({ draft }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [paymentType, setPaymentType] = useState<'dp' | 'pelunasan'>(
        'pelunasan',
    );

    const form = useForm<{
        payment_type: 'dp' | 'pelunasan';
        proof_image: File | null;
    }>({
        payment_type: 'pelunasan',
        proof_image: null,
    });

    const isDelivery = draft.checkout.order_type === 'delivery';
    const bookingTimeLabel = isDelivery ? 'Jam Kirim' : 'Jam Ambil';
    const cashbackTotal = Number(draft.summary.cashback_total ?? 0);
    const totalDisplay = useMemo(() => {
        return paymentType === 'dp'
            ? Number(draft.summary.dp_total)
            : Number(draft.summary.total_after_cashback ?? draft.summary.total);
    }, [
        draft.summary.dp_total,
        draft.summary.total,
        draft.summary.total_after_cashback,
        paymentType,
    ]);

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.post('/user/pesanan/draft/upload-bukti', {
            forceFormData: true,
            onSuccess: () => {
                setPreviewUrl(null);
            },
        });
    };

    const bankAccountNumber = '023-1196-209';

    const copyBankAccount = (): void => {
        try {
            navigator.clipboard.writeText(bankAccountNumber).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
            });
        } catch {
            const element = document.createElement('textarea');
            element.value = bankAccountNumber;
            document.body.appendChild(element);
            element.select();
            document.execCommand('copy');
            document.body.removeChild(element);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <Head title="Upload Bukti Pembayaran" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.08),transparent_28%),linear-gradient(180deg,#fbfaf6_0%,#ffffff_30%,#f8f7f2_100%)] text-text">
                <header className="relative overflow-hidden bg-[linear-gradient(135deg,#5f7465_0%,#88a07d_52%,#dfd3be_100%)] text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.7)]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-40"
                        style={{
                            background:
                                'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%)',
                        }}
                    />
                    <div className="relative mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-14">
                        <div className="flex items-center justify-between gap-6">
                            <div className="max-w-2xl space-y-4">
                                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/85 uppercase backdrop-blur-sm">
                                    Ringgit Catering
                                </span>
                                <p className="text-sm font-medium text-white/75 sm:text-base">
                                    Checkout tersimpan sementara
                                </p>
                                <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                    Upload bukti pembayaran.
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-white/74 sm:text-base">
                                    Pesanan akan disimpan setelah bukti upload
                                    berhasil.
                                </p>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                        Simpan draft
                                    </span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                        Upload bukti
                                    </span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                        Verifikasi admin
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 shadow-lg shadow-black/10 backdrop-blur-md sm:h-16 sm:w-16">
                                    <Upload className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative -mt-6 sm:-mt-8">
                    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-8 sm:pb-16">
                        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-6 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm sm:p-6">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Ringkasan Checkout
                                    </p>
                                    <h2 className="mt-1 text-lg font-semibold text-text">
                                        Detail pesanan sementara
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-[22px] bg-[#fbfaf6] p-4 ring-1 ring-black/5">
                                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            <CalendarDays className="size-4" />
                                            tgl booking
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-text">
                                            {draft.checkout.booking_date}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] bg-[#fbfaf6] p-4 ring-1 ring-black/5">
                                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            <Clock className="size-4" />
                                            {bookingTimeLabel}
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-text">
                                            {draft.checkout.booking_time}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] bg-[#fbfaf6] p-4 ring-1 ring-black/5">
                                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            <Phone className="size-4" />
                                            Kontak
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-text">
                                            {draft.checkout.phone}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] bg-[#fbfaf6] p-4 ring-1 ring-black/5">
                                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                            <ReceiptText className="size-4" />
                                            Item
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-text">
                                            {draft.cart_count} item di keranjang
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-black/5 bg-[#fbfaf6] p-4 text-sm text-slate-600 ring-1 ring-black/5">
                                    <div className="flex items-center gap-2 font-semibold text-text">
                                        {isDelivery ? (
                                            <MapPin className="size-4" />
                                        ) : (
                                            <Clock className="size-4" />
                                        )}
                                        {isDelivery
                                            ? 'Alamat Pengiriman'
                                            : 'Pickup / Ambil di outlet'}
                                    </div>
                                    <p className="mt-2 leading-6">
                                        {isDelivery
                                            ? draft.checkout.delivery_address ||
                                              '-'
                                            : 'Pesanan akan diambil langsung di outlet.'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm sm:p-6">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Pembayaran
                                    </p>
                                    <h2 className="mt-1 text-lg font-semibold text-text">
                                        Pilih metode pembayaran
                                    </h2>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentType('pelunasan');
                                            form.setData(
                                                'payment_type',
                                                'pelunasan',
                                            );
                                        }}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${paymentType === 'pelunasan' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}
                                    >
                                        Pembayaran Penuh
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentType('dp');
                                            form.setData('payment_type', 'dp');
                                        }}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${paymentType === 'dp' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}
                                    >
                                        DP (Uang Muka)
                                    </button>
                                </div>

                                <div className="rounded-[24px] border border-primary/10 bg-primary/5 p-4 ring-1 ring-primary/10">
                                    <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                                        Rekening Tujuan
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-text">
                                        BCA a/n WAYAN RENDI PRAYOGA
                                    </p>
                                    <div className="mt-1 flex items-center gap-3">
                                        <p className="text-lg font-bold tracking-[0.12em] text-primary">
                                            {bankAccountNumber}
                                        </p>
                                        <button
                                            type="button"
                                            aria-label="Salin nomor rekening"
                                            onClick={copyBankAccount}
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
                                        Pilih metode pembayaran dulu, lalu
                                        transfer ke rekening di atas sesuai
                                        nominal yang muncul.
                                    </p>
                                </div>

                                <div className="space-y-2 rounded-[24px] bg-[#fbfaf6] p-4 text-sm ring-1 ring-black/5">
                                    {paymentType === 'pelunasan' ? (
                                        <>
                                            <div className="flex items-center justify-between gap-3 text-slate-600">
                                                <span>
                                                    Total keseluruhan item
                                                </span>
                                                <span className="font-medium text-text">
                                                    {formatCurrency(
                                                        draft.summary.subtotal,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-slate-600">
                                                <span>Kode Unik</span>
                                                <span className="font-medium text-text">
                                                    +{' '}
                                                    {draft.summary
                                                        .unique_code ?? 0}
                                                </span>
                                            </div>

                                            {cashbackTotal > 0 && (
                                                <div className="flex items-center justify-between gap-3 text-slate-600">
                                                    <span>Cashback</span>
                                                    <span className="font-medium text-text">
                                                        -{' '}
                                                        {formatCurrency(
                                                            cashbackTotal,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-2 font-semibold text-primary">
                                                <span>
                                                    Total yang harus ditransfer
                                                </span>
                                                <span className="text-lg">
                                                    {formatCurrency(
                                                        totalDisplay,
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between gap-3 text-slate-600">
                                                <span>DP 25%</span>
                                                <span className="font-medium text-text">
                                                    {formatCurrency(
                                                        draft.summary.dp_amount,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-slate-600">
                                                <span>Kode Unik DP</span>
                                                <span className="font-medium text-text">
                                                    +{' '}
                                                    {draft.summary
                                                        .dp_unique_code ??
                                                        draft.summary
                                                            .unique_code ??
                                                        0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-slate-600">
                                                <span>Sisa pembayaran</span>
                                                <span className="font-medium text-text">
                                                    {formatCurrency(
                                                        draft.summary
                                                            .remaining_amount,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-2 font-semibold text-primary">
                                                <span>
                                                    Total DP yang ditransfer
                                                </span>
                                                <span className="text-lg">
                                                    {formatCurrency(
                                                        totalDisplay,
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>

                        <form
                            onSubmit={submit}
                            className="space-y-4 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm sm:p-6"
                        >
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    Upload
                                </p>
                                <h2 className="text-lg font-semibold text-text">
                                    Pilih bukti pembayaran
                                </h2>
                            </div>

                            <div className="rounded-[24px] border border-dashed border-primary/25 bg-secondary/40 p-4">
                                <label className="block text-sm font-medium text-slate-600">
                                    Bukti pembayaran
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;
                                        form.setData('proof_image', file);

                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl);
                                        }

                                        setPreviewUrl(
                                            file
                                                ? URL.createObjectURL(file)
                                                : null,
                                        );
                                    }}
                                />
                                {form.errors.proof_image && (
                                    <p className="mt-2 text-xs text-red-500">
                                        {form.errors.proof_image}
                                    </p>
                                )}
                            </div>

                            {previewUrl && (
                                <div className="overflow-hidden rounded-[24px] border border-black/5 bg-[#fbfaf6] p-3 ring-1 ring-black/5">
                                    <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                        Preview
                                    </p>
                                    <img
                                        src={previewUrl}
                                        alt="Preview bukti pembayaran"
                                        className="h-56 w-full rounded-2xl object-contain"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    form.processing || !form.data.proof_image
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Upload className="size-4" />
                                {form.processing
                                    ? 'Mengupload...'
                                    : 'Upload bukti dan simpan pesanan'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

UploadDraftForm.layout = (page: React.ReactNode) => (
    <PelangganLayout>{page}</PelangganLayout>
);

export default UploadDraftForm;
