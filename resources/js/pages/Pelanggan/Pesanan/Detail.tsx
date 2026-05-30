import type { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    Gift,
    MapPin,
    PackageCheck,
    ShoppingBag,
    Truck,
    Upload,
    XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import OrderTimelineUser from '@/Components/Pelanggan/Ordertimelineuser';
import UploadBuktiSheet from '@/Components/Pelanggan/UploadBuktiSheet';
import PelangganLayout from '@/Layouts/PelangganLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentVerification {
    id: string | number;
    payment_type: 'dp' | 'pelunasan';
    amount: string | number;
    proof_image: string | null;
    status: 'pending' | 'verified' | 'rejected';
}

interface OrderDetail {
    hashid: string;
    id: string;
    order_number: string;
    booking_date: string;
    booking_time: string;
    order_type: string;
    order_status:
        | 'baru'
        | 'menunggu_verifikasi'
        | 'diproses'
        | 'selesai'
        | 'dibatalkan';
    total_amount: string | number;
    dp_amount: string | number;
    remaining_amount: string | number;
    delivery_address?: string | null;
    source?: string;
    cashback_eligible?: boolean;
    cashback_breakdown?: Array<{
        menu_name: string;
        kode: 'A' | 'B' | 'C';
        cashback: number;
    }>;
    total_cashback?: number;
    total_after_cashback?: number;
    notes?: string | null;
    items: Array<{
        id: number;
        menu_item: string;
        menu_category_type?: string | null;
        menu_sub_type?: string | null;
        kondisi_produk: string;
        adat_type: string | null;
        quantity: string | number;
        unit_price: string | number;
        subtotal: string | number;
        notes?: string | null;
    }>;
    payment_verifications: PaymentVerification[];
}

