import {
    createInertiaApp,
    router
    
} from '@inertiajs/react';
import type {ResolvedComponent} from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { tampilFlash } from '@/lib/alert';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = import.meta.glob<ResolvedComponent>('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
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

        // Pass shared flash to global alert handler on initial load
        if (
            props.initialPage &&
            props.initialPage.props &&
            props.initialPage.props.flash
        ) {
            // @ts-ignore
            tampilFlash(props.initialPage.props.flash || {});

            // remove global flash if present
            try {
                delete (window as any).__inertia_flash;
            } catch {}
        }

        root.render(<App {...props} />);
    },
});
