import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MenuForm from '@/Components/Admin/Menu/MenuForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { alertSukses, alertError } from '@/lib/alert';
import menu from '@/routes/admin/menu';

type MenuFormItem = NonNullable<Parameters<typeof MenuForm>[0]['item']>;

interface MenuItem extends MenuFormItem {
    id: string;
    hashid: string;
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
                <div className="space-y-6 p-4 ">
                    <section className="overflow-hidden rounded-4xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_24px_30px_-42px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                        <div className="max-w-3xl space-y-3">
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
                                Perbarui Menu
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                                Edit Menu
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Perbaiki gambar, harga, atau tipe menu dengan
                                tampilan form yang tetap bersih dan fokus.
                            </p>
                        </div>
                    </section>

                    <MenuForm
                        mode="edit"
                        item={item}
                        processing={processing}
                        errors={errors}
                        onCancel={() => router.visit(menu.index())}
                        onSubmit={(data) => {
                            data.append('_method', 'PUT');
                            router.post(
                                menu.update.url({ menu: item.hashid } as never),
                                data,
                                {
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
                                },
                            );
                        }}
                    />
                </div>
            </AdminLayout>
        </>
    );
}
