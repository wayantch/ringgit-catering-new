import React from 'react';

interface PesananStatusBadgeProps {
    status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
}

const statusConfig = {
    baru: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Baru' },
    diproses: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Diproses' },
    selesai: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        label: 'Selesai',
    },
    dibatalkan: { bg: 'bg-red-50', text: 'text-red-600', label: 'Dibatalkan' },
};

export default function PesananStatusBadge({
    status,
}: PesananStatusBadgeProps) {
    // Defensive: ensure config exists even if `status` is undefined or unexpected
    const config =
        (status && (statusConfig as any)[status]) ?? statusConfig.baru;

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}