interface Props extends PageProps {
    order: OrderDetail;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return 'Harga Menyusul';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function getLatestVerification(
    verifications: PaymentVerification[],
    paymentType: 'dp' | 'pelunasan',
): PaymentVerification | undefined {
    const verificationsByType = verifications.filter(
        (verification) => verification.payment_type === paymentType,
    );

    // Backend sends hashid for payment verification id, so lexical id comparison
    // can select the wrong record. Use the last record from relation order.
    return verificationsByType[verificationsByType.length - 1];
}

const ADAT_LABEL: Record<string, string> = {
    batak_lengkap: 'Lengkap',
    batak_kepala: 'Kepala',
    batak_aliang: 'Aliang',
    batak_somba: 'Somba',
    batak_soit: 'Soit',
    batak_ekor: 'Ekor',
    batak_jeroan: 'Jeroan',
    nias_barat: 'Nias Barat',
    nias_kota: 'Nias Kota',
    nias_sekitar: 'Nias Sekitar',
    nias_simbi_simbi: 'Simbi-Simbi',
};

function parseAdatNotes(item: OrderDetail['items'][number]): {
    adatLabel: string | null;
    detailLabel: string | null;
    sisaDaging: string | null;
    catatan: string | null;
    rawNotes: string | null;
} {
    const notes = item.notes?.trim() ?? '';

    const result = {
        adatLabel: null as string | null,
        detailLabel: null as string | null,
        sisaDaging: null as string | null,
        catatan: null as string | null,
        rawNotes: notes === '' ? null : notes,
    };

    if (notes !== '') {
        const adatMain =
            notes.match(/^Adat utama:\s*(.+)$/m)?.[1]?.trim() ?? null;
        const batakDetail =
            notes.match(/^Batak detail:\s*(.+)$/m)?.[1]?.trim() ?? null;
        const niasDetail =
            notes.match(/^Nias detail:\s*(.+)$/m)?.[1]?.trim() ?? null;
        const sisaDaging =
            notes.match(/^Sisa daging:\s*(.+)$/m)?.[1]?.trim() ?? null;
        const catatan = notes.match(/^Catatan:\s*(.+)$/m)?.[1]?.trim() ?? null;

        if (adatMain === 'Batak') {
            result.adatLabel = 'Adat Batak';

            if (batakDetail) {
                const parts = batakDetail
                    .split(',')
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .map((part) => ADAT_LABEL[part] ?? part);

                result.detailLabel =
                    parts.length > 0
                        ? `Batak — ${parts.join(', ')}`
                        : 'Adat Batak';
            }
        } else if (adatMain === 'Nias') {
            result.adatLabel = 'Adat Nias';

            if (niasDetail) {
                const parts = niasDetail
                    .split(',')
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .map((part) => ADAT_LABEL[part] ?? part);

                result.detailLabel =
                    parts.length > 0
                        ? `Nias — ${parts.join(', ')}`
                        : 'Adat Nias';
            }
        } else if (adatMain === 'Tanpa adat') {
            result.adatLabel = 'Tanpa Adat';
        }

        result.sisaDaging = sisaDaging;
        result.catatan = catatan;

        return result;
    }

    if (item.adat_type === 'batak') {
        result.adatLabel = 'Adat Batak';
    } else if (item.adat_type === 'nias') {
        result.adatLabel = 'Adat Nias';
    } else if (item.adat_type === 'tanpa_adat') {
        result.adatLabel = 'Tanpa Adat';
    } else if (item.adat_type === 'lainnya') {
        result.adatLabel = 'Lainnya';
    }

    return result;
}

function shouldShowKondisiLabel(item: OrderDetail['items'][number]): boolean {
    return (
        item.menu_category_type === 'timbang_hidup' ||
        item.menu_sub_type === 'babi_adat'
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-slate-400">{label}</p>
                <p className="text-sm font-medium text-text">{value}</p>
            </div>
        </div>
    );
}

type PaymentStatus = 'pending' | 'verified' | 'rejected';

const PAYMENT_STATUS: Record<
    PaymentStatus,
    { label: string; cls: string; icon: React.ElementType }
> = {
    pending: {
        label: 'Menunggu Verifikasi',
        cls: 'bg-amber-50 text-amber-600',
        icon: Clock,
    },
    verified: {
        label: 'Terverifikasi',
        cls: 'bg-emerald-50 text-emerald-600',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Ditolak',
        cls: 'bg-red-50 text-red-500',
        icon: XCircle,
    },
};

function PaymentRow({
    label,
    amount,
    verification,
    canUpload,
    onUpload,
}: {
    label: string;
    amount: string | number;
    verification?: PaymentVerification;
    canUpload: boolean;
    onUpload: () => void;
}) {
    const status = verification?.status ?? 'pending';
    const hasProof = !!verification?.proof_image;
    const cfg = PAYMENT_STATUS[status];
    const StatusIcon = cfg.icon;

    return (
        <div className="rounded-2xl border border-black/5 bg-[#fbfaf6] p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-medium text-slate-500">
                        {label}
                    </p>
                    <p className="mt-0.5 text-base font-bold text-text">
                        {fmt(amount)}
                    </p>
                </div>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.cls}`}
                >
                    <StatusIcon className="h-3 w-3" />
                    {hasProof && status === 'pending'
                        ? 'Menunggu konfirmasi'
                        : cfg.label}
                </span>
            </div>

            {/* Bukti yang sudah diupload */}
            {hasProof && (
                <div className="mt-3">
                    <img
                        src={`/storage/${verification!.proof_image}`}
                        alt="Bukti transfer"
                        className="h-24 w-24 rounded-2xl object-cover ring-1 ring-black/10"
                    />
                </div>
            )}

            {/* Tombol upload */}
            {canUpload &&
                status !== 'verified' &&
                (!hasProof || status === 'rejected') && (
                    <button
                        type="button"
                        onClick={onUpload}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-600"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        {status === 'rejected'
                            ? 'Ganti Bukti'
                            : `Upload Bukti ${label}`}
                    </button>
                )}

            {/* Info ditolak */}
            {status === 'rejected' && canUpload && (
                <p className="mt-2 text-xs text-red-500">
                    Bukti ditolak. Silakan upload ulang bukti transfer yang
                    benar.
                </p>
            )}
        </div>
    );
}

function CashbackInfo({
    cashbackBreakdown,
    totalCashback,
}: {
    cashbackBreakdown: Array<{
        menu_name: string;
        kode: 'A' | 'B' | 'C';
        cashback: number;
    }>;
    totalCashback: number;
}) {
    if (cashbackBreakdown.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-accent-2/20 bg-accent-2/10 p-4 text-sm text-accent">
            <div className="flex items-center gap-2 font-semibold">
                <Gift className="size-4" />
                Cashback Full Payment
            </div>
            <div className="mt-3 space-y-2 text-xs leading-5">
                {cashbackBreakdown.map((item) => (
                    <div
                        key={`${item.menu_name}-${item.kode}`}
                        className="flex items-start justify-between gap-3"
                    >
                        <span>
                            {item.menu_name} (Gol. {item.kode})
                        </span>
                        <span className="font-semibold">
                            {fmt(item.cashback)}
                        </span>
                    </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-accent-2/20 pt-2 font-semibold">
                    <span>Total Cashback</span>
                    <span>{fmt(totalCashback)}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Detail({ order }: Props) {
    const [sheetType, setSheetType] = useState<'dp' | 'pelunasan' | null>(null);
    const isCancelled = order.order_status === 'dibatalkan';

    const dpVerification = useMemo(
        () => getLatestVerification(order.payment_verifications, 'dp'),
        [order.payment_verifications],
    );
    const pelunasanVerification = useMemo(
        () => getLatestVerification(order.payment_verifications, 'pelunasan'),
        [order.payment_verifications],
    );

    const dpStatus = dpVerification?.status ?? 'pending';
    const isPelunasanOnlyFlow = !!pelunasanVerification && !dpVerification;

    // Admin order cases
    const adminDpAmount = Number(order.dp_amount) || 0;
    const isAdminOrder = order.source === 'admin';
    const isAdminFullPaid = isAdminOrder && adminDpAmount === 0;
    const isAdminWithDP = isAdminOrder && adminDpAmount > 0;
    const cashbackBreakdown = order.cashback_breakdown ?? [];
    const totalCashback = order.total_cashback ?? 0;
    const cashbackEligible =
        order.cashback_eligible ?? cashbackBreakdown.length > 0;
    const isFullPaymentOrder = isAdminOrder
        ? isAdminFullPaid
        : isPelunasanOnlyFlow;
    const shouldShowCashback =
        cashbackEligible && totalCashback > 0 && isFullPaymentOrder;
    const totalAfterCashback =
        order.total_after_cashback ??
        Math.max(Number(order.total_amount) - totalCashback, 0);
    const displayTotalAmount = shouldShowCashback
        ? totalAfterCashback
        : Number(order.total_amount);

    const isPickup = order.order_type === 'takeaway';
    const bookingTimeLabel = isPickup ? 'Jam Ambil' : 'Jam Kirim';
    const TypeIcon = isPickup ? ShoppingBag : Truck;

    return (
        <>
            <Head title={`Pesanan ${order.order_number}`} />

            <header className="relative overflow-hidden bg-[linear-gradient(135deg,#5f7465_0%,#88a07d_52%,#dfd3be_100%)] text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.7)]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        background:
                            'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%)',
                    }}
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-10"
                    style={{ background: 'rgba(255,255,255,0.5)' }}
                />

                <div className="relative mx-auto w-full max-w-7xl px-4 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-14">
                    <div className="flex items-center justify-between gap-6">
                        <div className="max-w-2xl space-y-4">
                            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-white/85 uppercase backdrop-blur-sm">
                                Ringgit Catering
                            </span>
                            <p className="font-mono text-xs font-semibold tracking-widest text-white/70">
                                {order.order_number}
                            </p>
                            <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                Detail pesanan.
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                                    <TypeIcon className="h-3 w-3" />
                                    {isPickup ? 'Pickup' : 'Delivery'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                                    <CalendarDays className="h-3 w-3" />
                                    {formatDate(order.booking_date)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                    Timeline
                                </span>
                                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                    Detail item
                                </span>
                                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                    Status pembayaran
                                </span>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 shadow-lg shadow-black/10 backdrop-blur-md sm:h-16 sm:w-16">
                                <PackageCheck className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Content ── */}
            <div className="bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.08),transparent_28%),linear-gradient(180deg,#fbfaf6_0%,#ffffff_30%,#f8f7f2_100%)] text-text">
                <div className="relative -mt-6 sm:-mt-8">
                    <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pb-8 sm:px-8">
                        {/* Timeline */}
                        <OrderTimelineUser
                            status={order.order_status}
                            bookingDate={order.booking_date}
                        />

                        {/* Grid: info + item + pembayaran */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
                            {/* ── Kiri ── */}
                            <div className="space-y-4">
                                {/* Info pesanan */}
                                <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm">
                                    <h2 className="mb-4 text-sm font-semibold tracking-tight text-text">
                                        Info Pesanan
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <InfoRow
                                            icon={CalendarDays}
                                            label="Tanggal Booking"
                                            value={formatDate(
                                                order.booking_date,
                                            )}
                                        />
                                        <InfoRow
                                            icon={Clock}
                                            label={bookingTimeLabel}
                                            value={order.booking_time}
                                        />
                                        <InfoRow
                                            icon={TypeIcon}
                                            label="Jenis Pengiriman"
                                            value={
                                                isPickup ? 'Pickup' : 'Delivery'
                                            }
                                        />
                                        {!isPickup &&
                                            order.delivery_address && (
                                                <InfoRow
                                                    icon={MapPin}
                                                    label="Alamat Pengiriman"
                                                    value={
                                                        order.delivery_address
                                                    }
                                                />
                                            )}
                                    </div>
                                </section>

                                {/* Item pesanan */}
                                <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-sm font-semibold text-text">
                                                Item Pesanan
                                            </h2>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Detail item sesuai pesanan
                                                pelanggan.
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                                            {order.items.length} item
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {order.items.map((item) =>
                                            (() => {
                                                const parsedNotes =
                                                    parseAdatNotes(item);

                                                return (
                                                    <article
                                                        key={item.id}
                                                        className="rounded-[24px] border border-black/5 bg-[#fbfaf6] p-4 shadow-sm ring-1 ring-black/5"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold text-text">
                                                                    {
                                                                        item.menu_item
                                                                    }
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                                                                    {shouldShowKondisiLabel(
                                                                        item,
                                                                    ) && (
                                                                        <span
                                                                            className={`rounded-full px-2 py-1 ${item.kondisi_produk === 'mateng' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                                                                        >
                                                                            {item.kondisi_produk ===
                                                                            'mateng'
                                                                                ? 'Mateng'
                                                                                : 'Mentah'}
                                                                        </span>
                                                                    )}
                                                                    {parsedNotes.adatLabel && (
                                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">
                                                                            {
                                                                                parsedNotes.adatLabel
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    <span className="rounded-full bg-white px-2 py-1 text-slate-500 ring-1 ring-black/5">
                                                                        {
                                                                            item.quantity
                                                                        }{' '}
                                                                        ×{' '}
                                                                        {fmt(
                                                                            item.unit_price,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                                                    Subtotal
                                                                </p>
                                                                <p className="mt-1 text-sm font-bold text-primary">
                                                                    {fmt(
                                                                        item.subtotal,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {(parsedNotes.detailLabel ||
                                                            parsedNotes.sisaDaging ||
                                                            parsedNotes.catatan ||
                                                            parsedNotes.rawNotes) && (
                                                            <div className="mt-3 space-y-1.5 text-xs leading-5 text-slate-500">
                                                                {parsedNotes.detailLabel && (
                                                                    <p>
                                                                        <span className="font-semibold text-slate-600">
                                                                            Detail
                                                                            adat:
                                                                        </span>{' '}
                                                                        {
                                                                            parsedNotes.detailLabel
                                                                        }
                                                                    </p>
                                                                )}
                                                                {parsedNotes.sisaDaging && (
                                                                    <p>
                                                                        <span className="font-semibold text-slate-600">
                                                                            Sisa
                                                                            daging:
                                                                        </span>{' '}
                                                                        {
                                                                            parsedNotes.sisaDaging
                                                                        }
                                                                    </p>
                                                                )}
                                                                {parsedNotes.catatan && (
                                                                    <p>
                                                                        <span className="font-semibold text-slate-600">
                                                                            Catatan:
                                                                        </span>{' '}
                                                                        {
                                                                            parsedNotes.catatan
                                                                        }
                                                                    </p>
                                                                )}
                                                                {!parsedNotes.detailLabel &&
                                                                    !parsedNotes.sisaDaging &&
                                                                    !parsedNotes.catatan &&
                                                                    parsedNotes.rawNotes && (
                                                                        <p>
                                                                            {
                                                                                parsedNotes.rawNotes
                                                                            }
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </article>
                                                );
                                            })(),
                                        )}
                                    </div>

                                    <div className="mt-4 rounded-[24px] bg-primary/5 px-4 py-3 ring-1 ring-primary/10">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-slate-600">
                                                Total Pesanan
                                            </p>
                                            <div className="text-right">
                                                <p className="text-base font-bold text-primary">
                                                    {fmt(displayTotalAmount)}
                                                </p>
                                                {shouldShowCashback && (
                                                    <p className="text-[11px] text-slate-500 line-through">
                                                        {fmt(
                                                            order.total_amount,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Catatan Tambahan */}
                                {order.notes && (
                                    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm">
                                        <h2 className="mb-3 text-sm font-semibold text-text">
                                            Catatan Tambahan
                                        </h2>
                                        <div className="rounded-[24px] border border-black/5 bg-[#fbfaf6] p-4 ring-1 ring-black/5">
                                            <p className="text-sm leading-6 whitespace-pre-wrap text-slate-600">
                                                {order.notes}
                                            </p>
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* ── Kanan: Pembayaran (sticky di desktop) ── */}
                            <div className="lg:sticky lg:top-4">
                                <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm">
                                    <h2 className="mb-4 text-sm font-semibold tracking-tight text-text">
                                        Pembayaran
                                    </h2>
                                    {isAdminFullPaid ? (
                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs font-medium text-emerald-600">
                                                            Status Pembayaran
                                                        </p>
                                                        <p className="mt-0.5 text-base font-bold text-emerald-700">
                                                            Sudah Dibayar
                                                        </p>
                                                    </div>
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                </div>
                                            </div>

                                            <div className="rounded-2xl bg-primary/5 px-4 py-3">
                                                <p className="text-xs text-slate-500">
                                                    Pesanan ini dibeli langsung
                                                    di kasir dan pembayaran
                                                    sudah diselesaikan.
                                                </p>
                                            </div>

                                            {/* Grand total */}
                                            <div className="mt-4 rounded-2xl bg-primary/5 px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Total Pembayaran
                                                    </p>
                                                    <p className="text-base font-bold text-primary">
                                                        {fmt(
                                                            displayTotalAmount,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {shouldShowCashback && (
                                                <CashbackInfo
                                                    cashbackBreakdown={
                                                        cashbackBreakdown
                                                    }
                                                    totalCashback={
                                                        totalCashback
                                                    }
                                                />
                                            )}
                                        </div>
                                    ) : isAdminWithDP ? (
                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-green-600">
                                                            DP Sudah Dibayar
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-green-700">
                                                            {fmt(
                                                                order.dp_amount,
                                                            )}
                                                        </p>
                                                        <p className="mt-2 text-xs text-green-600">
                                                            Pembayaran DP sudah
                                                            diselesaikan di
                                                            kasir
                                                        </p>
                                                    </div>
                                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-slate-100" />
                                                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>

                                            <PaymentRow
                                                label="Pelunasan"
                                                amount={
                                                    shouldShowCashback
                                                        ? displayTotalAmount
                                                        : order.remaining_amount
                                                }
                                                verification={
                                                    pelunasanVerification
                                                }
                                                canUpload={
                                                    order.order_status !==
                                                    'dibatalkan'
                                                }
                                                onUpload={() =>
                                                    setSheetType('pelunasan')
                                                }
                                            />

                                            {/* Grand total */}
                                            <div className="mt-4 rounded-2xl bg-primary/5 px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Total Keseluruhan
                                                    </p>
                                                    <p className="text-base font-bold text-primary">
                                                        {fmt(
                                                            displayTotalAmount,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {shouldShowCashback && (
                                                <CashbackInfo
                                                    cashbackBreakdown={
                                                        cashbackBreakdown
                                                    }
                                                    totalCashback={
                                                        totalCashback
                                                    }
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {!isPelunasanOnlyFlow && (
                                                <>
                                                    <PaymentRow
                                                        label="DP"
                                                        amount={order.dp_amount}
                                                        verification={
                                                            dpVerification
                                                        }
                                                        canUpload={
                                                            order.order_status !==
                                                            'dibatalkan'
                                                        }
                                                        onUpload={() =>
                                                            setSheetType('dp')
                                                        }
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-px flex-1 bg-slate-100" />
                                                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                                                        <div className="h-px flex-1 bg-slate-100" />
                                                    </div>
                                                </>
                                            )}
                                            <PaymentRow
                                                label="Pelunasan"
                                                amount={
                                                    shouldShowCashback
                                                        ? displayTotalAmount
                                                        : order.remaining_amount
                                                }
                                                verification={
                                                    pelunasanVerification
                                                }
                                                canUpload={
                                                    !isCancelled &&
                                                    (isPelunasanOnlyFlow
                                                        ? true
                                                        : dpStatus ===
                                                          'verified')
                                                }
                                                onUpload={() =>
                                                    setSheetType('pelunasan')
                                                }
                                            />

                                            {/* Grand total */}
                                            <div className="mt-4 rounded-2xl bg-primary/5 px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Total Keseluruhan
                                                    </p>
                                                    <p className="text-base font-bold text-primary">
                                                        {fmt(
                                                            displayTotalAmount,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {shouldShowCashback && (
                                                <CashbackInfo
                                                    cashbackBreakdown={
                                                        cashbackBreakdown
                                                    }
                                                    totalCashback={
                                                        totalCashback
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UploadBuktiSheet
                key={`${sheetType ?? 'closed'}-${isCancelled ? 'cancelled' : 'active'}`}
                isOpen={sheetType !== null}
                orderId={order.hashid}
                paymentType={sheetType ?? 'dp'}
                onClose={() => setSheetType(null)}
                isCancelled={isCancelled}
                existingProofImage={
                    sheetType === 'dp'
                        ? (dpVerification?.proof_image ?? null)
                        : (pelunasanVerification?.proof_image ?? null)
                }
            />
        </>
    );
}

Detail.layout = (page: ReactNode) => <PelangganLayout>{page}</PelangganLayout>;

export default Detail;
