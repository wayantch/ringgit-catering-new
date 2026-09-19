import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * True while an Inertia visit that stays on the current page is in flight —
 * filters, search, pagination and polling.
 *
 * Visits that navigate somewhere else are ignored on purpose: the destination
 * renders its own loading state, and swapping the current page for a skeleton
 * on the way out just makes the transition flicker.
 */
export function useIsRefetching(): boolean {
    const [isRefetching, setIsRefetching] = useState(false);

    useEffect(() => {
        const currentPath = (): string => window.location.pathname;

        const stopStart = router.on('start', (event) => {
            const target = new URL(
                event.detail.visit.url,
                window.location.origin,
            );

            if (target.pathname === currentPath()) {
                setIsRefetching(true);
            }
        });

        const stopFinish = router.on('finish', () => {
            setIsRefetching(false);
        });

        return () => {
            stopStart();
            stopFinish();
        };
    }, []);

    return isRefetching;
}
