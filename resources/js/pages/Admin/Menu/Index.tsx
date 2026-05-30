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
    sub_type:
        | 'saksang'
        | 'panggang'
        | 'sop_tulang'
        | 'paket_pass'
        | 'paket_nasi_box'
        | 'babi_adat'
        | null;
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
                <div className="space-y-6 p-4 ">
                    <section className="relative overflow-hidden rounded-4xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_24px_30px_-42px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,143,107,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(165,180,252,0.12),transparent_28%)]" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl space-y-3">
                                <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
                                    Manajemen Menu
                                </p>
                                <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
                                    Menu Catering
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                    Kelola katalog menu dengan tampilan yang
                                    lebih clean, modern, dan mudah dipindai.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium text-slate-500">
                                    <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                                        {items.total} total menu
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                                        {
                                            items.data.filter(
                                                (item) => item.is_available,
                                            ).length
                                        }{' '}
                                        aktif
                                    </span>
                                </div>
                            </div>

                            <Link
                                href={menu.create()}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-18px_rgba(122,143,107,0.9)] transition hover:-translate-y-0.5 hover:bg-primary-600"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Menu
                            </Link>
                        </div>
                    </section>

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
