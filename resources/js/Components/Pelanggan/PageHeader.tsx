import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    /** Right-aligned slot for counts, filters or a primary action. */
    actions?: ReactNode;
    className?: string;
}

/**
 * The single page heading used across the customer pages. Deliberately flat —
 * no gradient, no decorative chips — so each page opens on its content.
 */
export default function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}
            </div>

            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    );
}
