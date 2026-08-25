import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MenuForm from '@/Components/Admin/Menu/MenuForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertError } from '@/lib/alert';
import menu from '@/routes/admin/menu';

interface SharedProps {
    errors: Record<string, string>;
    [key: string]: unknown;
}

export default function Create() {
    const { props } = usePage();
    const [processing, setProcessing] = useState(false);
    const errors = (props as SharedProps).errors ?? {};

    return (
        <>
            <Head title="Tambah Menu" />
            <AdminLayout>
                <div className="space-y-6 p-4 lg:p-6">
                    <section className="overflow-hidden rounded-4xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                        <div className="max-w-3xl space-y-3">
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
                                Menu Baru
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                                Tambah Menu
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Isi detail menu, harga, dan gambar dengan alur
                                yang tetap sederhana tetapi tampil lebih rapi.
                            </p>
                        </div>
                    </section>

                    <MenuForm
                        mode="create"
                        processing={processing}
                        errors={errors}
                        onCancel={() => router.visit(menu.index())}
                        onSubmit={(data) => {
                            router.post(menu.store(), data, {
                                forceFormData: true,
                                onStart: () => setProcessing(true),
                                onError: () => {
                                    alertError(
                                        'Gagal menambahkan menu',
                                        'Error',
                                    );
                                },
                                onFinish: () => setProcessing(false),
                            });
                        }}
                    />
                </div>
            </AdminLayout>
        </>
    );
}
