import { Link } from '@inertiajs/react';
import { ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import menu from '@/routes/admin/menu';
import AvailabilityToggle from './AvailabilityToggle';

type MenuType = 'timbang_hidup' | 'eceran';
type SubType =
    | 'saksang'
    | 'panggang'
    | 'sop_tulang'
    | 'paket_pass'
    | 'paket_nasi_box'
    | 'babi_adat';

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    image_url?: string | null;
    menu_type: MenuType;
    sub_type: SubType | null;
    min_price: string | number | null;
    babi_mentah_price?: string | number | null;
    babi_matang_price?: string | number | null;
    is_available: boolean;
    variants?: Array<{ harga: string | number | null }>;
}

interface MenuTableProps {
    items: MenuItem[];
    onDeleteClick: (item: MenuItem) => void;
}

const SUB_TYPE_LABEL: Record<SubType, string> = {
    saksang: 'Saksang',
    panggang: 'Panggang',
    sop_tulang: 'Sop Tulang',
    paket_pass: 'Paket Pass',
    paket_nasi_box: 'Paket Napass',
    babi_adat: 'Babi Adat',
};

function formatCurrency(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '0';
    }

    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function HargaDisplay({ item }: { item: MenuItem }) {
    if (item.menu_type === 'timbang_hidup') {
        const minimum = item.min_price;

        return minimum !== null && minimum !== undefined
            ? `Mulai Rp ${formatCurrency(minimum)}/kg`
            : 'Harga Belum Diatur';
    }

    if (item.menu_type === 'eceran' && item.sub_type) {
        if (item.sub_type === 'babi_adat') {
            const mentah = item.babi_mentah_price;
            const matang = item.babi_matang_price;

            if (
                (mentah === null || mentah === undefined) &&
                (matang === null || matang === undefined)
            ) {
                return 'Harga Belum Diatur';
            }

            if (
                mentah !== null &&
                mentah !== undefined &&
                (matang === null || matang === undefined)
            ) {
                return `Mentah: Rp ${formatCurrency(mentah)}`;
            }

            if (
                matang !== null &&
                matang !== undefined &&
                (mentah === null || mentah === undefined)
            ) {
                return `Matang: Rp ${formatCurrency(matang)}`;
            }

            return `Mentah: Rp ${formatCurrency(mentah)} • Matang: Rp ${formatCurrency(matang)}`;
        }

        const price = item.variants?.[0]?.harga;

        return price !== null && price !== undefined
            ? `Rp ${formatCurrency(price)}`
            : 'Harga Belum Diatur';
    }

    const prices =
        item.variants
            ?.map((variant) => Number(variant.harga))
            .filter((price) => Number.isFinite(price)) ?? [];

    if (prices.length === 0) {
        return 'Harga Belum Diatur';
    }

    const minimum = Math.min(...prices);
    const maximum = Math.max(...prices);

    return minimum === maximum
        ? `Rp ${formatCurrency(minimum)}`
        : `Rp ${formatCurrency(minimum)} – ${formatCurrency(maximum)}`;
}

export default function MenuTable({ items, onDeleteClick }: MenuTableProps) {
    if (items.length === 0) {
        return (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/90 p-10 text-center shadow-[0_18px_48px_-34px_rgba(15,23,42,0.35)] ring-1 ring-black/5">
                <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
                    <ImageIcon className="size-8" />
                </div>
                <p className="mt-4 text-base font-semibold text-text">
                    Belum ada menu
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Tambah menu pertama untuk mulai dijual.
                </p>
                <Link
                    href={menu.create()}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-600"
                >
                    <Plus className="size-4" />
                    Tambah Menu Pertama
                </Link>
            </div>
        );
    }

    return (
        <div className="relative z-0 overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                    <thead>
                        <tr className="bg-linear-to-r from-slate-50 to-white">
                            <th className="p-5 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Gambar
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Nama
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Tipe
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Harga
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Status
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-slate-100 transition-colors duration-200 hover:bg-primary/[0.03]"
                            >
                                <td className="px-4 py-4">
                                    <div className="size-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-100">
                                        {(item.image_url ?? item.image) ? (
                                            <img
                                                src={
                                                    item.image_url ??
                                                    `/storage/${item.image}`
                                                }
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-slate-400">
                                                <ImageIcon className="size-5" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="font-semibold text-text">
                                        {item.name}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                        {item.description ??
                                            'Deskripsi belum tersedia'}
                                    </p>
                                </td>
                                <td className="px-4 py-4">
                                    {item.menu_type === 'eceran' &&
                                    item.sub_type ? (
                                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                            {SUB_TYPE_LABEL[item.sub_type]}
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary ring-1 ring-primary/10">
                                            Timbang Hidup
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    {item.min_price === null &&
                                    item.menu_type === 'timbang_hidup' ? (
                                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                                            Harga Belum Diatur
                                        </span>
                                    ) : (
                                        <span className="font-medium text-text">
                                            <HargaDisplay item={item} />
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <AvailabilityToggle
                                        menuId={item.id}
                                        initialValue={item.is_available}
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={menu.edit(item.id)}
                                            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <Pencil className="size-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteClick(item)}
                                            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
