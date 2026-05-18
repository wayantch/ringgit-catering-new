import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import pesanan from '@/routes/user/pesanan';

interface UploadBuktiSheetProps {
    isOpen: boolean;
    orderId: string | number;
    paymentType: 'dp' | 'pelunasan';
    onClose: () => void;
    existingProofImage?: string | null;
    isCancelled?: boolean;
}

export default function UploadBuktiSheet({
    isOpen,
    orderId,
    paymentType,
    onClose,
    existingProofImage,
    isCancelled = false,
}: UploadBuktiSheetProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const form = useForm<{
        payment_type: 'dp' | 'pelunasan';
        proof_image: File | null;
    }>({
        payment_type: paymentType,
        proof_image: null,
    });

    const closeSheet = (): void => {
        setPreviewUrl(null);
        form.reset('proof_image');
        onClose();
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.post(pesanan.uploadBukti({ order: orderId }).url, {
            forceFormData: true,
            onSuccess: () => {
                closeSheet();
            },
        });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-60">
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={closeSheet}
            />
            <form
                onSubmit={submit}
                className="absolute right-0 bottom-0 left-0 mx-auto max-w-2xl space-y-4 rounded-t-[28px] border border-black/5 bg-[#f7f5ef] p-4 shadow-[0_-20px_60px_rgba(15,23,42,0.18)]"
            >
                <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/10" />

                <h3 className="text-base font-semibold text-text">
                    {existingProofImage ? 'Edit' : 'Upload'} Bukti Pembayaran
                </h3>

                {(previewUrl || existingProofImage) && (
                    <div className="space-y-2 rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase">
                            Preview:
                        </p>
                        <img
                            src={
                                (previewUrl ||
                                    (existingProofImage
                                        ? `/storage/${existingProofImage}`
                                        : '')) ??
                                ''
                            }
                            alt="Preview bukti pembayaran"
                            className="h-32 w-full rounded-2xl object-contain"
                        />
                    </div>
                )}

                <div className="space-y-2 rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
                    <label className="block text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                        {existingProofImage
                            ? 'Ganti bukti'
                            : 'Pilih bukti pembayaran'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        disabled={isCancelled}
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            form.setData('proof_image', file ?? null);

                            if (file) {
                                const reader = new FileReader();

                                reader.onload = (e) => {
                                    setPreviewUrl(e.target?.result as string);
                                };

                                reader.readAsDataURL(file);
                            }
                        }}
                        className="block w-full rounded-2xl border border-black/5 bg-[#fbfaf6] p-3 text-sm transition outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                    />
                </div>
                {form.errors.proof_image && (
                    <p className="text-xs text-red-500">
                        {form.errors.proof_image}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        form.processing || isCancelled || !form.data.proof_image
                    }
                    className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(122,143,107,0.45)] hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {form.processing
                        ? 'Uploading...'
                        : isCancelled
                          ? 'Pesanan Dibatalkan'
                          : existingProofImage
                            ? 'Ganti Bukti'
                            : 'Kirim Bukti'}
                </button>
            </form>
        </div>
    );
}
