interface SectionDividerProps {
    label: string;
    count: number;
}

export default function SectionDivider({ label, count }: SectionDividerProps) {
    return (
        <div className="flex items-center gap-3 py-1.5">
            <div className="h-px flex-1 bg-slate-100" />
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
                <span>{label}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {count}
                </span>
            </div>
            <div className="h-px flex-1 bg-slate-100" />
        </div>
    );
}
