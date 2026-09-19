import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

/**
 * Shared width and gutters for every customer page, so the desktop layout keeps
 * one measure instead of each page inventing its own.
 */
export default function PageContainer({
    children,
    className,
}: PageContainerProps) {
    return (
        <div
            className={cn(
                'mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8',
                className,
            )}
        >
            {children}
        </div>
    );
}
