import { useEffect } from 'react';
import { konfirmasi, alertSukses, alertError } from '@/lib/alert';

interface KonfirmasiModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    isDanger?: boolean;
}

export default function KonfirmasiModal({
    isOpen,
    title,
    description,
    onConfirm,
    onCancel,
    confirmLabel = 'Konfirmasi',
    isDanger = false,
}: KonfirmasiModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let mounted = true;

        (async () => {
            try {
                const result = await konfirmasi(title, description, {
                    konfirmasiLabel: confirmLabel,
                    batalLabel: 'Batal',
                    icon: isDanger ? 'warning' : 'question',
                    isDanger: isDanger,
                });

                if (!mounted) {
                    return;
                }

                if (result.isConfirmed) {
                    try {
                        await onConfirm();
                        alertSukses('Tindakan berhasil.');
                    } catch {
                        alertError('Tindakan gagal. Coba lagi.');
                    }
                } else {
                    onCancel();
                }
            } catch {
                onCancel();
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isOpen]);

    return null;
}
