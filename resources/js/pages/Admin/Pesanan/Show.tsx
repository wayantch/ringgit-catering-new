import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Clock,
    Calendar,
    Package,
    ShoppingBag,
    Eye,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Receipt,
    UserCheck,
    Image,
} from 'lucide-react';
import React, { useState } from 'react';
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
    cashback_breakdown?: any[];
    total_cashback?: number;
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
        <div className="flex items-start gap-3">
            {Icon && (
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                    <Icon className="size-3.5 text-primary" />
                </div>
            )}
            <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                    {label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                    {value}
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
            className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}
        >
            {title && (
                <h2 className="mb-4 text-sm font-semibold text-slate-700">
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}

export default function Show({ order }: Props) {
    const [showStatusForm, setShowStatusForm] = useState(false);
    const statusForm = useForm({ status: order.order_status });

    const verificationPayments = order.payments.filter(
        (p: any) => p.is_verification,
    );
    const hasDpPayment = verificationPayments.some(
        (payment: any) =>
            payment.payment_type === 'dp' || payment.type === 'dp',
    );
    const hasFullPayment = verificationPayments.some(
        (payment: any) =>
            payment.payment_type === 'pelunasan' ||
            payment.type === 'pelunasan',
    );
    const cashbackPaymentMethod = hasFullPayment
        ? 'full'
        : hasDpPayment
          ? 'dp'
          : null;
    const totalCashback = order.total_cashback ?? 0;
    const totalAfterCashback =
        cashbackPaymentMethod === 'full' && totalCashback > 0
            ? Math.max(Number(order.total_amount) - totalCashback, 0)
            : Number(order.total_amount);
    const paymentMethodLabel =
        order.source === 'admin'
            ? Number(order.dp_amount) > 0
                ? 'DP'
                : 'Pembayaran penuh'
            : cashbackPaymentMethod === 'full'
              ? 'Pembayaran penuh'
              : cashbackPaymentMethod === 'dp'
                ? 'DP'
                : Number(order.dp_amount) > 0
                  ? 'DP'
                  : 'Pembayaran penuh';
    const pendingVerifications = verificationPayments.filter(
        (p: any) => p.status === 'pending',
    );
    const hasPendingPayments = pendingVerifications.length > 0;

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

    const handleStatusChange = () => {
        statusForm.post(`/admin/pesanan/${order.id}/update-status`, {
            onSuccess: () => {
                setShowStatusForm(false);
                window.location.reload();
            },
        });
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
            <div className="p-4">
                {/* ── PAGE HEADER ── */}
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <button
                            onClick={() => window.history.back()}
                            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary"
                        >
                            <ArrowLeft className="size-3.5" /> Kembali
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-800">
                                {order.order_number}
                            </h1>
                            <PesananStatusBadge status={order.order_status} />
                            <PesananSourceBadge source={order.source} />
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                            {order.source === 'pembeli'
                                ? 'Pesanan dari pelanggan'
                                : 'Pesanan dibuat admin'}
                            {order.created_by &&
                                ` · oleh ${order.created_by.name}`}
                        </p>
                    </div>
                    {order.source === 'admin' && order.isEditable && (
                        <Link
                            href={`/admin/pesanan/${order.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                        >
                            Edit Pesanan <ChevronRight className="size-4" />
                        </Link>
                    )}
                </div>

                {/* ── BENTO GRID ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    {/* ── MAIN COLUMN ── */}
                    <div className="space-y-4">
                        {/* Row 1: Pelanggan + Detail */}

                        {/* Bukti pembayaran pelanggan */}
                        {verificationPayments.length > 0 && (
                            <SectionCard title="Bukti Pembayaran Pelanggan">
                                <div className="divide-y divide-slate-100">
                                    {verificationPayments.map(
                                        (payment: any) => {
                                            const proofImageUrl =
                                                resolveProofImageUrl(payment);

                                            return (
                                                <div
                                                    key={payment.id}
                                                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
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
                                                                    className="size-12 rounded-xl border border-slate-200 object-cover"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100">
                                                                <Image className="size-4 text-slate-500" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">
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
                                                    <div className="flex items-center gap-2">
                                                        {/* Status chip */}
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                                payment.status ===
                                                                'pending'
                                                                    ? 'bg-amber-50 text-amber-600'
                                                                    : payment.status ===
                                                                        'verified'
                                                                      ? 'bg-emerald-50 text-emerald-600'
                                                                      : 'bg-red-50 text-red-500'
                                                            }`}
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
                                                        {/* Lihat pembayaran */}
                                                        {proofImageUrl && (
                                                            <a
                                                                href={
                                                                    proofImageUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                                                            >
                                                                <Eye className="size-3.5" />{' '}
                                                                Lihat pembayaran
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <SectionCard title="Informasi Pelanggan">
                                <div className="space-y-3.5">
                                    <InfoRow
                                        label="Nama"
                                        value={order.customer_name}
                                        icon={User}
                                    />
                                    <InfoRow
                                        label="No. HP"
                                        value={order.customer_phone}
                                        icon={Phone}
                                    />
                                    {order.customer_email && (
                                        <InfoRow
                                            label="Email"
                                            value={order.customer_email}
                                            icon={Mail}
                                        />
                                    )}
                                </div>
                            </SectionCard>

                            <SectionCard title="Detail Pesanan">
                                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                                    <InfoRow
                                        label="Metode Pembayaran"
                                        value={paymentMethodLabel}
                                        icon={Receipt}
                                    />
                                    <InfoRow
                                        label="Jenis"
                                        value={
                                            order.order_type === 'takeaway'
                                                ? 'Ambil Sendiri'
                                                : 'Diantar'
                                        }
                                        icon={ShoppingBag}
                                    />
                                    <InfoRow
                                        label="Tanggal"
                                        value={formatDate(order.booking_date)}
                                        icon={Calendar}
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
                                                value={order.delivery_address}
                                                icon={MapPin}
                                            />
                                        )}
                                </div>
                            </SectionCard>
                        </div>

                        {/* Timeline */}
                        <SectionCard>
                            <OrderTimeline
                                status={order.order_status}
                                source={order.source}
                                bookingDate={order.booking_date}
                            />
                        </SectionCard>

                        {/* Item Pesanan */}
                        <SectionCard title="Item Pesanan">
                            <OrderItemsTable
                                items={order.items}
                                paymentMethod={cashbackPaymentMethod}
                                subtotalAmount={Number(order.subtotal)}
                                totalAmount={Number(order.total_amount)}
                                uniqueCode={
                                    cashbackPaymentMethod === 'full'
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

                        {/* Cashback (moved from sidebar) */}
                        <CashbackCard
                            has_cashback={!!order.has_cashback}
                            cashback_breakdown={order.cashback_breakdown ?? []}
                            total_cashback={order.total_cashback ?? 0}
                            payment_method={cashbackPaymentMethod}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
