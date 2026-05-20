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
    paket_nasi_box: 'Paket Nasi Box',
    babi_adat: 'Babi Adat',
};

function formatCurrency(value: string | number): string {
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
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
                <svg
                    viewBox="0 0 120 120"
                    className="mx-auto size-20 text-slate-300"
                    fill="none"
                    aria-hidden="true"
                >
                    <rect
                        x="20"
                        y="28"
                        width="80"
                        height="64"
                        rx="12"
                        stroke="currentColor"
                        strokeWidth="5"
                    />
                    <path
                        d="M35 48h50M35 62h30"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                </svg>
                <p className="mt-4 text-base font-semibold text-text">
                    Belum ada menu
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Tambah menu pertama untuk mulai dijual.
                </p>
                <Link
                    href={menu.create()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                >
                    <Plus className="size-4" />
                    Tambah Menu Pertama
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-15px_rgba(46,46,46,0.1)] ring-1 ring-black/5">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-black/5 text-left text-sm">
                    <thead>
                        <tr>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Gambar
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Nama
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Tipe
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Harga
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Status
                            </th>
                            <th className="p-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-slate-100/50 transition-all duration-200 hover:bg-primary/5"
                            >
                                <td className="px-4 py-3">
                                    <div className="size-12 overflow-hidden rounded-xl bg-slate-100">
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
                                                <ImageIcon className="size-4" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-text">
                                        {item.name}
                                    </p>
                                    <p className="line-clamp-1 text-xs text-slate-500">
                                        {item.description ?? '-'}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    {item.menu_type === 'eceran' &&
                                    item.sub_type ? (
                                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                            {SUB_TYPE_LABEL[item.sub_type]}
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                            Timbang Hidup
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {item.min_price === null &&
                                    item.menu_type === 'timbang_hidup' ? (
                                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                                            Harga Belum Diatur
                                        </span>
                                    ) : (
                                        <span className="font-medium text-text">
                                            <HargaDisplay item={item} />
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <AvailabilityToggle
                                        menuId={item.id}
                                        initialValue={item.is_available}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={menu.edit(item.id)}
                                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                                        >
                                            <Pencil className="size-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteClick(item)}
                                            className="rounded-xl border border-slate-200 bg-white p-2 text-rose-600 hover:bg-rose-50"
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
