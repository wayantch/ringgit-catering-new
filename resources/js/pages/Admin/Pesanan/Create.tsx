import { Head, router } from '@inertiajs/react';
import {
    BadgeCheck,
    LayoutGrid,
    Sparkles,
    ShoppingBag,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CustomerSummary } from '@/Components/Admin/Pesanan/Kasir/CustomerSection';
import ItemDetailSheet from '@/Components/Admin/Pesanan/Kasir/ItemDetailSheet';
import type { ItemDetailPayload } from '@/Components/Admin/Pesanan/Kasir/ItemDetailSheet';
import MenuPicker from '@/Components/Admin/Pesanan/Kasir/MenuPicker';
import type { OrderItemSummary } from '@/Components/Admin/Pesanan/Kasir/MenuPicker';
import type { MenuPickerCardItem } from '@/Components/Admin/Pesanan/Kasir/MenuPickerCard';
import type { OrderItemRowData } from '@/Components/Admin/Pesanan/Kasir/OrderItemRow';
import OrderSummaryPanel from '@/Components/Admin/Pesanan/Kasir/OrderSummaryPanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertError, alertSukses } from '@/lib/alert';
import admin from '@/routes/admin';

interface Props {
    menuItems: MenuPickerCardItem[];
    customers: CustomerSummary[];
}

interface FormErrorMap {
    [key: string]: string;
}

interface QuantityBounds {
    min: number;
    max: number | null;
}

type PaymentMethod = 'full' | 'dp';
type CustomerType = 'terdaftar' | 'walkin';
type OrderType = 'takeaway' | 'delivery';
type MobileTab = 'menu' | 'summary';

const toDateInput = (date: Date): string => date.toISOString().split('T')[0];

const getQuantityStep = (): number => 1;

const clampQuantityToBounds = (
    value: number,
    bounds: QuantityBounds | null | undefined,
): number => {
    if (!bounds) {
        return Number(value.toFixed(2));
    }

    const clampedMinimum = Math.max(bounds.min, value);

    if (bounds.max === null) {
        return Number(clampedMinimum.toFixed(2));
    }

    return Number(Math.min(bounds.max, clampedMinimum).toFixed(2));
};

const createTempId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const resolveItemCashback = (payload: ItemDetailPayload): number | null => {
    if (typeof payload.cashback === 'number' && payload.cashback > 0) {
        return payload.cashback;
    }

    if (
        (payload.menu_category_type ?? payload.menuItem.menu_type) !==
        'timbang_hidup'
    ) {
        return null;
    }

    const matchingTier = payload.menuItem.tiers.find((tier) => {
        const matchesPrice =
            Number(tier.harga_mentah) === Number(payload.price) ||
            Number(tier.harga_matang) === Number(payload.price);

        if (!matchesPrice) {
            return false;
        }

        const bounds = payload.quantityBounds ?? null;

        if (!bounds) {
            return true;
        }

        const matchesMinimum = payload.qty >= bounds.min;
        const matchesMaximum = bounds.max === null || payload.qty <= bounds.max;

        return matchesMinimum && matchesMaximum;
    });

    return matchingTier && matchingTier.cashback > 0
        ? matchingTier.cashback
        : null;
};

