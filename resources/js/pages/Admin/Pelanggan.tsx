import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Pelanggan() {
    return (
        <>
            <Head title="Pelanggan - Admin" />

            <AdminLayout>
                <div className="px-6 py-6">
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
                            Halaman pelanggan akan dikembangkan lebih lanjut.
                        </p>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
