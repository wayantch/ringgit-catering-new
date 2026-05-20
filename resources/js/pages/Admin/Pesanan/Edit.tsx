import { Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import AdminOrderForm from '@/Components/Admin/AdminOrderForm';
import ItemPickerSheet from '@/Components/Admin/ItemPickerSheet';
import AdminLayout from '@/Layouts/AdminLayout';

interface MenuItem {
    id: number;
    name: string;
    category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    unit: string;
    base_price?: number;
}

interface OrderItem {
    id: number;
    menu_name: string;
    menu_category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    menu_unit: string;
    kondisi_produk: 'mentah' | 'mateng';
    adat_type?: string;
    qty: number;
    unit_price?: number;
    notes?: string;
}

interface Order {
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    order_type: 'takeaway' | 'delivery';
    booking_date: string;
    pickup_time?: string;
    delivery_time?: string;
    delivery_address?: string;
    notes?: string;
    dp_percentage: number;
    items: OrderItem[];
    isEditable: boolean;
}

interface Props {
    order: Order;
    menuItems: MenuItem[];
}

export default function Edit({ order, menuItems }: Props) {
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>(
        order.items,
    );

    const form = useForm({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email || '',
        order_type: order.order_type,
        booking_date: order.booking_date,
        pickup_time: order.pickup_time || '',
        delivery_time: order.delivery_time || '',
        delivery_address: order.delivery_address || '',
        notes: order.notes || '',
        dp_percentage: order.dp_percentage,
        items: selectedItems,
    });

    if (!order.isEditable) {
        return (
            <AdminLayout>
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="text-center">
                            <h2 className="mb-2 text-2xl font-bold text-primary">
                                Tidak Dapat Diubah
                            </h2>
                            <p className="mb-4 text-primary/60">
                                Pesanan ini tidak lagi dapat diubah karena telah
                                melewati tanggal editable_until
                            </p>
                            <Link
                                href="/admin/pesanan"
                                className="inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
                            >
                                Kembali ke Pesanan
                            </Link>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const handleAddItem = (item: any) => {
        const newItems = [...selectedItems, { ...item, id: Date.now() }];
        setSelectedItems(newItems);
        form.setData('items', newItems);
        setShowItemPicker(false);
    };

    const handleRemoveItem = (id: number) => {
        const newItems = selectedItems.filter((item) => item.id !== id);
        setSelectedItems(newItems);
        form.setData('items', newItems);
    };

    const handleSubmit = (data: any) => {
        router.patch(`/admin/pesanan/${order.id}`, data, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/admin/pesanan/${order.id}`}
                        className="mb-2 inline-block text-sm font-medium text-primary hover:text-primary/80"
                    >
                        ← Kembali
                    </Link>
                    <h1 className="text-4xl font-bold text-primary">
                        Edit Pesanan
                    </h1>
                    <p className="mt-2 text-primary/60">
                        Perbarui detail pesanan
                    </p>
                </div>

                {/* Form */}
                <AdminOrderForm
                    menuItems={menuItems}
                    onAddItemClick={() => setShowItemPicker(true)}
                    initialData={{
                        customer_name: form.data.customer_name,
                        customer_phone: form.data.customer_phone,
                        customer_email: form.data.customer_email,
                        order_type: form.data.order_type,
                        booking_date: form.data.booking_date,
                        pickup_time: form.data.pickup_time,
                        delivery_time: form.data.delivery_time,
                        delivery_address: form.data.delivery_address,
                        notes: form.data.notes,
                        dp_percentage: form.data.dp_percentage,
                        items: selectedItems,
                    }}
                    onSubmit={handleSubmit}
                    isLoading={form.processing}
                />

                {/* Item Picker Sheet */}
                <ItemPickerSheet
                    menuItems={menuItems}
                    isOpen={showItemPicker}
                    onSelect={handleAddItem}
                    onClose={() => setShowItemPicker(false)}
                />
            </div>
        </AdminLayout>
    );
}
