import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { konfirmasiHapus, alertSukses, alertError } from '@/lib/alert';
import menu from '@/routes/admin/menu';

interface DeleteConfirmDialogProps {
    open: boolean;
    menuId: string | null;
    menuName: string;
    onClose: () => void;
}

export default function DeleteConfirmDialog({
    open,
    menuId,
    menuName,
    onClose,
}: DeleteConfirmDialogProps) {
    useEffect(() => {
        if (!open || menuId === null) {
            return;
        }

        let mounted = true;

        (async () => {
            try {
                const result = await konfirmasiHapus(
                    menuName,
                    'Menu ini akan dihapus dan tidak tampil di pelanggan.',
                );

                if (!mounted) {
                    return;
                }

                if (result.isConfirmed) {
                    router.delete(menu.destroy(menuId), {
                        preserveScroll: true,
                        onSuccess: () => {
                            alertSukses('Menu berhasil dihapus.');
                            onClose();
                        },
                        onError: () => {
                            alertError('Gagal menghapus menu. Coba lagi.');
                            onClose();
                        },
                    });
                } else {
                    onClose();
                }
            } catch {
                onClose();
            }
        })();

        return () => {
            mounted = false;
        };
    }, [open]);

    return null;
}
