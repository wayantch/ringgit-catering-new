import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Loyalti() {
    return (
        <AdminLayout>
            <Head title="Program Loyalti" />
            <div className="p-4">
                <h1 className="text-2xl font-bold">Program Loyalti</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Halaman loyalti sementara diperbaiki. Konten akan
                    dikembalikan segera.
                </p>
            </div>
        </AdminLayout>
    );
}
