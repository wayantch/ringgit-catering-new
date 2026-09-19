import type { ReactNode } from 'react';

interface MenuSectionProps {
    id: string;
    title: string;
    description: string;
    count: number;
    children: ReactNode;
}

export default function MenuSection({
    id,
    title,
    description,
    count,
    children,
}: MenuSectionProps) {
    return (
        <section id={id} className="space-y-4">
            <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-text">
                        {title}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                        {description}
                    </p>
                </div>
                <span className="shrink-0 text-sm text-slate-400">
                    {count} item
                </span>
            </div>

            {children}
        </section>
    );
}
