import React, { useState } from 'react';

interface MenuItem {
    id: number;
    name: string;
    category_type: 'timbang_hidup' | 'olahan' | 'eceran';
    unit: string;
    base_price?: number;
}

interface ItemPickerSheetProps {
    menuItems: MenuItem[];
    isOpen: boolean;
    onSelect: (item: any) => void;
    onClose: () => void;
}

export default function ItemPickerSheet({
    menuItems,
    isOpen,
    onSelect,
    onClose,
}: ItemPickerSheetProps) {
    const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        kondisi_produk: 'mentah' as 'mentah' | 'mateng',
        adat_type: '',
        qty: 1,
        unit_price: '',
        notes: '',
    });

    const handleSelectMenu = (item: MenuItem) => {
        setSelectedMenu(item);
        setFormData({
            ...formData,
            unit_price: item.base_price?.toString() || '',
        });
    };

    const handleAddItem = () => {
        if (!selectedMenu) {
return;
}

        onSelect({
            menu_item_id: selectedMenu.id,
            menu_name: selectedMenu.name,
            menu_category_type: selectedMenu.category_type,
            menu_unit: selectedMenu.unit,
            kondisi_produk: formData.kondisi_produk,
            adat_type: formData.adat_type || undefined,
            qty: parseInt(formData.qty.toString()),
            unit_price: formData.unit_price
                ? parseFloat(formData.unit_price)
                : undefined,
            notes: formData.notes || undefined,
        });

        // Reset
        setSelectedMenu(null);
        setFormData({
            kondisi_produk: 'mentah',
            adat_type: '',
            qty: 1,
            unit_price: '',
            notes: '',
        });
    };

    if (!isOpen) {
return null;
}

    const categoryLabel = (type: string) => {
        const labels: Record<string, string> = {
            timbang_hidup: 'Timbang Hidup',
            olahan: 'Olahan',
            eceran: 'Eceran',
        };

        return labels[type] || type;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end bg-black/50"
            onClick={onClose}
        >
            <div
                className="animate-in slide-in-from-bottom mx-auto w-full max-w-7xl rounded-t-3xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b border-primary/10 bg-white p-4">
                        <h2 className="text-lg font-semibold text-primary">
                            {selectedMenu ? 'Detail Item' : 'Pilih Produk'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-2xl leading-none text-primary/50 hover:text-primary"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-4">
                        {!selectedMenu ? (
                            /* Menu List */
                            <div className="grid grid-cols-1 gap-4 space-y-2 md:grid-cols-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelectMenu(item)}
                                        className="w-full rounded-xl border border-primary/10 p-3 text-left transition-all hover:border-primary hover:bg-secondary/10"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-primary">
                                                    {item.name}
                                                </p>
                                                <div className="mt-1 flex gap-2">
                                                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                                        {categoryLabel(
                                                            item.category_type,
                                                        )}
                                                    </span>
                                                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                                        {item.unit}
                                                    </span>
                                                </div>
                                            </div>
                                            {item.base_price && (
                                                <div className="text-right">
                                                    <p className="font-semibold text-primary">
                                                        Rp{' '}
                                                        {item.base_price.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* Detail Form */
                            <div className="space-y-4">
                                <div className="rounded-xl border border-primary/10 bg-secondary/20 p-3">
                                    <p className="font-medium text-primary">
                                        {selectedMenu.name}
                                    </p>
                                    <p className="text-sm text-primary/60">
                                        {categoryLabel(
                                            selectedMenu.category_type,
                                        )}{' '}
                                        • {selectedMenu.unit}
                                    </p>
                                </div>

                                {/* Kondisi Produk */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-primary">
                                        Kondisi Produk{' '}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {(['mentah', 'mateng'] as const).map(
                                            (kondisi) => (
                                                <button
                                                    key={kondisi}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            kondisi_produk:
                                                                kondisi,
                                                        })
                                                    }
                                                    className={`flex-1 rounded-xl px-4 py-2 font-medium transition-colors ${
                                                        formData.kondisi_produk ===
                                                        kondisi
                                                            ? 'bg-primary text-white'
                                                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                                                    }`}
                                                >
                                                    {kondisi === 'mentah'
                                                        ? 'Mentah'
                                                        : 'Mateng'}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>

                                {/* Adat Type */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-primary">
                                        Adat (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.adat_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                adat_type: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Pesan, Lada, Bawang"
                                        className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-primary">
                                        Jumlah{' '}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.qty}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                qty:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                        min="1"
                                        className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Unit Price */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-primary">
                                        Harga Unit{' '}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.unit_price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                unit_price: e.target.value,
                                            })
                                        }
                                        min="0"
                                        step="100"
                                        className="w-full rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-primary">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                notes: e.target.value,
                                            })
                                        }
                                        placeholder="Catatan tambahan..."
                                        className="w-full resize-none rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
                                    >
                                        Tambah Item
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMenu(null)}
                                        className="flex-1 rounded-xl border border-primary/10 px-4 py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
