import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Clock,
    ChevronRight,
    CheckCircle2,
    Eye,
    Image,
    Mail,
    MapPin,
    Phone,
    ShoppingBag,
    XCircle,
    Sparkles,
} from 'lucide-react';
import React from 'react';
import OrderItemsTable from '@/Components/Admin/OrderItemsTable';
import OrderTimeline from '@/Components/Admin/OrderTimeline';
import CashbackCard from '@/Components/Admin/Pesanan/CashbackCard';
import PesananSourceBadge from '@/Components/Admin/PesananSourceBadge';
import PesananStatusBadge from '@/Components/Admin/PesananStatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    alertError,
    alertSukses,
    konfirmasi,
    konfirmasiStatus,
    promptTeks,
} from '@/lib/alert';

interface Order {
    id: number;
    order_number: string;
    source: 'pembeli' | 'admin';
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    order_type: 'takeaway' | 'delivery';
    booking_date: string;
    pickup_time?: string;
    delivery_time?: string;
    delivery_address?: string;
    order_status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
    notes?: string;
    subtotal: string;
    total_amount: string;
    unique_code?: number | null;
    dp_unique_code?: number | null;
    dp_percentage: number;
    dp_amount: string;
    remaining_amount: string;
    is_price_pending: boolean;
    editable_until?: string;
    isEditable: boolean;
    items: any[];
    payments: any[];
    has_cashback?: boolean;
    cashback_eligible?: boolean;
    cashback_breakdown?: any[];
    total_cashback?: number;
    total_after_cashback?: number;
    payment_method?: 'full' | 'dp';
    created_by?: { id: number; name: string };
    user?: { id: number; name: string };
}

interface Props {
    order: Order;
}

