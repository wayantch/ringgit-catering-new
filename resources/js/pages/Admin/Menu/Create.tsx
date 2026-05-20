import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MenuForm from '@/Components/Admin/Menu/MenuForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertSukses, alertError } from '@/lib/alert';
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
                <div className="space-y-6 p-4">
                    <MenuForm
                        mode="create"
                        processing={processing}
                        errors={errors}
                        onCancel={() => router.visit(menu.index())}
                        onSubmit={(data) => {
                            router.post(menu.store(), data, {
                                forceFormData: true,
                                onStart: () => setProcessing(true),
                                onSuccess: () => {
                                    alertSukses(
                                        'Menu berhasil ditambahkan',
                                        'Berhasil',
                                    );
                                },
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
