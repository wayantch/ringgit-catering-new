import { Plus } from 'lucide-react';
import TableAction from '@/Components/UI/TableAction';

export interface VariantRow {
    label: string;
    harga: string;
}

interface VariantListProps {
    variants: VariantRow[];
    errors?: Record<string, string>;
    onChange: (index: number, field: keyof VariantRow, value: string) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
    showPriceOnly?: boolean;
}

function VariantError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 text-[11px] text-red-500">{message}</p>;
}

export default function VariantList({
    variants,
    errors,
    onChange,
    onAdd,
    onRemove,
    showPriceOnly = false,
}: VariantListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-text">
                        Varian Harga
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Tambahkan minimal satu varian. Tombol hapus tidak aktif
                        jika hanya tersisa satu baris.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
                >
                    <Plus className="size-4" />
                    Tambah Varian
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                    <thead className="bg-slate-50/70">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Label/Ukuran
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Harga
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {variants.map((variant, index) => (
                            <tr key={`${variant.label || 'variant'}-${index}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={variant.label}
                                        onChange={(event) =>
                                            onChange(
                                                index,
                                                'label',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm transition outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                        placeholder={
                                            showPriceOnly ? 'Pass 1' : '500ml'
                                        }
                                    />
                                    <VariantError
                                        message={
                                            errors?.[`variants.${index}.label`]
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={variant.harga}
                                        onChange={(event) =>
                                            onChange(
                                                index,
                                                'harga',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm transition outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                        placeholder="0"
                                    />
                                    <VariantError
                                        message={
                                            errors?.[`variants.${index}.harga`]
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <TableAction
                                        action="delete"
                                        onClick={() => onRemove(index)}
                                        disabled={variants.length === 1}
                                        label="Hapus varian"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
