import { UtensilsCrossed } from 'lucide-react';
import CustomerSection from './CustomerSection';
import type { CustomerSummary } from './CustomerSection';
import DeliverySection from './DeliverySection';
import OrderItemRow from './OrderItemRow';
import type { OrderItemRowData } from './OrderItemRow';
import PaymentSection from './PaymentSection';

interface Calculation {
    isPending: boolean;
    subtotal: number;
    uniqueCode: number;
    cashback: number;
    total: number;
    dpUniqueCode: number;
    dpAmount: number;
    remaining: number;
}

interface Props {
    customers: CustomerSummary[];
    customerType: 'terdaftar' | 'walkin';
    onCustomerTypeChange: (value: 'terdaftar' | 'walkin') => void;
    selectedCustomer: CustomerSummary | null;
    onSelectCustomer: (customer: CustomerSummary) => void;
    onClearCustomer: () => void;
    walkInName: string;
    onWalkInNameChange: (value: string) => void;
    walkInPhone: string;
    onWalkInPhoneChange: (value: string) => void;
    walkInEmail: string;
    onWalkInEmailChange: (value: string) => void;
    orderType: 'takeaway' | 'delivery';
    onOrderTypeChange: (value: 'takeaway' | 'delivery') => void;
    bookingDate: string;
    onBookingDateChange: (value: string) => void;
    pickupTime: string;
    onPickupTimeChange: (value: string) => void;
    deliveryTime: string;
    onDeliveryTimeChange: (value: string) => void;
    deliveryAddress: string;
    onDeliveryAddressChange: (value: string) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    items: OrderItemRowData[];
    pendingRemovalId: string | null;
    onStartRemove: (tempId: string) => void;
    onCancelRemove: () => void;
    onConfirmRemove: (tempId: string) => void;
    onIncrement: (tempId: string) => void;
    onDecrement: (tempId: string) => void;
    paymentMethod: 'full' | 'dp';
    onPaymentMethodChange: (value: 'full' | 'dp') => void;
    calculation: Calculation;
    canSubmit: boolean;
    processing: boolean;
    onSubmit: () => void;
    errors: Record<string, string>;
}

const toDateInput = (date: Date): string => date.toISOString().split('T')[0];

export default function OrderSummaryPanel({
    customers,
    customerType,
    onCustomerTypeChange,
    selectedCustomer,
    onSelectCustomer,
    onClearCustomer,
    walkInName,
    onWalkInNameChange,
    walkInPhone,
    onWalkInPhoneChange,
    walkInEmail,
    onWalkInEmailChange,
    orderType,
    onOrderTypeChange,
    bookingDate,
    onBookingDateChange,
    pickupTime,
    onPickupTimeChange,
    deliveryTime,
    onDeliveryTimeChange,
    deliveryAddress,
    onDeliveryAddressChange,
    notes,
    onNotesChange,
    items,
    pendingRemovalId,
    onStartRemove,
    onCancelRemove,
    onConfirmRemove,
    onIncrement,
    onDecrement,
    paymentMethod,
    onPaymentMethodChange,
    calculation,
    canSubmit,
    processing,
    onSubmit,
    errors,
}: Props) {
    return (
        <section className="space-y-4">
            <CustomerSection
                customers={customers}
                customerType={customerType}
                onCustomerTypeChange={onCustomerTypeChange}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={onSelectCustomer}
                onClearCustomer={onClearCustomer}
                walkInName={walkInName}
                onWalkInNameChange={onWalkInNameChange}
                walkInPhone={walkInPhone}
                onWalkInPhoneChange={onWalkInPhoneChange}
                walkInEmail={walkInEmail}
                onWalkInEmailChange={onWalkInEmailChange}
                error={
                    errors.customer_name ||
                    errors.user_id ||
                    errors.customer_type
                }
            />

            <DeliverySection
                orderType={orderType}
                onOrderTypeChange={onOrderTypeChange}
                bookingDate={bookingDate}
                onBookingDateChange={onBookingDateChange}
                pickupTime={pickupTime}
                onPickupTimeChange={onPickupTimeChange}
                deliveryTime={deliveryTime}
                onDeliveryTimeChange={onDeliveryTimeChange}
                deliveryAddress={deliveryAddress}
                onDeliveryAddressChange={onDeliveryAddressChange}
                notes={notes}
                onNotesChange={onNotesChange}
                minDate={toDateInput(new Date())}
                error={
                    errors.booking_date ||
                    errors.delivery_address ||
                    errors.pickup_time ||
                    errors.delivery_time
                }
            />

            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                            Item Dipilih
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-text">
                            Rincian item pesanan
                        </h3>
                    </div>
                    <div className="rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-semibold text-text">
                        {items.length} item
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="flex min-h-45 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                            <UtensilsCrossed className="size-10 text-primary/40" />
                            <p className="mt-3 text-sm font-semibold text-text">
                                Pilih menu dari panel kiri
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Item yang dipilih akan muncul di sini untuk
                                dikonfirmasi kasir.
                            </p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <OrderItemRow
                                key={item.tempId}
                                item={item}
                                isPendingRemoval={
                                    pendingRemovalId === item.tempId
                                }
                                onStartRemove={onStartRemove}
                                onCancelRemove={onCancelRemove}
                                onConfirmRemove={onConfirmRemove}
                                onIncrement={onIncrement}
                                onDecrement={onDecrement}
                            />
                        ))
                    )}
                </div>
            </section>

            <PaymentSection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={onPaymentMethodChange}
                calculation={calculation}
                canSubmit={canSubmit}
                processing={processing}
                onSubmit={onSubmit}
                error={errors.items || errors.payment_method}
            />
        </section>
    );
}
