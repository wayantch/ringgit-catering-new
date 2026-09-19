import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    /** For placeholders whose size is data-shaped, e.g. chart bar heights. */
    style?: CSSProperties;
}

/**
 * One pulsing placeholder block. Compose these into shapes that mirror the
 * real layout so the page does not jump when the data lands.
 */
export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <span
            aria-hidden="true"
            style={style}
            className={cn(
                'block animate-pulse rounded-md bg-slate-200/80',
                className,
            )}
        />
    );
}

interface SkeletonTextProps {
    /** How many lines to draw. */
    lines?: number;
    className?: string;
}

/** A paragraph-shaped placeholder; the last line is short, like real text. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
    return (
        <span className={cn('block space-y-2', className)}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    className={cn(
                        'h-3.5',
                        index === lines - 1 ? 'w-2/3' : 'w-full',
                    )}
                />
            ))}
        </span>
    );
}

/**
 * Wraps a loading region so assistive tech announces it instead of reading a
 * pile of empty boxes.
 */
export function SkeletonRegion({
    label = 'Memuat data',
    className,
    children,
}: {
    label?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div role="status" aria-live="polite" aria-busy="true" className={className}>
            <span className="sr-only">{label}</span>
            {children}
        </div>
    );
}
