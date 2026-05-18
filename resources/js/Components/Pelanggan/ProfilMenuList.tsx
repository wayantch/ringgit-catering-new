import { Link, router, useForm } from '@inertiajs/react';
import {
    ChevronRight,
    CircleHelp,
    History,
    LogOut,
    SquarePen,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { alertInfo, alertSukses, alertError } from '@/lib/alert';
import { logout } from '@/routes';
import pesanan from '@/routes/user/pesanan';
import { update as profilUpdate } from '@/routes/user/profil';

interface ProfilMenuListProps {
    currentName: string;
    currentPhone: string;
}

export default function ProfilMenuList({
    currentName,
    currentPhone,
}: ProfilMenuListProps) {
    const [openEdit, setOpenEdit] = useState(false);
    const form = useForm({
        name: currentName,
        phone: currentPhone,
    });

    const saveProfile = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.patch(profilUpdate().url, {
            preserveScroll: true,
            onSuccess: () => {
                alertSukses('Profil berhasil diperbarui', 'Berhasil');
                setOpenEdit(false);
            },
            onError: () => {
                alertError('Gagal memperbarui profil', 'Error');
            },
        });
    };

    const onLogout = (): void => {
        router.post(logout());
    };

    return (
        <>
            <section className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
                <button
                    type="button"
                    onClick={() => setOpenEdit(true)}
                    className="flex w-full cursor-pointer items-center justify-between border-b border-black/5 px-4 py-4 transition hover:bg-[#fbfaf6]"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <SquarePen className="size-4" />
                        </span>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text">
                                Edit profil
                            </p>
                            <p className="text-xs text-slate-500">
                                Nama, nomor HP
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-300" />
                </button>

                <Link
                    href={pesanan.index()}
                    className="flex w-full cursor-pointer items-center justify-between border-b border-black/5 px-4 py-4 transition hover:bg-[#fbfaf6]"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <History className="size-4" />
                        </span>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text">
                                Riwayat Pesanan
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-300" />
                </Link>

                <button
                    type="button"
                    onClick={() => alertInfo('Hubungi admin untuk bantuan')}
                    className="flex w-full cursor-pointer items-center justify-between border-b border-black/5 px-4 py-4 transition hover:bg-[#fbfaf6]"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <CircleHelp className="size-4" />
                        </span>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text">
                                Bantuan
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-300" />
                </button>

                <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-4 transition hover:bg-[#fbfaf6]"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <LogOut className="size-4" />
                        </span>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text">
                                Logout
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-300" />
                </button>

                {openEdit && (
                    <div className="fixed inset-0 z-60">
                        <button
                            type="button"
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setOpenEdit(false)}
                        />
                        <form
                            onSubmit={saveProfile}
                            className="absolute right-0 bottom-0 left-0 max-w-2xl mx-auto space-y-4 rounded-t-[28px] border border-black/5 bg-[#f7f5ef] p-4 shadow-[0_-20px_60px_rgba(15,23,42,0.18)]"
                        >
                            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/10" />
                            <h3 className="text-base font-semibold text-text">
                                Edit Profil
                            </h3>
                            <label className="block text-sm">
                                <span className="mb-1 block text-slate-600">
                                    Nama <span className="text-red-500">*</span>
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 transition outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                                />
                            </label>
                            <label className="block text-sm">
                                <span className="mb-1 block text-slate-600">
                                    Nomor HP{' '}
                                    <span className="text-slate-400">
                                        (Opsional)
                                    </span>
                                </span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={form.data.phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'phone',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 transition outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                                />
                            </label>
                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(122,143,107,0.45)]"
                            >
                                Simpan
                            </button>
                        </form>
                    </div>
                )}
            </section>
        </>
    );
}
