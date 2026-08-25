import { createInertiaApp, router } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { tampilFlash } from '@/lib/alert';

const appName =
    import.meta.env.VITE_APP_NAME && import.meta.env.VITE_APP_NAME !== 'Laravel'
        ? import.meta.env.VITE_APP_NAME
        : 'Ringgit Catering';
const pages = import.meta.glob<ResolvedComponent>('./pages/**/*.tsx');

type FlashBag = Parameters<typeof tampilFlash>[0];

function showFlash(flash: unknown): void {
    if (!flash || typeof flash !== 'object') {
        return;
    }

    tampilFlash(flash as FlashBag);
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Ignore registration failures so the app still loads normally.
        });
    });
}

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    resolve: (name) => {
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page component not found: ${name}`);
        }

        return page();
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Flash is shared through props by HandleInertiaRequests. Inertia only
        // fires its own "flash" event for Inertia::flash(), so the initial load
        // is handled here and every later visit through the "success" event —
        // which does not fire on the initial load, so nothing shows twice.
        showFlash(props.initialPage?.props?.flash);

        router.on('success', (event) => {
            showFlash(event.detail.page.props.flash);
        });

        root.render(<App {...props} />);
    },
});
