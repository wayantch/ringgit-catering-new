import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { alertError, alertSukses } from '@/lib/alert';
import keranjang from '@/routes/user/keranjang';
import type { CartItemEceran } from './CartItemCard';

const SUB_TYPE_STYLE = {
    saksang: 'bg-red-50 text-red-600',
    panggang: 'bg-orange-50 text-orange-600',
    sop_tulang: 'bg-emerald-50 text-emerald-600',
    paket_pass: 'bg-violet-50 text-violet-600',
} as const;

function formatCurrency(value: number | null): string {
    if (value === null) {
        return 'Harga menyusul';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function resolveImageSrc(image: string | null): string | null {
    if (!image) {
        return null;
    }

    if (
        image.startsWith('http://') ||
        image.startsWith('https://') ||
        image.startsWith('/')
    ) {
        return image;
    }

    return `/storage/${image}`;
}

export default function CartItemCardEceran({ item }: { item: CartItemEceran }) {
    const [qty, setQty] = useState<number>(Math.max(1, Number(item.qty)));
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const imageSrc = resolveImageSrc(item.menu_item.image);

    useEffect(() => {
        setQty(Math.max(1, Number(item.qty)));
    }, [item.qty, item.id]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (qty === Number(item.qty)) {
                return;
            }

            router.patch(
                keranjang.update({ cart: item.id }),
                {
                    quantity: qty,
                    notes: item.notes,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        alertSukses('Item diperbarui', 'Berhasil');
                    },
                    onError: () => {
                        alertError('Gagal memperbarui item', 'Error');
                    },
                },
            );
        }, 500);

        return () => {
            window.clearTimeout(timer);
        };
    }, [item.id, item.notes, item.qty, qty]);

    const remove = (): void => {
        router.delete(keranjang.destroy({ cart: item.id }), {
            preserveScroll: true,
            onSuccess: () => {
                alertSukses('Item dihapus dari keranjang', 'Berhasil');
            },
            onError: () => {
                alertError('Gagal menghapus item', 'Error');
            },
        });
    };

    const variantLabel = item.variant?.label ?? 'Varian menu';

    return (
        <article className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
            <div className="p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                    <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-16">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={item.menu_item.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eef2ea_0%,#f8f7f2_100%)] text-[10px] text-slate-400">
                                No image
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-text sm:text-base">
                                    {item.menu_item.name}
                                </h3>
                                {item.menu_item.is_bundle && (
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Bundling dengan free ongkir{' '}
                                        {item.menu_item.free_ongkir_km !== null
                                            ? `${item.menu_item.free_ongkir_km} km`
                                            : 'menyesuaikan area'}
                                    </p>
                                )}
                            </div>

                            <div className="relative">
                                {!confirmingDelete ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmingDelete(true)
                                        }
                                        className="rounded-full p-2 text-red-500 transition hover:bg-red-50"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                                        <span>Yakin hapus?</span>
                                        <button
                                            type="button"
                                            onClick={remove}
                                            className="rounded-full bg-red-600 px-2.5 py-1 text-white transition hover:bg-red-700"
                                        >
                                            Ya
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setConfirmingDelete(false)
                                            }
                                            className="rounded-full bg-white px-2.5 py-1 text-red-700 transition hover:bg-red-100"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            {item.menu_item.sub_type && (
                                <span
                                    className={`rounded-full px-2.5 py-1 font-semibold ${SUB_TYPE_STYLE[item.menu_item.sub_type]}`}
                                >
                                    {item.menu_item.sub_type.replace('_', ' ')}
                                </span>
                            )}
                            <span className="rounded-full bg-secondary px-2.5 py-1 font-semibold text-primary">
                                {variantLabel}
                            </span>
                            {item.menu_item.is_bundle && (
                                <span className="rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-600">
                                    Bundling
                                </span>
                            )}
                        </div>

                        {item.menu_item.bundle_desc && (
                            <p className="mt-3 text-xs leading-6 text-slate-500 italic">
                                {item.menu_item.bundle_desc}
                            </p>
                        )}

                        {item.notes && (
                            <p className="mt-2 text-xs leading-6 text-slate-500 italic">
                                Catatan: {item.notes}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
                    <div className="flex items-end justify-between gap-3">
                        <div className="inline-flex items-center rounded-full border border-black/5 bg-[#fbfaf6] p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() =>
                                    setQty((value) => Math.max(1, value - 1))
                                }
                                disabled={qty <= 1}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                                −
                            </button>
                            <span className="min-w-12 px-2 text-center text-sm font-semibold text-text">
                                {qty}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQty((value) => value + 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-white"
                            >
                                +
                            </button>
                        </div>

                        <div className="text-right">
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Harga/item
                            </p>
                            <p className="mt-1 text-sm font-semibold text-text">
                                {formatCurrency(
                                    item.variant?.harga ??
                                        item.subtotal ??
                                        null,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#fbfaf6] px-3 py-2 text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold text-primary">
                            {formatCurrency(item.subtotal)}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
