import { router } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { alertError } from '@/lib/alert';
import keranjang from '@/routes/user/keranjang';
import type { CartItemTimbangHidup } from './CartItemCard';

const KONDISI_STYLE = {
    mentah: 'bg-amber-50 text-amber-700',
    mateng: 'bg-emerald-50 text-emerald-700',
} as const;

const KODE_STYLE = {
    A: 'bg-blue-50 text-blue-600',
    B: 'bg-indigo-50 text-indigo-600',
    C: 'bg-purple-50 text-purple-600',
} as const;

const ADAT_LABEL: Record<string, string> = {
    batak_lengkap: 'Lengkap',
    batak_kepala: 'Kepala',
    batak_aliang: 'Aliang',
    batak_somba: 'Somba',
    batak_soit: 'Soit',
    batak_ekor: 'Ekor',
    batak_jeroan: 'Jeroan',
    nias_barat: 'Nias Barat',
    nias_kota: 'Nias Kota',
    nias_sekitar: 'Nias Sekitar',
    nias_simbi_simbi: 'Simbi-Simbi',
};

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

function formatKg(value: number): string {
    return `${new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 1,
    }).format(value)} kg`;
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

function formatAdat(item: CartItemTimbangHidup): string {
    if (item.adat_group === 'tanpa_adat') {
        return 'Tanpa Adat';
    }

    if (item.adat_group === 'lainnya') {
        return `Lainnya: ${item.adat_notes ?? '—'}`;
    }

    if (item.adat_group === 'nias') {
        const parts =
            item.adat_parts.length > 0
                ? item.adat_parts
                      .map((part) => ADAT_LABEL[part] ?? part)
                      .join(', ')
                : 'Simbi-Simbi';

        return `Nias — ${parts}`;
    }

    if (item.adat_group === 'batak') {
        if (item.adat_parts.includes('batak_lengkap')) {
            return 'Adat Batak — Lengkap';
        }

        const parts =
            item.adat_parts.length > 0
                ? item.adat_parts
                      .map((part) => ADAT_LABEL[part] ?? part)
                      .join(', ')
                : 'Detail tidak tersimpan';

        return `Adat Batak — ${parts}`;
    }

    return 'Adat belum dipilih';
}

export default function CartItemCardTimbang({
    item,
}: {
    item: CartItemTimbangHidup;
}) {
    const imageSrc = resolveImageSrc(item.menu_item.image);
    const cashback = item.tier?.cashback ?? 0;

    const tierLabel = useMemo(() => {
        if (!item.tier) {
            return 'Tier belum terdeteksi';
        }

        return `Golongan ${item.tier.kode}`;
    }, [item.tier]);

    const remove = (): void => {
        router.delete(keranjang.destroy.url({ cart: item.id }), {
            preserveScroll: true,
            onError: () => {
                alertError('Gagal menghapus item', 'Error');
                router.reload({ only: ['cartItems', 'summary'] });
            },
        });
    };

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
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Untuk ubah berat, hapus dan tambah ulang.
                                </p>
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={remove}
                                    className="rounded-full p-2 text-red-500 transition hover:bg-red-50"
                                    aria-label="Hapus item"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            {item.tier?.kode && (
                                <span
                                    className={`rounded-full px-2.5 py-1 font-semibold ${KODE_STYLE[item.tier.kode as keyof typeof KODE_STYLE] ?? 'bg-slate-50 text-slate-600'}`}
                                >
                                    {tierLabel}
                                </span>
                            )}
                            <span
                                className={`rounded-full px-2.5 py-1 font-semibold ${KONDISI_STYLE[item.kondisi]}`}
                            >
                                {item.kondisi === 'mateng'
                                    ? 'Mateng'
                                    : 'Mentah'}
                            </span>
                            {item.tier?.is_half && (
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                                    Setengah
                                </span>
                            )}
                        </div>

                        <div className="mt-3 rounded-xl bg-[#fbfaf6] p-3 text-sm text-slate-600">
                            <p className="font-medium text-text">
                                {formatAdat(item)}
                            </p>
                            {item.adat_notes && (
                                <p className="mt-1 text-xs text-slate-500">
                                    Sisa daging: {item.adat_notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Berat
                            </p>
                            <p className="mt-1 text-sm font-semibold text-text">
                                {formatKg(item.berat)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Harga/kg
                            </p>
                            <p className="mt-1 text-sm font-semibold text-text">
                                {formatCurrency(item.harga_per_kg)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                Subtotal
                            </p>
                            <p className="mt-1 text-sm font-bold text-primary">
                                {formatCurrency(item.subtotal)}
                            </p>
                        </div>
                    </div>

                    {cashback > 0 && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent-2/10 px-3 py-1.5 text-xs font-semibold text-accent-2">
                            <Check className="size-3.5" />
                            Cashback Rp{' '}
                            {new Intl.NumberFormat('id-ID').format(cashback)}
                            jika bayar penuh
                        </div>
                    )}

                    {item.notes && (
                        <p className="mt-3 text-xs leading-6 text-slate-500 italic">
                            Catatan: {item.notes}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}
