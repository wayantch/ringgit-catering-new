import type { PageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    FileText,
    Gift,
    MapPin,
    Phone,
    ShoppingBag,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { FormEvent, ReactNode } from 'react';
import PelangganLayout from '@/Layouts/PelangganLayout';
import { konfirmasi, alertError } from '@/lib/alert';
import pesanan from '@/routes/user/pesanan';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItemPayload {
    id: number;
    name: string;
    min_order_hours?: number | null;
    category_type?: string | null;
}

interface CartItemPayload {
    id: number;
    quantity: number;
    menu_item: MenuItemPayload;
}

interface SummaryPayload {
    subtotal: number;
    total: number;
    count: number;
}

interface LoyaltyInfo {
    has_active_program: boolean;
    is_eligible: boolean;
    order_count: number;
    orders_needed: number | null;
    min_orders: number | null;
    discount_type: 'nominal' | 'percentage' | null;
    discount_value: number | null;
    discount_preview: number | null;
    period_start: string | null;
    period_end: string | null;
    description: string | null;
    config_id: string | null;
}

interface Props extends PageProps {
    user: { phone?: string | null; address?: string | null };
    cartItems: CartItemPayload[];
    summary: SummaryPayload;
    loyalty: LoyaltyInfo;
}

interface SharedProps extends PageProps {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTimeOptions(): Array<{ value: string; label: string }> {
    const options: Array<{ value: string; label: string }> = [];

    for (let hour = 5; hour <= 18; hour++) {
        for (const minute of [0, 30]) {
            if (hour === 18 && minute === 30) {
                break;
            }

            const h = String(hour).padStart(2, '0');
            const m = String(minute).padStart(2, '0');

            options.push({
                value: `${h}:${m}`,
                label: `${h}.${m}`,
            });
        }
    }

    return options;
}

const timeOptions = generateTimeOptions();

function toDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function FieldLabel({
    children,
    htmlFor,
    required,
    optional,
}: {
    children: React.ReactNode;
    htmlFor?: string;
    required?: boolean;
    optional?: boolean;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1.5 block text-sm font-medium text-slate-600"
        >
            {children}
            {required && <span className="ml-1 text-red-400">*</span>}
            {optional && (
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                    opsional
                </span>
            )}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
}

function inputCls(hasError?: boolean) {
    return [
        'w-full rounded-2xl border px-4 py-3 text-sm text-text outline-none',
        'transition-all duration-150 placeholder:text-slate-400',
        hasError
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-black/5 bg-[#fbfaf6] focus:border-primary/30 focus:ring-2 focus:ring-primary/15',
    ].join(' ');
}

function formatCurrency(amount: number | null): string {
    if (amount === null) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description?: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
            <div className="pt-1 lg:pt-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-text">{title}</p>
                </div>
                {description && (
                    <p className="mt-1.5 pl-10 text-xs leading-relaxed text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
                {children}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Checkout({ user, cartItems, summary, loyalty }: Props) {
    const { props } = usePage<SharedProps>();
    const form = useForm({
        order_type: 'takeaway' as 'takeaway' | 'delivery',
        booking_date: toDateInput(new Date()),
        pickup_time: '',
        delivery_time: '',
        delivery_address: user.address ?? '',
        notes: '',
        phone: user.phone ?? '',
        use_loyalty_discount: false,
    });

    const isSubmittingRef = useRef(false);
    const isDelivery = form.data.order_type === 'delivery';
    const timeField = isDelivery ? 'delivery_time' : 'pickup_time';
    const selectedTime = isDelivery
        ? form.data.delivery_time
        : form.data.pickup_time;
    const flashError = props.flash?.error;

    // Temporary rule: olahan/eceran items can only be booked starting H+1.
    const now = new Date();
    const todayDate = toDateInput(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDate = toDateInput(tomorrow);
    const hasOlahanRestriction = cartItems.some((item) => {
        const categoryType = item.menu_item?.category_type;

        return categoryType === 'olahan' || categoryType === 'eceran';
    });
    const dateMin = hasOlahanRestriction ? tomorrowDate : todayDate;

    const showOlahanWarning = hasOlahanRestriction;

    useEffect(() => {
        if (form.data.booking_date < dateMin) {
            form.setData('booking_date', dateMin);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateMin]);

    const submit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (isSubmittingRef.current || form.processing) {
            return;
        }

        form.clearErrors();

        if (!selectedTime) {
            form.setError(timeField, 'Jam booking wajib diisi.');

            return;
        }

        if (!form.data.phone.trim()) {
            form.setError('phone', 'Nomor HP wajib diisi.');

            return;
        }

        if (isDelivery && !form.data.delivery_address.trim()) {
            form.setError(
                'delivery_address',
                'Alamat wajib diisi untuk delivery.',
            );

            return;
        }

        if (form.data.booking_date < toDateInput(new Date())) {
            form.setError(
                'booking_date',
                'Tanggal tidak boleh kurang dari hari ini.',
            );

            return;
        }

        if (hasOlahanRestriction && form.data.booking_date < dateMin) {
            form.setError(
                'booking_date',
                `Untuk item olahan, booking minimal H+1 (${dateMin}).`,
            );

            return;
        }

        isSubmittingRef.current = true;

        const submitOrder = () => {
            form.post(pesanan.store().url, {
                preserveScroll: true,
                onError: () => {
                    alertError('Gagal membuat pesanan', 'Error');
                    // Validation errors are automatically available in form.errors
                },
                onFinish: () => {
                    isSubmittingRef.current = false;
                },
            });
        };

        // Show confirmation before submitting.
        // If the modal promise fails for any external reason, continue with submit.
        void (async () => {
            try {
                const result = await konfirmasi(
                    'Buat Pesanan?',
                    `Pastikan semua detail sudah benar sebelum melanjutkan.`,
                    {
                        konfirmasiLabel: 'Ya, Buat Pesanan',
                        batalLabel: 'Batal',
                    },
                );

                if (!result.isConfirmed) {
                    isSubmittingRef.current = false;

                    return;
                }
            } catch {
                // Continue to submit to avoid blocking checkout when modal promise is interrupted.
            }

            submitOrder();
        })();
    };

    return (
        <>
            <Head title="Checkout" />

            <div className="bg-[radial-gradient(circle_at_top,rgba(122,143,107,0.08),transparent_28%),linear-gradient(180deg,#fbfaf6_0%,#ffffff_30%,#f8f7f2_100%)] text-text">
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
                                <p className="text-sm font-medium text-white/75 sm:text-base">
                                    Hampir selesai!
                                </p>
                                <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                    Checkout.
                                </h1>
                                <p className="max-w-xl text-sm leading-6 text-white/74 sm:text-base">
                                    Lengkapi detail pesananmu di bawah.
                                </p>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                        Detail jadwal
                                    </span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                        Metode checkout
                                    </span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
                                        Ringkasan total
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 shadow-lg shadow-black/10 backdrop-blur-md sm:h-16 sm:w-16">
                                    <ShoppingBag className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Form ── */}
                <div className="relative mt-8">
                    <div className="mx-auto w-full max-w-7xl px-4 pb-32 sm:px-8 sm:pb-40">
                        <form
                            onSubmit={submit}
                            noValidate
                            className="space-y-4 sm:space-y-5"
                        >
                            {flashError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {flashError}
                                </div>
                            )}

                            {/* ── Jenis Pesanan ── */}
                            <Section
                                icon={Truck}
                                title="Jenis Pesanan"
                                description="Pilih cara pengambilan pesanan kamu."
                            >
                                <div className="flex gap-2">
                                    {(
                                        [
                                            {
                                                value: 'takeaway',
                                                label: 'Pickup',
                                                icon: ShoppingBag,
                                            },
                                            {
                                                value: 'delivery',
                                                label: 'Delivery',
                                                icon: Truck,
                                            },
                                        ] as const
                                    ).map((opt) => {
                                        const Icon = opt.icon;
                                        const active =
                                            form.data.order_type === opt.value;

                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'order_type',
                                                        opt.value,
                                                    )
                                                }
                                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-150 ${
                                                    active
                                                        ? 'border-primary bg-primary text-white shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)]'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-secondary/60'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Section>

                            {/* ── Jadwal ── */}
                            <Section
                                icon={CalendarDays}
                                title="Jadwal"
                                description="Pilih tanggal dan jam pengambilan."
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Tanggal */}
                                    <div>
                                        <FieldLabel
                                            htmlFor="booking_date"
                                            required
                                        >
                                            Tanggal Booking
                                        </FieldLabel>
                                        <input
                                            id="booking_date"
                                            type="date"
                                            min={dateMin}
                                            required
                                            value={form.data.booking_date}
                                            onChange={(e) =>
                                                form.setData(
                                                    'booking_date',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputCls(
                                                !!form.errors.booking_date,
                                            )}
                                        />
                                        <FieldError
                                            message={form.errors.booking_date}
                                        />
                                        {showOlahanWarning && (
                                            <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                                Keranjang berisi item olahan.
                                                Pemesanan minimal H+1. Tanggal
                                                minimal yang diperbolehkan:
                                                <strong className="ml-1">
                                                    {dateMin}
                                                </strong>
                                                . Booking di hari yang sama
                                                tidak diperbolehkan.
                                            </p>
                                        )}
                                    </div>

                                    {/* Jam */}
                                    <div>
                                        <FieldLabel
                                            htmlFor={timeField}
                                            required
                                        >
                                            {isDelivery
                                                ? 'Kirim dari outlet jam'
                                                : 'Ambil di outlet pukul'}
                                        </FieldLabel>
                                        <select
                                            id={timeField}
                                            name={timeField}
                                            required
                                            value={selectedTime}
                                            onChange={(e) =>
                                                form.setData(
                                                    timeField,
                                                    e.target.value,
                                                )
                                            }
                                            className={`${inputCls(
                                                !!form.errors[timeField],
                                            )} cursor-pointer appearance-auto`}
                                        >
                                            <option value="" disabled>
                                                Pilih jam
                                            </option>
                                            {timeOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError
                                            message={form.errors[timeField]}
                                        />
                                    </div>
                                </div>
                            </Section>

                            {/* ── Pengiriman (hanya delivery) ── */}
                            {isDelivery && (
                                <Section
                                    icon={MapPin}
                                    title="Alamat Pengiriman"
                                    description="Isi alamat lengkap tujuan pengiriman."
                                >
                                    <div>
                                        <FieldLabel
                                            htmlFor="delivery_address"
                                            required
                                        >
                                            Alamat Lengkap
                                        </FieldLabel>
                                        <textarea
                                            id="delivery_address"
                                            rows={3}
                                            placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota..."
                                            value={form.data.delivery_address}
                                            onChange={(e) =>
                                                form.setData(
                                                    'delivery_address',
                                                    e.target.value,
                                                )
                                            }
                                            className={
                                                inputCls(
                                                    !!form.errors
                                                        .delivery_address,
                                                ) + ' resize-none'
                                            }
                                        />
                                        <FieldError
                                            message={
                                                form.errors.delivery_address
                                            }
                                        />
                                    </div>
                                </Section>
                            )}

                            {/* ── Info Kontak & Catatan ── */}
                            <Section
                                icon={Phone}
                                title="Kontak & Catatan"
                                description="Nomor HP untuk konfirmasi pesanan."
                            >
                                <div className="space-y-4">
                                    {/* Nomor HP */}
                                    <div>
                                        <FieldLabel htmlFor="phone" required>
                                            Nomor HP
                                        </FieldLabel>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="phone"
                                                type="tel"
                                                inputMode="numeric"
                                                placeholder="08xxxxxxxxxx"
                                                value={form.data.phone}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    inputCls(
                                                        !!form.errors.phone,
                                                    ) + ' pl-10'
                                                }
                                            />
                                        </div>
                                        <FieldError
                                            message={form.errors.phone}
                                        />
                                    </div>

                                    {/* Catatan */}
                                    <div>
                                        <FieldLabel htmlFor="notes" optional>
                                            <span className="flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                Catatan Tambahan
                                            </span>
                                        </FieldLabel>
                                        <textarea
                                            id="notes"
                                            rows={3}
                                            placeholder="Instruksi khusus untuk pesananmu..."
                                            value={form.data.notes}
                                            onChange={(e) =>
                                                form.setData(
                                                    'notes',
                                                    e.target.value,
                                                )
                                            }
                                            className={
                                                inputCls() + ' resize-none'
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.notes}
                                        />
                                    </div>
                                </div>
                            </Section>

                            {/* ── Loyalti ── */}
                            {loyalty.has_active_program && (
                                <Section
                                    icon={Gift}
                                    title="Diskon Loyalti"
                                    description="Gunakan diskon akhir tahun jika sudah memenuhi syarat."
                                >
                                    {loyalty.is_eligible ? (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                                    <ShieldCheck className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-emerald-800">
                                                        Kamu eligible dapat
                                                        diskon loyalti.
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-emerald-700/90">
                                                        {loyalty.description ||
                                                            'Program loyalti aktif'}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'use_loyalty_discount',
                                                        !form.data
                                                            .use_loyalty_discount,
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${
                                                    form.data
                                                        .use_loyalty_discount
                                                        ? 'border-primary/30 bg-primary/5'
                                                        : 'border-slate-200 bg-white'
                                                }`}
                                            >
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Gunakan diskon loyalti
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Diskon hanya bisa
                                                        dipakai 1x per program.
                                                    </p>
                                                </div>
                                                <span
                                                    className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                                                        form.data
                                                            .use_loyalty_discount
                                                            ? 'bg-primary'
                                                            : 'bg-slate-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-5 w-5 rounded-full bg-white shadow transition ${
                                                            form.data
                                                                .use_loyalty_discount
                                                                ? 'translate-x-5'
                                                                : 'translate-x-0'
                                                        }`}
                                                    />
                                                </span>
                                            </button>

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Hemat
                                                    </p>
                                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                                        {formatCurrency(
                                                            loyalty.discount_preview,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Preview untuk subtotal{' '}
                                                        {formatCurrency(
                                                            summary.subtotal ||
                                                                1_000_000,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Berlaku sampai
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                                        {loyalty.period_end ||
                                                            'Tidak dibatasi'}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                                        Progress
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                                        {loyalty.order_count} /{' '}
                                                        {loyalty.min_orders}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-black/5">
                                                    <Sparkles className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Program Loyalti Akhir
                                                        Tahun
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                                        {loyalty.description ||
                                                            'Selesaikan lebih banyak pesanan untuk mendapatkan diskon otomatis.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500">
                                                        Pesanan selesai
                                                    </span>
                                                    <span className="font-semibold text-slate-900">
                                                        {loyalty.order_count} /{' '}
                                                        {loyalty.min_orders}
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${Math.min(100, ((loyalty.order_count || 0) / (loyalty.min_orders || 1)) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    Sisa{' '}
                                                    {loyalty.orders_needed ?? 0}{' '}
                                                    pesanan lagi untuk dapat
                                                    diskon.
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Berlaku sampai{' '}
                                                    {loyalty.period_end ||
                                                        'tidak dibatasi'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Section>
                            )}

                            {/* ── Submit ── */}
                            <div className="relative pt-1 pb-20 sm:pb-24">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(122,143,107,0.45)] transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {form.processing ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="h-4 w-4" />
                                            Buat Pesanan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Checkout.layout = (page: ReactNode) => (
    <PelangganLayout>{page}</PelangganLayout>
);

export default Checkout;
