import React from 'react';

interface MenuItem {
    id: number;
    name: string;
    category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    unit: string;
    base_price?: number;
}

interface FormItem {
    id?: number;
    menu_item_id?: number;
    menu_name: string;
    menu_category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    menu_unit: string;
    kondisi_produk: 'mentah' | 'mateng';
    adat_type?: string;
    qty: number;
    unit_price?: number;
    notes?: string;
}

interface FormData {
    user_id?: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    order_type: 'takeaway' | 'delivery';
    booking_date: string;
    pickup_time?: string;
    delivery_time?: string;
    delivery_address?: string;
    notes?: string;
    dp_percentage?: number;
    items: FormItem[];
}

interface AdminOrderFormProps {
    menuItems: MenuItem[];
    data: FormData;
    errors: Record<string, string>;
    onChange: (key: string, value: any) => void;
    onAddItemClick?: () => void;
    onRemoveItem?: (index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
}

export default function AdminOrderForm({
    menuItems,
    data,
    errors,
    onChange,
    onAddItemClick,
    onRemoveItem,
    onSubmit,
    isLoading,
}: AdminOrderFormProps) {
    const handleRemoveItem = (index: number) => {
        const updated = data.items.filter((_, i) => i !== index);
        onChange('items', updated);
        onRemoveItem?.(index);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Customer Section */}
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">
                    Informasi Pelanggan
                </h2>
                <hr className="my-4 border-slate-100" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-800">
                            Nama Pelanggan{' '}
                            <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.customer_name}
                            onChange={(e) =>
                                onChange('customer_name', e.target.value)
                            }
                            className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                        {errors.customer_name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.customer_name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-800">
                            No. HP <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            value={data.customer_phone}
                            onChange={(e) =>
                                onChange('customer_phone', e.target.value)
                            }
                            className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                        {errors.customer_phone && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.customer_phone}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-800">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.customer_email}
                            onChange={(e) =>
                                onChange('customer_email', e.target.value)
                            }
                            className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        {errors.customer_email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.customer_email}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Section */}
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">
                    Detail Pesanan
                </h2>
                <hr className="my-4 border-slate-100" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-800">
                            Jenis Pesanan{' '}
                            <span className="text-red-600">*</span>
                        </label>
                        <select
                            value={data.order_type}
                            onChange={(e) =>
                                onChange(
                                    'order_type',
                                    e.target.value as 'takeaway' | 'delivery',
                                )
                            }
                            className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        >
                            <option value="takeaway">Ambil Sendiri</option>
                            <option value="delivery">Diantar</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-800">
                            Tanggal Pesanan{' '}
                            <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.booking_date}
                            onChange={(e) =>
                                onChange('booking_date', e.target.value)
                            }
                            className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                        {errors.booking_date && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.booking_date}
                            </p>
                        )}
                    </div>
                    {data.order_type === 'takeaway' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-800">
                                Jam Pengambilan{' '}
                                <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="time"
                                value={data.pickup_time}
                                onChange={(e) =>
                                    onChange('pickup_time', e.target.value)
                                }
                                className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                required
                            />
                            {errors.pickup_time && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.pickup_time}
                                </p>
                            )}
                        </div>
                    )}
                    {data.order_type === 'delivery' && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-800">
                                    Jam Pengiriman{' '}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={data.delivery_time}
                                    onChange={(e) =>
                                        onChange(
                                            'delivery_time',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                                {errors.delivery_time && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.delivery_time}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-800">
                                    Alamat Pengiriman{' '}
                                    <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.delivery_address}
                                    onChange={(e) =>
                                        onChange(
                                            'delivery_address',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                                {errors.delivery_address && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.delivery_address}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-800">
                        Catatan (Opsional)
                    </label>
                    <textarea
                        value={data.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                        className="w-full resize-none rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        rows={3}
                    />
                </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Item Pesanan
                    </h2>
                    <button
                        type="button"
                        onClick={onAddItemClick}
                        className="rounded-xl bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
                    >
                        + Tambah Item
                    </button>
                </div>

                <hr className="my-4 border-slate-100" />
                {errors.items && (
                    <p className="text-sm text-red-600">{errors.items}</p>
                )}

                {/* Item List */}
                <div className="space-y-2">
                    {data.items.map((item: FormItem, idx: number) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-primary/10 bg-secondary/10 p-3"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-slate-800">
                                    {item.menu_name}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {item.qty} {item.menu_unit}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="ml-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                            >
                                Hapus
                            </button>
                        </div>
                    ))}
                </div>

                {data.items.length === 0 && (
                    <div className="py-6 text-center text-primary/50">
                        Belum ada item. Klik "Tambah Item" untuk mulai.
                    </div>
                )}
            </div>

            {/* Payment Section */}
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-primary">
                    Pembayaran
                </h2>
                <div>
                    <label className="mb-1 block text-sm font-medium text-primary">
                        Persentase DP (%)
                    </label>
                    <input
                        type="number"
                        value={data.dp_percentage}
                        onChange={(e) =>
                            onChange('dp_percentage', parseInt(e.target.value))
                        }
                        min="10"
                        max="100"
                        className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    {errors.dp_percentage && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.dp_percentage}
                        </p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isLoading || data.items.length === 0}
                    className="flex-1 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading ? 'Memproses...' : 'Simpan Pesanan'}
                </button>
            </div>
        </form>
    );
}
