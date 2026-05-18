import { Head } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';

export default function Pelanggan() {
    return (
        <>
            <Head title="Pelanggan - Produksi" />

            <div className="flex min-h-screen bg-surface">
                <Sidebar />
                <div className="ml-64 flex flex-1 flex-col">
                    <Topbar />
                    <main className="flex-1 overflow-auto bg-surface p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-semibold text-text">
                                Pelanggan
                            </h1>
                            <p className="mt-2 text-sm text-black/60">
                                Kelola data pelanggan
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_-15px_rgba(46,46,46,0.1)] ring-1 ring-black/5">
                            <p className="text-black/60">
                                Halaman pelanggan akan dikembangkan lebih
                                lanjut.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
