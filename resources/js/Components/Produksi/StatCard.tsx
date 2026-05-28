import React from 'react';

export default function StatCard({
    icon: Icon,
    label,
    value,
    valueColor = 'text-text',
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    valueColor?: string;
}) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className={`mt-3 text-2xl font-bold tabular-nums ${valueColor}`}>
                {value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
        </div>
    );
}