export default function Create({ menuItems, customers }: Props) {
    const [customerType, setCustomerType] = useState<CustomerType>('walkin');
    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerSummary | null>(null);
    const [walkInName, setWalkInName] = useState('');
    const [walkInPhone, setWalkInPhone] = useState('');
    const [walkInEmail, setWalkInEmail] = useState('');
    const [orderType, setOrderType] = useState<OrderType>('takeaway');
    const [bookingDate, setBookingDate] = useState(toDateInput(new Date()));
    const [pickupTime, setPickupTime] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('full');
    const [orderItems, setOrderItems] = useState<OrderItemRowData[]>([]);
    const [activeSheetItem, setActiveSheetItem] =
        useState<MenuPickerCardItem | null>(null);
    const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(
        null,
    );
    const [mobileTab, setMobileTab] = useState<MobileTab>('menu');
    const [processing, setProcessing] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrorMap>({});

    const calculation = useMemo(() => {
        if (orderItems.some((item) => item.price === null)) {
            return {
                isPending: true,
                subtotal: 0,
                uniqueCode: 123,
                cashback: 0,
                total: 0,
                dpUniqueCode: 456,
                dpAmount: 0,
                remaining: 0,
            };
        }

        const subtotal = orderItems.reduce((carry, item) => {
            return carry + (item.price ?? 0) * item.qty;
        }, 0);

        const cashback = orderItems.reduce((carry, item) => {
            if (item.menu_category_type !== 'timbang_hidup') {
                return carry;
            }

            return carry + (item.cashback ?? 0);
        }, 0);

        const uniqueCode = 123;
        const total =
            subtotal + uniqueCode - (paymentMethod === 'full' ? cashback : 0);
        const dpUniqueCode = 456;
        const dpAmount = Math.round(subtotal * 0.25) + dpUniqueCode;
        const remaining = subtotal + uniqueCode - dpAmount;

        return {
            isPending: false,
            subtotal,
            uniqueCode,
            cashback,
            total,
            dpUniqueCode,
            dpAmount,
            remaining,
        };
    }, [orderItems, paymentMethod]);

    const selectedSummaryItems = useMemo<OrderItemSummary[]>(() => {
        return orderItems.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.qty,
        }));
    }, [orderItems]);

    const canSubmit = useMemo(() => {
        if (orderItems.length === 0) {
            return false;
        }

        if (bookingDate.trim() === '') {
            return false;
        }

        if (customerType === 'terdaftar' && selectedCustomer === null) {
            return false;
        }

        if (customerType === 'walkin' && walkInName.trim() === '') {
            return false;
        }

        if (orderType === 'takeaway' && pickupTime.trim() === '') {
            return false;
        }

        if (
            orderType === 'delivery' &&
            (deliveryTime.trim() === '' || deliveryAddress.trim() === '')
        ) {
            return false;
        }

        return true;
    }, [
        bookingDate,
        customerType,
        deliveryAddress,
        deliveryTime,
        orderItems.length,
        pickupTime,
        selectedCustomer,
        walkInName,
        orderType,
    ]);

    const customerTypeLabel =
        customerType === 'terdaftar' ? 'Pelanggan terdaftar' : 'Walk-in';
    const paymentMethodLabel = paymentMethod === 'full' ? 'Full payment' : 'DP';

    const addMenuItem = (item: MenuPickerCardItem): void => {
        setActiveSheetItem(item);
    };

    const pushItem = (payload: ItemDetailPayload): void => {
        setOrderItems((current) => {
            const existingIndex = current.findIndex(
                (item) => item.menu_item_id === payload.menu_item_id,
            );

            const nextItem: OrderItemRowData = {
                tempId:
                    existingIndex >= 0
                        ? current[existingIndex].tempId
                        : createTempId(),
                menu_item_id: payload.menu_item_id,
                menu_name: payload.menu_name,
                menu_category_type:
                    payload.menu_category_type ?? payload.menuItem.menu_type,
                menu_unit: payload.menu_unit,
                menu_image: payload.menu_image,
                base_price: payload.base_price,
                qty: payload.qty,
                price: payload.price,
                cashback: resolveItemCashback(payload),
                kondisi_produk: payload.kondisi_produk || 'mentah',
                adat_type: payload.adat_type,
                notes: payload.notes,
                quantityStep: payload.quantityStep,
                quantityBounds: payload.quantityBounds ?? null,
            };

            if (existingIndex >= 0) {
                const updated = [...current];
                const existing = current[existingIndex];
                const nextQty = clampQuantityToBounds(
                    existing.qty + payload.qty,
                    existing.quantityBounds,
                );

                updated[existingIndex] = {
                    ...existing,
                    ...nextItem,
                    qty: nextQty,
                };

                return updated;
            }

            return [...current, nextItem];
        });

        setActiveSheetItem(null);
    };

    const incrementItemByTempId = (tempId: string): void => {
        setOrderItems((current) => {
            const index = current.findIndex((entry) => entry.tempId === tempId);

            if (index < 0) {
                return current;
            }

            const step = getQuantityStep();
            const bounds = current[index].quantityBounds ?? null;
            const next = [...current];
            next[index] = {
                ...next[index],
                qty: clampQuantityToBounds(next[index].qty + step, bounds),
            };

            return next;
        });
    };

    const decrementItemByTempId = (tempId: string): void => {
        setOrderItems((current) => {
            const index = current.findIndex((entry) => entry.tempId === tempId);

            if (index < 0) {
                return current;
            }

            const step = getQuantityStep();
            const bounds = current[index].quantityBounds ?? null;
            const nextQty = clampQuantityToBounds(
                current[index].qty - step,
                bounds,
            );

            if (bounds && nextQty <= bounds.min) {
                return current.filter((entry) => entry.tempId !== tempId);
            }

            if (!bounds && nextQty <= 0) {
                return current.filter((entry) => entry.tempId !== tempId);
            }

            const next = [...current];
            next[index] = {
                ...next[index],
                qty: nextQty,
            };

            return next;
        });
    };

    const submit = (): void => {
        const payload = {
            customer_type: customerType,
            user_id:
                customerType === 'terdaftar' && selectedCustomer
                    ? selectedCustomer.id
                    : null,
            customer_name:
                customerType === 'terdaftar'
                    ? (selectedCustomer?.name ?? '')
                    : walkInName.trim(),
            customer_phone:
                customerType === 'terdaftar'
                    ? (selectedCustomer?.phone ?? null)
                    : walkInPhone.trim() === ''
                      ? null
                      : walkInPhone.trim(),
            customer_email:
                customerType === 'terdaftar'
                    ? (selectedCustomer?.email ?? null)
                    : walkInEmail.trim() === ''
                      ? null
                      : walkInEmail.trim(),
            order_type: orderType,
            booking_date: bookingDate,
            pickup_time: orderType === 'takeaway' ? pickupTime || null : null,
            delivery_time:
                orderType === 'delivery' ? deliveryTime || null : null,
            delivery_address:
                orderType === 'delivery'
                    ? deliveryAddress.trim() || null
                    : null,
            notes: notes.trim() === '' ? null : notes.trim(),
            payment_method: paymentMethod,
            items: orderItems.map((item) => ({
                menu_item_id: item.menu_item_id,
                menu_name: item.menu_name,
                menu_category_type: item.menu_category_type,
                menu_unit: item.menu_unit,
                menu_image: item.menu_image,
                base_price: item.base_price,
                qty: item.qty,
                price: item.price,
                cashback: item.cashback,
                kondisi_produk: item.kondisi_produk,
                adat_type: item.adat_type,
                notes: item.notes.trim() === '' ? null : item.notes.trim(),
            })),
        };

        setProcessing(true);
        setFormErrors({});

        router.post(admin.pesanan.store(), payload, {
            preserveScroll: true,
            onSuccess: () => {
                alertSukses('Pesanan berhasil dibuat', 'Berhasil');
            },
            onError: (errors) => {
                alertError('Gagal membuat pesanan', 'Error');
                setFormErrors(errors as FormErrorMap);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Input Pesanan Kasir" />

            <div className="min-h-screen bg-slate-50/70">
                <div className="flex w-full flex-col gap-6 p-4">
                    <section className="relative overflow-hidden rounded-4xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_30px_30px_-48px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,143,107,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(165,180,252,0.12),transparent_28%)]" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                                    <Sparkles className="size-3.5" />
                                    Input Pesanan Kasir
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-5xl">
                                        Buat pesanan
                                    </h1>
                                    <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                        Pilih menu, atur detail pelanggan, lalu
                                        tinjau ringkasan sebelum pesanan
                                        dikirim.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:w-140">
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Menu Dipilih
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                        {orderItems.length}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <ShoppingBag className="size-3.5 text-primary" />
                                        Item aktif
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Mode Pelanggan
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                        {customerTypeLabel ===
                                        'Pelanggan terdaftar'
                                            ? 'Terdaftar'
                                            : 'Walk-in'}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <Users className="size-3.5 text-primary" />
                                        {customerTypeLabel}
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Pembayaran
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                        {paymentMethodLabel}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <BadgeCheck className="size-3.5 text-primary" />
                                        {paymentMethod === 'full'
                                            ? 'Bayar lunas'
                                            : 'Bayar DP'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="lg:hidden">
                        <div className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
                            <button
                                type="button"
                                onClick={() => setMobileTab('menu')}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${mobileTab === 'menu' ? 'bg-primary text-white shadow-sm' : 'text-slate-700'}`}
                            >
                                <ShoppingBag className="size-4" />
                                Pilih Menu
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileTab('summary')}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${mobileTab === 'summary' ? 'bg-primary text-white shadow-sm' : 'text-slate-700'}`}
                            >
                                <LayoutGrid className="size-4" />
                                Ringkasan ({orderItems.length})
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start">
                        <div
                            className={`${mobileTab !== 'menu' ? 'hidden lg:block' : ''}`}
                        >
                            <div className="rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                                <MenuPicker
                                    menuItems={menuItems}
                                    orderItems={selectedSummaryItems}
                                    onOpenItemSheet={addMenuItem}
                                />
                            </div>
                        </div>

                        <div
                            className={`${mobileTab !== 'summary' ? 'hidden lg:block' : ''}`}
                        >
                            <div className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                                <OrderSummaryPanel
                                    customers={customers}
                                    customerType={customerType}
                                    onCustomerTypeChange={(value) => {
                                        setCustomerType(value);
                                        setFormErrors({});

                                        if (value === 'walkin') {
                                            setSelectedCustomer(null);
                                        } else {
                                            setWalkInName('');
                                            setWalkInPhone('');
                                            setWalkInEmail('');
                                        }
                                    }}
                                    selectedCustomer={selectedCustomer}
                                    onSelectCustomer={(customer) => {
                                        setSelectedCustomer(customer);
                                        setFormErrors({});
                                    }}
                                    onClearCustomer={() =>
                                        setSelectedCustomer(null)
                                    }
                                    walkInName={walkInName}
                                    onWalkInNameChange={setWalkInName}
                                    walkInPhone={walkInPhone}
                                    onWalkInPhoneChange={setWalkInPhone}
                                    walkInEmail={walkInEmail}
                                    onWalkInEmailChange={setWalkInEmail}
                                    orderType={orderType}
                                    onOrderTypeChange={(value) => {
                                        setOrderType(value);
                                        setFormErrors({});
                                    }}
                                    bookingDate={bookingDate}
                                    onBookingDateChange={setBookingDate}
                                    pickupTime={pickupTime}
                                    onPickupTimeChange={setPickupTime}
                                    deliveryTime={deliveryTime}
                                    onDeliveryTimeChange={setDeliveryTime}
                                    deliveryAddress={deliveryAddress}
                                    onDeliveryAddressChange={setDeliveryAddress}
                                    notes={notes}
                                    onNotesChange={setNotes}
                                    items={orderItems}
                                    pendingRemovalId={pendingRemovalId}
                                    onStartRemove={setPendingRemovalId}
                                    onCancelRemove={() =>
                                        setPendingRemovalId(null)
                                    }
                                    onConfirmRemove={(tempId) => {
                                        setOrderItems((current) =>
                                            current.filter(
                                                (item) =>
                                                    item.tempId !== tempId,
                                            ),
                                        );
                                        setPendingRemovalId(null);
                                    }}
                                    onIncrement={incrementItemByTempId}
                                    onDecrement={decrementItemByTempId}
                                    paymentMethod={paymentMethod}
                                    onPaymentMethodChange={setPaymentMethod}
                                    calculation={calculation}
                                    canSubmit={canSubmit}
                                    processing={processing}
                                    onSubmit={submit}
                                    errors={formErrors}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ItemDetailSheet
                key={activeSheetItem?.id ?? 'closed'}
                isOpen={activeSheetItem !== null}
                item={activeSheetItem}
                onClose={() => setActiveSheetItem(null)}
                onSave={pushItem}
            />
        </AdminLayout>
    );
}
