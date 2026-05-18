import React, { useEffect, useState } from 'react';
import {
    KONDISI_OPTIONS,
    ADAT_OPTIONS,
    requiresAdat,
    type KondisiValue,
    type CategoryType,
} from '@/constants/kondisiProduk';

interface Props {
    item: any; // menu item shape
    isOpen?: boolean;
    onClose?: () => void;
    onAdd: (payload: any) => void;
}

export default function ItemPickerSheet({
    item,
    isOpen,
    onClose,
    onAdd,
}: Props) {
    const [kondisiProduk, setKondisiProduk] = useState<KondisiValue | ''>('');
    const [adatType, setAdatType] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!isOpen || !item) return;
        setKondisiProduk('');
        setAdatType('');
        setQuantity(1);
        setNotes('');
    }, [isOpen, item]);

    const kategori = (item?.category?.type as CategoryType) ?? 'olahan';
    const kondisiOptions = KONDISI_OPTIONS[kategori] ?? KONDISI_OPTIONS.olahan;
    const showAdatPicker = requiresAdat(kondisiProduk as KondisiValue | '');

    const canAdd = kondisiProduk !== '' && (!showAdatPicker || adatType !== '');

    function handleAdd() {
        if (!canAdd) return;
        const payload = {
            menu_item_id: item.id,
            kondisi_produk: kondisiProduk,
            adat_type: adatType || null,
            quantity,
            notes,
        };
        onAdd(payload);
        onClose?.();
    }

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-60">
            <button
                type="button"
                aria-label="Tutup"
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="absolute right-0 bottom-0 left-0 mx-auto w-full max-w-2xl rounded-t-[28px] border border-black/5 bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.18)]">
                <div className="flex items-center justify-between border-b border-black/5 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                            Tambah ke pesanan
                        </p>
                        <h3 className="mt-1 truncate text-lg font-semibold text-text sm:text-xl">
                            {item.name}
                        </h3>
                    </div>
                </div>

                <div className="max-h-[calc(100vh-120px)] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                    <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                        <div className="mb-3">
                            <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                Kondisi
                            </p>
                            <p className="mt-1 text-sm font-medium text-text">
                                Pilih kondisi produk
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {kondisiOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setKondisiProduk(
                                            opt.value as KondisiValue,
                                        );
                                        setAdatType('');
                                    }}
                                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${kondisiProduk === opt.value ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20' : 'border-black/5 bg-[#fbfaf6] text-slate-600 hover:border-primary/20 hover:text-primary'}`}
                                >
                                    <span className="mr-2">{opt.emoji}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {kondisiProduk === '' && (
                            <p className="mt-2 text-center text-[11px] text-slate-400">
                                Pilih kondisi produk terlebih dahulu
                            </p>
                        )}
                    </section>

                    {showAdatPicker && (
                        <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                            <label className="mb-2 block text-sm font-semibold text-text">
                                Pilih Adat{' '}
                                <span className="ml-1 text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={adatType}
                                    onChange={(e) =>
                                        setAdatType(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-text transition outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                                >
                                    <option value="">
                                        Pilih jenis adat...
                                    </option>
                                    {['Adat Batak', 'Adat Nias', 'Lainnya'].map(
                                        (group) => (
                                            <optgroup key={group} label={group}>
                                                {ADAT_OPTIONS.filter(
                                                    (o) => o.group === group,
                                                ).map((o) => (
                                                    <option
                                                        key={o.value}
                                                        value={o.value}
                                                    >
                                                        {o.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ),
                                    )}
                                </select>
                            </div>
                        </section>
                    )}

                    <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-text">
                            Qty
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className="rounded-full border px-2"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                className="w-20 rounded-2xl border px-3 py-2"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(Number(e.target.value))
                                }
                            />
                        </div>
                    </section>

                    <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-text">
                            Catatan
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full rounded-2xl border border-black/5 bg-[#fbfaf6] px-4 py-3 text-sm transition outline-none focus:border-primary/30"
                        />
                    </section>
                </div>

                <div className="border-t border-black/5 bg-white px-4 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!canAdd}
                        className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Tambah ke Pesanan
                    </button>
                </div>
            </div>
        </div>
    );
}
