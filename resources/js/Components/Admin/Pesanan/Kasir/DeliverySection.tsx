import { CalendarDays, Package, Truck } from 'lucide-react';

interface Props {
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
    minDate: string;
    error?: string;
}

export default function DeliverySection({
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
    minDate,
    error,
}: Props) {
    return (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Detail Pesanan
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-text">
                        Pengambilan dan pengiriman
                    </h3>
                </div>
                <div className="flex rounded-full bg-secondary/70 p-1">
                    <button
                        type="button"
                        onClick={() => onOrderTypeChange('takeaway')}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${orderType === 'takeaway' ? 'bg-primary text-white' : 'text-text'}`}
                    >
                        <Package className="size-3.5" />
                        Pickup
                    </button>
                    <button
                        type="button"
                        onClick={() => onOrderTypeChange('delivery')}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${orderType === 'delivery' ? 'bg-primary text-white' : 'text-text'}`}
                    >
                        <Truck className="size-3.5" />
                        Delivery
                    </button>
                </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Tanggal Booking
                    </span>
                    <div className="relative">
                        <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="date"
                            min={minDate}
                            value={bookingDate}
                            onChange={(event) =>
                                onBookingDateChange(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </label>

                {orderType === 'takeaway' ? (
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Jam Ambil
                        </span>
                        <input
                            type="time"
                            value={pickupTime}
                            onChange={(event) =>
                                onPickupTimeChange(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </label>
                ) : (
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Jam Kirim
                        </span>
                        <input
                            type="time"
                            value={deliveryTime}
                            onChange={(event) =>
                                onDeliveryTimeChange(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </label>
                )}

                {orderType === 'delivery' && (
                    <label className="block sm:col-span-2">
                        <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            Alamat Pengiriman
                        </span>
                        <textarea
                            rows={3}
                            value={deliveryAddress}
                            onChange={(event) =>
                                onDeliveryAddressChange(event.target.value)
                            }
                            placeholder="Alamat lengkap pengiriman"
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </label>
                )}

                <label className="block sm:col-span-2">
                    <span className="mb-2 block text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Catatan Tambahan
                    </span>
                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(event) => onNotesChange(event.target.value)}
                        placeholder="Opsional"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-text transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>
    );
}
