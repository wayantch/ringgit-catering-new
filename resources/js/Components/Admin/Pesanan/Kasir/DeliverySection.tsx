import { CalendarDays, Package, Truck } from 'lucide-react';
import Select from '@/Components/UI/Select';

const DELIVERY_TIME_OPTIONS = Array.from({ length: 27 }, (_, index) => {
    const totalMinutes = 5 * 60 + index * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    return {
        value,
        label: value,
    };
});

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
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
            <div className="border-b border-slate-100 bg-linear-to-br from-white via-[#fcfcfa] to-primary/5 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                            Detail Pesanan
                        </p>
                        <h3 className="text-lg font-semibold tracking-tight text-text sm:text-xl">
                            Pengambilan dan pengiriman
                        </h3>
                        <p className="text-sm leading-6 text-slate-500">
                            Atur jadwal pengambilan atau kirim dengan tampilan
                            yang lebih rapi.
                        </p>
                    </div>

                    <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
                        <button
                            type="button"
                            onClick={() => onOrderTypeChange('takeaway')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${orderType === 'takeaway' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-text'}`}
                        >
                            <Package className="size-3.5" />
                            Pickup
                        </button>
                        <button
                            type="button"
                            onClick={() => onOrderTypeChange('delivery')}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${orderType === 'delivery' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-text'}`}
                        >
                            <Truck className="size-3.5" />
                            Delivery
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
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
                            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pr-4 pl-10 text-sm text-text shadow-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </label>

                {orderType === 'takeaway' ? (
                    <Select
                        id="pickup_time"
                        label="Jam Ambil"
                        placeholder="Pilih jam ambil"
                        value={pickupTime}
                        onChange={onPickupTimeChange}
                        options={DELIVERY_TIME_OPTIONS}
                    />
                ) : (
                    <Select
                        id="delivery_time"
                        label="Jam Kirim"
                        placeholder="Pilih jam kirim"
                        value={deliveryTime}
                        onChange={onDeliveryTimeChange}
                        options={DELIVERY_TIME_OPTIONS}
                    />
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
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-text shadow-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-text shadow-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </label>
            </div>

            {error && (
                <p className="border-t border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-600 sm:px-5">
                    {error}
                </p>
            )}
        </section>
    );
}
