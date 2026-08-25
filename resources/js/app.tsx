import { createInertiaApp } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { tampilFlash } from '@/lib/alert';

const appName =
    import.meta.env.VITE_APP_NAME && import.meta.env.VITE_APP_NAME !== 'Laravel'
        ? import.meta.env.VITE_APP_NAME
        : 'Ringgit Catering';
const pages = import.meta.glob<ResolvedComponent>('./pages/**/*.tsx');

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
        const initialFlash = props.initialPage?.props?.flash as
            | Record<string, unknown>
            | undefined;

        // Pass shared flash to global alert handler on initial load
        if (initialFlash) {
            tampilFlash(initialFlash);

            // remove global flash if present
            try {
                delete (window as any).__inertia_flash;
            } catch {
                void 0;
            }
        }

        root.render(<App {...props} />);
    },
});
