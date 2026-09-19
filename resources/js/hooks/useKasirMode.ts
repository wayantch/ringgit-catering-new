import { useCallback, useEffect, useState } from 'react';

export interface UseKasirModeResult {
    /** True while the POS-style fullscreen shell is active. */
    isActive: boolean;
    /** True when the browser is actually in native fullscreen. */
    isFullscreen: boolean;
    enter: () => void;
    exit: () => void;
    toggle: () => void;
}

function requestFullscreen(): void {
    const target = document.documentElement;

    if (document.fullscreenElement || !target.requestFullscreen) {
        return;
    }

    // Native fullscreen is a nice-to-have: the shell still works without it,
    // so a rejected request (unsupported browser, blocked gesture) is ignored.
    void target.requestFullscreen().catch(() => undefined);
}

function releaseFullscreen(): void {
    if (!document.fullscreenElement || !document.exitFullscreen) {
        return;
    }

    void document.exitFullscreen().catch(() => undefined);
}

/**
 * Drives the kasir (POS) shell: native fullscreen, a locked page scroll, and
 * Escape to leave. Leaving native fullscreen by any means also leaves the
 * shell, so the two never drift apart.
 */
export function useKasirMode(): UseKasirModeResult {
    const [isActive, setIsActive] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const enter = useCallback((): void => {
        setIsActive(true);
        requestFullscreen();
    }, []);

    const exit = useCallback((): void => {
        setIsActive(false);
        releaseFullscreen();
    }, []);

    const toggle = useCallback((): void => {
        if (isActive) {
            exit();

            return;
        }

        enter();
    }, [enter, exit, isActive]);

    // Keep our state in sync when the browser drops fullscreen on its own
    // (Escape, tab switch, or a permission change).
    useEffect(() => {
        const syncFullscreen = (): void => {
            const active = document.fullscreenElement !== null;
            setIsFullscreen(active);

            if (!active) {
                setIsActive(false);
            }
        };

        document.addEventListener('fullscreenchange', syncFullscreen);

        return () =>
            document.removeEventListener('fullscreenchange', syncFullscreen);
    }, []);

    // Escape leaves the shell even when fullscreen was never granted.
    useEffect(() => {
        if (!isActive) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape' && !document.fullscreenElement) {
                exit();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [exit, isActive]);

    // Stop the page behind the shell from scrolling.
    useEffect(() => {
        if (!isActive) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isActive]);

    // Never leave the browser stuck in fullscreen after navigating away.
    useEffect(() => releaseFullscreen, []);

    return { isActive, isFullscreen, enter, exit, toggle };
}
