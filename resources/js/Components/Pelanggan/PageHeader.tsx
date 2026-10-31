import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    /** Right-aligned slot for counts, filters or a primary action. */
    actions?: ReactNode;
    /** Rendered above the title, inside the band — back links, breadcrumbs. */
    children?: ReactNode;
    className?: string;
}

/**
 * The banded heading every customer page opens with.
 *
 * It breaks out of PageContainer's gutters so it reads as its own region
 * rather than blending into the content, and uses the liquid-glass material
 * over a tinted ambient wash.
 */
export default function PageHeader({
    title,
    description,
    actions,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                // Cancel the container padding to sit edge to edge, then put it back inside.
                '-mx-4 -mt-5 overflow-hidden rounded-b-3xl sm:-mx-6 lg:-mx-8 lg:-mt-8',
                'liquid-glass-header',
                className,
            )}
        >
            <div className="px-4 pt-6 pb-7 sm:px-6 lg:px-8 lg:pt-8 lg:pb-9">
                {children && <div className="mb-3">{children}</div>}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-slate-600">
                                {description}
                            </p>
                        )}
                    </div>

                    {actions && <div className="shrink-0">{actions}</div>}
                </div>
            </div>
        </div>
    );
}
