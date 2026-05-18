import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    server: {
        host: '127.0.0.1',
        strictPort: true,
        hmr: {
            host: '127.0.0.1',
            protocol: 'ws',
        },
        proxy: {
            '/user': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/admin': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/produksi': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    // server: {
    //     host: '0.0.0.0',
    //     port: 5173,

    //     hmr: {
    //         host: 'db3f-113-192-12-97.ngrok-free.app', // 🔥 WAJIB
    //         protocol: 'wss', // 🔥 karena HTTPS
    //     },

    //     proxy: {
    //         '/user': {
    //             target: 'http://127.0.0.1:8000',
    //             changeOrigin: true,
    //         },
    //         '/admin': {
    //             target: 'http://127.0.0.1:8000',
    //             changeOrigin: true,
    //         },
    //         '/produksi': {
    //             target: 'http://127.0.0.1:8000',
    //             changeOrigin: true,
    //         },
    //     },
    // },
});
