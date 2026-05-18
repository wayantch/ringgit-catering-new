import { Head, router } from '@inertiajs/react';
import { LayoutGrid, ReceiptText, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CustomerSummary } from '@/Components/Admin/Pesanan/Kasir/CustomerSection';
import ItemDetailSheet from '@/Components/Admin/Pesanan/Kasir/ItemDetailSheet';
import type {ItemDetailPayload} from '@/Components/Admin/Pesanan/Kasir/ItemDetailSheet';
import MenuPicker from '@/Components/Admin/Pesanan/Kasir/MenuPicker';
import type {OrderItemSummary} from '@/Components/Admin/Pesanan/Kasir/MenuPicker';
import type { MenuPickerCardItem } from '@/Components/Admin/Pesanan/Kasir/MenuPickerCard';
import type { OrderItemRowData } from '@/Components/Admin/Pesanan/Kasir/OrderItemRow';
import OrderSummaryPanel from '@/Components/Admin/Pesanan/Kasir/OrderSummaryPanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertSukses, alertError } from '@/lib/alert';
import admin from '@/routes/admin';

interface Props {
    menuItems: MenuPickerCardItem[];
    customers: CustomerSummary[];
}

interface FormErrorMap {
    [key: string]: string;
}

type PaymentMethod = 'full' | 'dp';
type CustomerType = 'terdaftar' | 'walkin';
type OrderType = 'takeaway' | 'delivery';
type MobileTab = 'menu' | 'summary';

const toDateInput = (date: Date): string => date.toISOString().split('T')[0];

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const getQuantityStep = (unit: string): number => (/kg/i.test(unit) ? 0.5 : 1);

const createTempId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export default function Create({ menuItems, customers }: Props) {
    const [customerType, setCustomerType] = useState<CustomerType>('terdaftar');
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
                total: 0,
                dpUniqueCode: 456,
                dpAmount: 0,
                remaining: 0,
            };
        }

        const subtotal = orderItems.reduce((carry, item) => {
            return carry + (item.price ?? 0) * item.qty;
        }, 0);

        const uniqueCode = 123;
        const total = subtotal + uniqueCode;
        const dpUniqueCode = 456;
        const dpAmount = Math.round(subtotal * 0.25) + dpUniqueCode;
        const remaining = total - dpAmount;

        return {
            isPending: false,
            subtotal,
            uniqueCode,
            total,
            dpUniqueCode,
            dpAmount,
            remaining,
        };
    }, [orderItems]);

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
                menu_category_type: payload.menu_category_type,
                menu_unit: payload.menu_unit,
                menu_image: payload.menu_image,
                base_price: payload.base_price,
                qty: payload.qty,
                price: payload.price,
                kondisi_produk: payload.kondisi_produk || 'mentah',
                adat_type: payload.adat_type,
                notes: payload.notes,
                quantityStep: payload.quantityStep,
            };

            if (existingIndex >= 0) {
                const updated = [...current];
                const existing = current[existingIndex];
                updated[existingIndex] = {
                    ...existing,
                    ...nextItem,
                    qty: Number((existing.qty + payload.qty).toFixed(2)),
                };

                return updated;
            }

            return [...current, nextItem];
        });

        setActiveSheetItem(null);
    };

    const incrementItemFromCard = (item: MenuPickerCardItem): void => {
        setOrderItems((current) => {
            const index = current.findIndex(
                (entry) => entry.menu_item_id === item.id,
            );

            if (index < 0) {
                return current;
            }

            const step = getQuantityStep(current[index].menu_unit);
            const next = [...current];
            next[index] = {
                ...next[index],
                qty: Number((next[index].qty + step).toFixed(2)),
            };

            return next;
        });
    };

    const decrementItemFromCard = (item: MenuPickerCardItem): void => {
        setOrderItems((current) => {
            const index = current.findIndex(
                (entry) => entry.menu_item_id === item.id,
            );

            if (index < 0) {
                return current;
            }

            const step = getQuantityStep(current[index].menu_unit);
            const nextQty = Number((current[index].qty - step).toFixed(2));

            if (nextQty <= 0) {
                return current.filter(
                    (entry) => entry.menu_item_id !== item.id,
                );
            }

            const next = [...current];
            next[index] = {
                ...next[index],
                qty: nextQty,
            };

            return next;
        });
    };

    const incrementItemByTempId = (tempId: string): void => {
        setOrderItems((current) => {
            const index = current.findIndex((entry) => entry.tempId === tempId);

            if (index < 0) {
                return current;
            }

            const step = current[index].quantityStep;
            const next = [...current];
            next[index] = {
                ...next[index],
                qty: Number((next[index].qty + step).toFixed(2)),
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

            const step = current[index].quantityStep;
            const nextQty = Number((current[index].qty - step).toFixed(2));

            if (nextQty <= 0) {
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

            <div className="flex-col gap-4 p-4 lg:p-6">
                <header className="mb-5 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#ffffff_0%,#f5f1e8_48%,#e7efe0_100%)] p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                                <ReceiptText className="size-3.5" />
                                Admin Panel
                            </span>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                                    Input Pesanan Kasir
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                                    Split-screen POS untuk input pesanan manual
                                    dengan pencarian menu cepat, ringkasan
                                    real-time, dan kalkulasi pembayaran
                                    otomatis.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:w-105">
                            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    Menu
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-text">
                                    {menuItems.length}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    Item Dipilih
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-text">
                                    {orderItems.length}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                    Estimasi
                                </p>
                                <p className="mt-2 text-lg font-semibold text-text">
                                    {calculation.isPending
                                        ? 'Harga menyusul'
                                        : formatCurrency(calculation.total)}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="lg:hidden">
                    <div className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-black/5 mb-5">
                        <button
                            type="button"
                            onClick={() => setMobileTab('menu')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${mobileTab === 'menu' ? 'bg-primary text-white' : 'text-text'}`}
                        >
                            <ShoppingBag className="size-4" />
                            Pilih Menu
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab('summary')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${mobileTab === 'summary' ? 'bg-primary text-white' : 'text-text'}`}
                        >
                            <LayoutGrid className="size-4" />
                            Ringkasan ({orderItems.length})
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start">
                    <div
                        className={`${mobileTab !== 'menu' ? 'hidden lg:block' : ''}`}
                    >
                        <div className="lg:h-[calc(100vh-(--spacing(16)))] lg:overflow-y-auto lg:pr-1">
                            <MenuPicker
                                menuItems={menuItems}
                                orderItems={selectedSummaryItems}
                                onOpenItemSheet={addMenuItem}
                                onIncrement={incrementItemFromCard}
                                onDecrement={decrementItemFromCard}
                            />
                        </div>
                    </div>

                    <div
                        className={`${mobileTab !== 'summary' ? 'hidden lg:block' : ''}`}
                    >
                        <div className="lg:h-[calc(100vh-(--spacing(16)))] lg:overflow-y-auto lg:pr-1">
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
                                onCancelRemove={() => setPendingRemovalId(null)}
                                onConfirmRemove={(tempId) => {
                                    setOrderItems((current) =>
                                        current.filter(
                                            (item) => item.tempId !== tempId,
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

            <ItemDetailSheet
                isOpen={activeSheetItem !== null}
                item={activeSheetItem}
                onClose={() => setActiveSheetItem(null)}
                onSave={pushItem}
            />
        </AdminLayout>
    );
}
