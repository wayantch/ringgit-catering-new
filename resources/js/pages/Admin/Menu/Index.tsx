import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmDialog from '@/Components/Admin/Menu/DeleteConfirmDialog';
import MenuFilterBar from '@/Components/Admin/Menu/MenuFilterBar';
import MenuTable from '@/Components/Admin/Menu/MenuTable';
import PaginationControls from '@/Components/PaginationControls';
import AdminLayout from '@/Layouts/AdminLayout';
import menu from '@/routes/admin/menu';

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    menu_type: 'timbang_hidup' | 'eceran';
    sub_type: 'saksang' | 'panggang' | 'sop_tulang' | 'paket_pass' | null;
    min_price: string | number | null;
    is_available: boolean;
    variants?: Array<{ harga: string | number | null }>;
}

interface Props {
    items: {
        data: MenuItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        is_available?: string;
    };
}

export default function Index({ items, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

    const handlePageChange = (newPage: number) => {
        router.get(
            menu.index(),
            {
                ...filters,
                page: newPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Manajemen Menu" />
            <AdminLayout>
                <div className="space-y-6 p-4">
                    {/* Header */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                                Manajemen Menu
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
                                Menu Catering
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Kelola data menu dan pantau aktivitas
                                mereka.
                            </p>
                        </div>
                        <Link
                            href={menu.create()}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-14px_rgba(122,143,107,0.55)] transition hover:bg-primary-600"
                        >
                            <Plus className="h-4 w-4" /> Tambah Menu
                        </Link>
                    </div>

                    <MenuFilterBar filters={filters} />

                    <MenuTable
                        items={items.data}
                        onDeleteClick={(selected) => {
                            setSelectedMenu(selected);
                            setDialogOpen(true);
                        }}
                    />

                    <PaginationControls
                        currentPage={items.current_page}
                        lastPage={items.last_page}
                        total={items.total}
                        itemLabel="menu"
                        onPageChange={handlePageChange}
                    />
                </div>
            </AdminLayout>

            <DeleteConfirmDialog
                open={dialogOpen}
                menuId={selectedMenu?.id ?? null}
                menuName={selectedMenu?.name ?? ''}
                onClose={() => setDialogOpen(false)}
            />
        </>
    );
}
