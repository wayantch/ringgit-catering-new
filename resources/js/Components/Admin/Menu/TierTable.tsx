import { Plus, Trash2 } from 'lucide-react';

export interface TierRow {
    kode: 'A' | 'B' | 'C';
    is_half: boolean;
    berat_min: string;
    berat_max: string;
    harga_mentah: string;
    harga_matang: string;
    cashback: string;
}

interface TierTableProps {
    tiers: TierRow[];
    errors?: Record<string, string>;
    onChange: (
        index: number,
        field: keyof TierRow,
        value: string | boolean,
    ) => void;
}

function TierCellError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 text-[11px] text-red-500">{message}</p>;
}

function formatRange(row: TierRow): string {
    if (row.berat_max === '' || row.berat_max === null) {
        return `> ${row.berat_min || '-'} kg`;
    }

    return `${row.berat_min || '-'} – ${row.berat_max} kg`;
}

function TierGroup({
    title,
    badge,
    rows,
    errors,
    onChange,
    startIndex,
}: {
    title: string;
    badge?: string;
    rows: Array<{ row: TierRow; index: number }>;
    errors?: Record<string, string>;
    onChange: TierTableProps['onChange'];
    startIndex: number;
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-text">{title}</h3>
                {badge && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                        {badge}
                    </span>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Kode
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Range Berat
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Harga Mentah
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Harga Matang
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Cashback
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Setengah
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map(({ row, index }) => (
                            <tr key={`${title}-${index}`} className="align-top">
                                <td className="px-4 py-3">
                                    <select
                                        value={row.kode}
                                        onChange={(event) =>
                                            onChange(
                                                index,
                                                'kode',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={row.berat_min}
                                                onChange={(event) =>
                                                    onChange(
                                                        index,
                                                        'berat_min',
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="Min"
                                            />
                                            <TierCellError
                                                message={
                                                    errors?.[
                                                        `tiers.${index}.berat_min`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={row.berat_max}
                                                onChange={(event) =>
                                                    onChange(
                                                        index,
                                                        'berat_max',
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="Maks"
                                            />
                                            <TierCellError
                                                message={
                                                    errors?.[
                                                        `tiers.${index}.berat_max`
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        {formatRange(row)}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={row.harga_mentah}
                                        onChange={(event) =>
                                            onChange(
                                                index,
                                                'harga_mentah',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="0"
                                    />
                                    <TierCellError
                                        message={
                                            errors?.[
                                                `tiers.${index}.harga_mentah`
                                            ]
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={row.harga_matang}
                                        onChange={(event) =>
                                            onChange(
                                                index,
                                                'harga_matang',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="0"
                                    />
                                    <TierCellError
                                        message={
                                            errors?.[
                                                `tiers.${index}.harga_matang`
                                            ]
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={row.cashback}
                                        onChange={(event) =>
                                            onChange(
                                                index,
                                                'cashback',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="0"
                                    />
                                    <TierCellError
                                        message={
                                            errors?.[`tiers.${index}.cashback`]
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={row.is_half}
                                            onChange={(event) =>
                                                onChange(
                                                    index,
                                                    'is_half',
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        {startIndex === 0 ? 'Utuh' : 'Ya'}
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function TierTable({ tiers, errors, onChange }: TierTableProps) {
    const wholeRows = tiers
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !row.is_half);

    const halfRows = tiers
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => row.is_half);

    return (
        <div className="space-y-6">
            <TierGroup
                title="UTUH / SATU EKOR"
                rows={wholeRows}
                errors={errors}
                onChange={onChange}
                startIndex={0}
            />
            <TierGroup
                title="SETENGAH EKOR"
                badge="Tanpa Adat"
                rows={halfRows}
                errors={errors}
                onChange={onChange}
                startIndex={wholeRows.length}
            />
        </div>
    );
}
