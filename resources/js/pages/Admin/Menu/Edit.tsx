import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MenuForm from '@/Components/Admin/Menu/MenuForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertSukses, alertError } from '@/lib/alert';
import menu from '@/routes/admin/menu';

interface MenuItem {
    id: string;
    hashid: string;
    name: string;
    description: string | null;
    image: string | null;
    menu_type: 'timbang_hidup' | 'eceran';
    sub_type: 'saksang' | 'panggang' | 'sop_tulang' | 'paket_pass' | null;
    is_bundle: boolean;
    bundle_desc: string | null;
    free_ongkir_km: number | null;
    ongkir_subsidi: Array<{
        min_kg: string | number | null;
        max_kg: string | number | null;
        max_subsidi: string | number | null;
    }> | null;
    is_available: boolean;
    sort_order: number;
    tiers?: Array<{
        kode: 'A' | 'B' | 'C';
        is_half: boolean;
        berat_min: string | number | null;
        berat_max: string | number | null;
        harga_mentah: string | number | null;
        harga_matang: string | number | null;
        cashback: string | number | null;
    }>;
    variants?: Array<{
        label: string;
        harga: string | number | null;
    }>;
}

interface SharedProps {
    errors: Record<string, string>;
    [key: string]: unknown;
}

interface Props {
    menu: MenuItem;
}

export default function Edit({ menu: item }: Props) {
    const { props } = usePage();
    const [processing, setProcessing] = useState(false);
    const errors = (props as SharedProps).errors ?? {};

    return (
        <>
            <Head title={`Edit Menu: ${item.name}`} />
            <AdminLayout>
                <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
                    <MenuForm
                        mode="edit"
                        item={item}
                        processing={processing}
                        errors={errors}
                        onCancel={() => router.visit(menu.index())}
                        onSubmit={(data) => {
                            data.append('_method', 'PUT');
                            router.post(menu.update(item.hashid), data, {
                                forceFormData: true,
                                onStart: () => setProcessing(true),
                                onSuccess: () => {
                                    alertSukses(
                                        'Menu berhasil diperbarui',
                                        'Berhasil',
                                    );
                                },
                                onError: () => {
                                    alertError(
                                        'Gagal memperbarui menu',
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
