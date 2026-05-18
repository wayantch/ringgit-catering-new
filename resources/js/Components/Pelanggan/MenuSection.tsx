import type { ReactNode } from 'react';

interface MenuSectionProps {
    id: string;
    title: string;
    description: string;
    eyebrow: string;
    badge: string;
    count: number;
    tone?: 'amber' | 'rose' | 'emerald' | 'slate';
    children: ReactNode;
}

const toneStyles: Record<NonNullable<MenuSectionProps['tone']>, string> = {
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
};

export default function MenuSection({
    id,
    title,
    description,
    eyebrow,
    badge,
    count,
    tone = 'slate',
    children,
}: MenuSectionProps) {
    return (
        <section id={id} className="space-y-3 pt-2">
            <div className="flex flex-col gap-3 rounded-[28px] border border-black/5 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:px-5">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                            {eyebrow}
                        </p>
                        <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${toneStyles[tone]}`}
                        >
                            {badge}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-text sm:text-lg">
                            {title}
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start rounded-full bg-[#fbfaf6] px-3 py-2 text-xs font-medium text-slate-500">
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${tone === 'amber' ? 'bg-amber-500' : tone === 'rose' ? 'bg-rose-500' : tone === 'emerald' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    />
                    {count} item
                </div>
            </div>

            <div className="">
                {children}
            </div>
        </section>
    );
}
