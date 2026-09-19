interface SectionDividerProps {
    label: string;
    count: number;
}

export default function SectionDivider({ label, count }: SectionDividerProps) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight text-text">
                {label}
            </h2>
            <span className="text-sm text-slate-400">{count} item</span>
        </div>
    );
}
