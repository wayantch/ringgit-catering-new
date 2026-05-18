interface KondisiBadgeProps {
    kondisi: string;
    adatType?: string | null;
}

export default function KondisiBadge({ kondisi, adatType }: KondisiBadgeProps) {
    const kondisiConfig: Record<
        string,
        { bg: string; text: string; label: string }
    > = {
        adat: { bg: 'bg-violet-50', text: 'text-violet-600', label: 'Adat' },
        panggang: {
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            label: 'Panggang',
        },
        saksang: { bg: 'bg-red-50', text: 'text-red-600', label: 'Saksang' },
        sop: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Sop' },
        mentah: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Mentah' },
        mateng: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            label: 'Mateng',
        },
        satuan: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Satuan' },
    };

    const config = kondisiConfig[kondisi] || {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        label: kondisi,
    };
    const label =
        adatType && kondisi === 'adat'
            ? `${config.label} ${adatType}`
            : config.label;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
        >
            {label}
        </span>
    );
}