function InfoRow({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon?: any;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            {Icon && (
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                    <Icon className="size-3.5 text-primary" />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                    {label}
                </p>
                <p className="mt-0.5 text-sm font-medium wrap-break-word text-slate-800">
                    <span className="whitespace-pre-wrap">{value}</span>
                </p>
            </div>
        </div>
    );
}

function SectionCard({
    title,
    children,
    className = '',
}: {
    title?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}
        >
            {title && (
                <h2 className="mb-4 text-sm font-semibold text-text">
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}

export default function Show({ order }: Props) {
    const verificationPayments = order.payments.filter(
        (p: any) => p.is_verification,
    );
    const paymentMethod = order.payment_method ?? null;
    const hasCashback = order.has_cashback ?? order.cashback_eligible ?? false;
    const totalCashback = order.total_cashback ?? 0;
    const totalAfterCashback =
        order.total_after_cashback ?? Number(order.total_amount);
    const paymentMethodLabel =
        paymentMethod === 'full'
            ? 'Pembayaran penuh'
            : paymentMethod === 'dp'
              ? 'DP'
              : Number(order.dp_amount) > 0
                ? 'DP'
                : 'Pembayaran penuh';
    const pendingVerifications = verificationPayments.filter(
        (p: any) => p.status === 'pending',
    );
    const hasPendingPayments = pendingVerifications.length > 0;
    const canShowPrimaryActions = !hasPendingPayments;
    const showQuickActions = order.order_status !== 'selesai';

    const formatCurrency = (amount: string | number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(amount));

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

    const resolveProofImageUrl = (payment: any): string | null => {
        const rawUrl = payment.proof_image_url ?? payment.payment_proof;

        if (!rawUrl) {
            return null;
        }

        if (
            rawUrl.startsWith('http://') ||
            rawUrl.startsWith('https://') ||
            rawUrl.startsWith('/')
        ) {
            return rawUrl;
        }

        return `/storage/${rawUrl}`;
    };

    const handleProceed = () => {
        void (async () => {
            const result = await konfirmasiStatus(
                'Mulai Proses',
                order.order_number,
                false,
            );

            if (!result.isConfirmed) {
                return;
            }

            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            fetch(`/admin/pesanan/${order.id}/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-Token': token || '',
                },
                body: new URLSearchParams({ status: 'diproses' }),
            })
                .then(() => {
                    alertSukses('Pesanan berhasil diproses.');
                    window.location.reload();
                })
                .catch(() => {
                    alertError('Gagal memproses pesanan. Coba lagi.');
                });
        })();
    };

    const handleReject = () => {
        void (async () => {
            const reason = await promptTeks(
                'Alasan Penolakan',
                'Masukkan alasan penolakan pesanan (opsional).',
                {
                    placeholder: 'Contoh: data pelanggan tidak lengkap',
                    required: false,
                    confirmButtonText: 'Lanjutkan',
                },
            );

            if (reason === null) {
                return;
            }

            const confirmResult = await konfirmasi(
                'Tolak Pesanan?',
                'Pesanan ini akan dibatalkan.',
                {
                    konfirmasiLabel: 'Ya, Tolak',
                    batalLabel: 'Batal',
                    icon: 'warning',
                    isDanger: true,
                },
            );

            if (!confirmResult.isConfirmed) {
                return;
            }

            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            const params = new URLSearchParams({ status: 'dibatalkan' });

            if (reason) {
                params.append('reason', reason);
            }

            fetch(`/admin/pesanan/${order.id}/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-Token': token || '',
                },
                body: params,
            })
                .then(() => {
                    alertSukses('Pesanan berhasil dibatalkan.');
                    window.location.reload();
                })
                .catch(() => {
                    alertError('Gagal membatalkan pesanan. Coba lagi.');
                });
        })();
    };

    const handleVerifyPaymentVerification = (payment: any) => {
        const resolvedPaymentType =
            payment.payment_type === 'pelunasan' || payment.type === 'pelunasan'
                ? 'pelunasan'
                : 'dp';

        const amountLabel = payment.amount ?? payment.expected_amount;
        const confirmMessage = amountLabel
            ? `Verifikasi pembayaran ${resolvedPaymentType === 'dp' ? 'DP' : 'Pelunasan'} sebesar ${formatCurrency(amountLabel)}?`
            : `Verifikasi pembayaran ${resolvedPaymentType === 'dp' ? 'DP' : 'Pelunasan'}?`;

        void (async () => {
            const result = await konfirmasi(
                'Verifikasi Pembayaran?',
                confirmMessage,
                {
                    konfirmasiLabel: 'Ya, Verifikasi',
                    batalLabel: 'Batal',
                    icon: 'question',
                },
            );

            if (!result.isConfirmed) {
                return;
            }

            router.post(
                `/admin/pesanan/${order.id}/verify-payment-verification/${payment.id}`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        alertSukses('Pembayaran berhasil diverifikasi.');

                        // Auto-update status to "diproses" jika semua pembayaran sudah verified
                        setTimeout(() => {
                            const updatedPendingVerifications =
                                verificationPayments.filter(
                                    (p: any) =>
                                        p.id !== payment.id &&
                                        p.status === 'pending',
                                );

                            // Jika tidak ada pending verification lagi dan status masih "baru"
                            if (
                                updatedPendingVerifications.length === 0 &&
                                order.order_status === 'baru'
                            ) {
                                const token = document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content');

                                fetch(
                                    `/admin/pesanan/${order.id}/update-status`,
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type':
                                                'application/x-www-form-urlencoded',
                                            'X-CSRF-Token': token || '',
                                        },
                                        body: new URLSearchParams({
                                            status: 'diproses',
                                        }),
                                    },
                                )
                                    .then(() => {
                                        window.location.reload();
                                    })
                                    .catch(() => {
                                        window.location.reload();
                                    });
                            } else {
                                window.location.reload();
                            }
                        }, 500);
                    },
                    onError: () => {
                        alertError(
                            'Gagal memverifikasi pembayaran. Coba lagi.',
                        );
                    },
                },
            );
        })();
    };

    const handleRejectPaymentVerification = (payment: any) => {
        void (async () => {
            const rejectionNotes = await promptTeks(
                'Alasan Penolakan',
                'Masukkan alasan penolakan bukti pembayaran (opsional).',
                {
                    placeholder: 'Contoh: bukti transfer buram',
                    required: false,
                    confirmButtonText: 'Kirim',
                },
            );

            if (rejectionNotes === null) {
                return;
            }

            const confirmResult = await konfirmasi(
                'Tolak Bukti Pembayaran?',
                'Pelanggan akan diminta mengupload ulang bukti transfer.',
                {
                    konfirmasiLabel: 'Ya, Tolak',
                    batalLabel: 'Batal',
                    icon: 'warning',
                    isDanger: true,
                },
            );

            if (!confirmResult.isConfirmed) {
                return;
            }

            router.post(
                `/admin/pesanan/${order.id}/reject-payment-verification/${payment.id}`,
                {
                    rejection_notes: rejectionNotes ?? '',
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        alertSukses('Bukti pembayaran ditolak.');
                    },
                    onError: () => {
                        alertError(
                            'Gagal menolak bukti pembayaran. Coba lagi.',
                        );
                    },
                },
            );
        })();
    };

    const changeStatusTo = async (target: string) => {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        const params = new URLSearchParams({ status: target });

        fetch(`/admin/pesanan/${order.id}/update-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRF-Token': token || '',
            },
            body: params,
        })
            .then(() => {
                alertSukses('Status berhasil diubah.');
                window.location.reload();
            })
            .catch(() => {
                alertError('Gagal mengubah status. Coba lagi.');
            });
    };

    return (
        <AdminLayout>
            <div className="min-h-screen">
                <div className="flex w-full flex-col gap-6 p-4">
                    <section className="relative overflow-hidden rounded-4xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_30px_30px_-48px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,143,107,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(165,180,252,0.12),transparent_28%)]" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-3xl space-y-4">
                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-primary"
                                >
                                    <ArrowLeft className="size-3.5" /> Kembali
                                </button>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="font-mono text-2xl font-bold tracking-tight text-text sm:text-3xl lg:text-4xl">
                                            {order.order_number}
                                        </h1>
                                        <PesananStatusBadge
                                            status={order.order_status}
                                        />
                                        <PesananSourceBadge
                                            source={order.source}
                                        />
                                    </div>
                                    <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                        {order.source === 'pembeli'
                                            ? 'Pesanan dari pelanggan'
                                            : 'Pesanan dibuat admin'}
                                        {order.created_by
                                            ? ` · oleh ${order.created_by.name}`
                                            : ''}
                                    </p>

                                    {showQuickActions && (
                                        <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                Aksi Cepat
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {order.source === 'admin' &&
                                                    order.isEditable && (
                                                        <Link
                                                            href={`/admin/pesanan/${order.id}/edit`}
                                                            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(122,143,107,0.85)] transition hover:-translate-y-0.5 hover:bg-primary-600"
                                                        >
                                                            Edit Pesanan
                                                            <ChevronRight className="size-4" />
                                                        </Link>
                                                    )}
                                                {canShowPrimaryActions &&
                                                    order.order_status ===
                                                        'baru' && (
                                                        <button
                                                            onClick={
                                                                handleProceed
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
                                                        >
                                                            <Sparkles className="size-4" />
                                                            Mulai Proses
                                                        </button>
                                                    )}
                                                {canShowPrimaryActions &&
                                                    order.order_status ===
                                                        'diproses' && (
                                                        <button
                                                            onClick={() =>
                                                                changeStatusTo(
                                                                    'selesai',
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                                                        >
                                                            <BadgeCheck className="size-4" />
                                                            Tandai Selesai
                                                        </button>
                                                    )}
                                                {canShowPrimaryActions &&
                                                    order.order_status !==
                                                        'dibatalkan' && (
                                                        <button
                                                            onClick={
                                                                handleReject
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
                                                        >
                                                            <XCircle className="size-4" />
                                                            Batalkan
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:w-115 xl:grid-cols-2">
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Pelanggan
                                    </p>
                                    <p className="mt-2 text-lg font-semibold tracking-tight text-text">
                                        {order.customer_name}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {order.customer_phone}
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Jadwal Booking
                                    </p>
                                    <p className="mt-2 text-lg font-semibold tracking-tight text-text">
                                        {formatDate(order.booking_date)}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {order.order_type === 'takeaway'
                                            ? 'Ambil sendiri'
                                            : 'Pesanan antar'}
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Pembayaran
                                    </p>
                                    <p className="mt-2 text-lg font-semibold tracking-tight text-text">
                                        {paymentMethodLabel}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {hasPendingPayments
                                            ? `${pendingVerifications.length} bukti menunggu verifikasi`
                                            : 'Tidak ada verifikasi tertunda'}
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Total
                                    </p>
                                    <p className="mt-2 text-lg font-semibold tracking-tight text-text">
                                        {formatCurrency(totalAfterCashback)}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {hasCashback && totalCashback > 0
                                            ? `${formatCurrency(totalCashback)} cashback`
                                            : order.is_price_pending
                                              ? 'Harga menyusul'
                                              : 'Final'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-6">
                            {verificationPayments.length > 0 && (
                                <SectionCard title="Bukti Pembayaran Pelanggan">
                                    <div className="divide-y divide-slate-100">
                                        {verificationPayments.map(
                                            (payment: any) => {
                                                const proofImageUrl =
                                                    resolveProofImageUrl(
                                                        payment,
                                                    );

                                                return (
                                                    <div
                                                        key={payment.id}
                                                        className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {proofImageUrl ? (
                                                                <a
                                                                    href={
                                                                        proofImageUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block"
                                                                >
                                                                    <img
                                                                        src={
                                                                            proofImageUrl
                                                                        }
                                                                        alt="Bukti pembayaran"
                                                                        className="size-12 rounded-2xl border border-slate-200 object-cover"
                                                                    />
                                                                </a>
                                                            ) : (
                                                                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100">
                                                                    <Image className="size-4 text-slate-500" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-text">
                                                                    {payment.payment_type ===
                                                                    'dp'
                                                                        ? 'Bukti DP'
                                                                        : 'Bukti Pelunasan'}
                                                                </p>
                                                                <p className="text-xs text-slate-400">
                                                                    {payment.status ===
                                                                    'pending'
                                                                        ? 'Menunggu verifikasi'
                                                                        : payment.status ===
                                                                            'verified'
                                                                          ? 'Terverifikasi'
                                                                          : 'Ditolak'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${payment.status === 'pending' ? 'bg-amber-50 text-amber-600' : payment.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}
                                                            >
                                                                {payment.status ===
                                                                'pending'
                                                                    ? 'Pending'
                                                                    : payment.status ===
                                                                        'verified'
                                                                      ? 'Verified'
                                                                      : 'Ditolak'}
                                                            </span>
                                                            {payment.status ===
                                                                'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleVerifyPaymentVerification(
                                                                                payment,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                                    >
                                                                        <CheckCircle2 className="size-3.5" />
                                                                        Verifikasi
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRejectPaymentVerification(
                                                                                payment,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                                                                    >
                                                                        <XCircle className="size-3.5" />
                                                                        Tolak
                                                                    </button>
                                                                </>
                                                            )}
                                                            {proofImageUrl && (
                                                                <a
                                                                    href={
                                                                        proofImageUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                                                                >
                                                                    <Eye className="size-3.5" />
                                                                    Lihat
                                                                    pembayaran
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </SectionCard>
                            )}

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <SectionCard title="Informasi Pelanggan">
                                    <div className="grid min-w-0 grid-cols-1 gap-3.5 *:min-w-0">
                                        {order.customer_email && (
                                            <InfoRow
                                                label="Email"
                                                value={order.customer_email}
                                                icon={Mail}
                                            />
                                        )}
                                        <InfoRow
                                            label="No. HP"
                                            value={order.customer_phone}
                                            icon={Phone}
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Detail Pesanan">
                                    <div className="grid min-w-0 grid-cols-1 gap-3.5 *:min-w-0">
                                        <InfoRow
                                            label="Jenis"
                                            value={
                                                order.order_type === 'takeaway'
                                                    ? 'Ambil Sendiri'
                                                    : 'Diantar'
                                            }
                                            icon={ShoppingBag}
                                        />
                                        {order.order_type === 'takeaway' &&
                                            order.pickup_time && (
                                                <InfoRow
                                                    label="Jam Ambil"
                                                    value={order.pickup_time}
                                                    icon={Clock}
                                                />
                                            )}
                                        {order.order_type === 'delivery' &&
                                            order.delivery_time && (
                                                <InfoRow
                                                    label="Jam Kirim"
                                                    value={order.delivery_time}
                                                    icon={Clock}
                                                />
                                            )}
                                        {order.order_type === 'delivery' &&
                                            order.delivery_address && (
                                                <InfoRow
                                                    label="Alamat"
                                                    value={
                                                        order.delivery_address
                                                    }
                                                    icon={MapPin}
                                                />
                                            )}
                                    </div>
                                </SectionCard>
                            </div>

                            <SectionCard>
                                <OrderTimeline
                                    status={order.order_status}
                                    source={order.source}
                                    bookingDate={order.booking_date}
                                />
                            </SectionCard>

                            <SectionCard title="Item Pesanan">
                                <OrderItemsTable
                                    items={order.items}
                                    paymentMethod={paymentMethod}
                                    subtotalAmount={Number(order.subtotal)}
                                    totalAmount={Number(order.total_amount)}
                                    uniqueCode={
                                        paymentMethod === 'full'
                                            ? (order.unique_code ?? null)
                                            : (order.dp_unique_code ?? null)
                                    }
                                    totalAfterCashback={totalAfterCashback}
                                    cashbackAmount={totalCashback}
                                />
                            </SectionCard>

                            <SectionCard title="Catatan Pesanan">
                                <div className="space-y-3 text-sm text-slate-600">
                                    <div>
                                        {order.notes ? (
                                            <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 leading-6 whitespace-pre-wrap text-slate-700">
                                                {order.notes}
                                            </p>
                                        ) : (
                                            <p className="mt-2 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-slate-400">
                                                Tidak ada catatan pesanan.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            Ringkasan
                                        </p>
                                        <h2 className="mt-2 text-base font-semibold text-text">
                                            Overview Pesanan
                                        </h2>
                                    </div>
                                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                        <Sparkles className="size-5" />
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                        <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            Total Akhir
                                        </div>
                                        <div className="mt-1 text-xl font-semibold text-text">
                                            {formatCurrency(totalAfterCashback)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                        <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            Subtotal
                                        </div>
                                        <div className="mt-1 text-lg font-semibold text-text">
                                            {formatCurrency(order.subtotal)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                        <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            Cashback
                                        </div>
                                        <div className="mt-1 text-lg font-semibold text-text">
                                            {formatCurrency(totalCashback)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <CashbackCard
                                has_cashback={hasCashback}
                                cashback_breakdown={
                                    order.cashback_breakdown ?? []
                                }
                                total_cashback={totalCashback}
                                payment_method={paymentMethod}
                            />
                        </aside>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
