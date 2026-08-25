import { useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { konfirmasiStatus, alertError } from '@/lib/alert';

interface Payment {
    id: number;
    type: 'dp' | 'pelunasan';
    payment_type?: 'dp' | 'pelunasan';
    expected_amount: string;
    unique_code: number;
    payment_proof?: string;
    status: 'pending' | 'verified' | 'rejected';
    verified_at?: string;
    rejection_notes?: string;
    is_verification?: boolean;
}

interface PaymentVerifyCardProps {
    payment: Payment;
    orderId: number;
}

export default function PaymentVerifyCard({
    payment,
    orderId,
}: PaymentVerifyCardProps) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const rejectForm = useForm({ rejection_notes: '' });
    const resolvedPaymentType: 'dp' | 'pelunasan' =
        payment.type === 'pelunasan' || payment.payment_type === 'pelunasan'
            ? 'pelunasan'
            : 'dp';

    const handleVerify = () => {
        (async () => {
            const result = await konfirmasiStatus(
                'Verifikasi Pembayaran',
                payment.unique_code
                    ? String(payment.unique_code)
                    : String(orderId),
                false,
            );

            if (result.isConfirmed) {
                const url = payment.is_verification
                    ? `/admin/pesanan/${orderId}/verify-payment-verification/${payment.id}`
                    : `/admin/pesanan/${orderId}/verify-payment/${payment.id}`;

                router.post(
                    url,
                    {},
                    {
                        onError: () =>
                            alertError('Gagal memverifikasi. Coba lagi.'),
                    },
                );
            }
        })();
    };

    const handleReject = () => {
        const url = payment.is_verification
            ? `/admin/pesanan/${orderId}/reject-payment-verification/${payment.id}`
            : `/admin/pesanan/${orderId}/reject-payment/${payment.id}`;
        rejectForm.post(url, {
            onSuccess: () => {
                setShowRejectForm(false);
                rejectForm.reset();
            },
            onError: (errors) => {
                console.error('Reject error:', errors);
                alertError('Gagal mengirim penolakan. Coba lagi.');
            },
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };

    const typeLabel =
        resolvedPaymentType === 'dp' ? 'DP (Uang Muka)' : 'Pelunasan';

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-primary">{typeLabel}</h3>
                    <p className="text-sm text-primary/60">
                        Kode: {payment.unique_code}
                    </p>
                </div>
                <div className="text-right">
                    <div
                        className="text-2xl font-bold text-primary"
                        suppressHydrationWarning
                    >
                        {formatCurrency(payment.expected_amount)}
                    </div>
                    <div className="mt-1 text-xs text-primary/50">
                        {payment.status === 'pending' && 'Menunggu verifikasi'}
                        {payment.status === 'verified' &&
                            `Terverifikasi ${payment.verified_at}`}
                        {payment.status === 'rejected' && 'Ditolak'}
                    </div>
                </div>
            </div>

            {/* Proof Image */}
            {payment.payment_proof && (
                <div className="mb-3">
                    <img
                        src={`/storage/${payment.payment_proof}`}
                        alt="Bukti pembayaran"
                        className="max-h-48 w-full rounded-xl object-cover"
                    />
                </div>
            )}

            {/* Rejection Notes */}
            {payment.rejection_notes && (
                <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3">
                    <p className="text-sm text-red-600">
                        Alasan Penolakan: {payment.rejection_notes}
                    </p>
                </div>
            )}

            {/* Actions */}
            {payment.status === 'pending' && (
                <div className="flex gap-2">
                    <button
                        onClick={handleVerify}
                        className="flex-1 rounded-xl bg-emerald-50 px-4 py-2 font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                    >
                        Verifikasi
                    </button>
                    <button
                        onClick={() => setShowRejectForm(!showRejectForm)}
                        className="flex-1 rounded-xl bg-red-50 px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-100"
                    >
                        Tolak
                    </button>
                </div>
            )}

            {/* Reject Form */}
            {showRejectForm && payment.status === 'pending' && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleReject();
                    }}
                    className="mt-3 space-y-2"
                >
                    <textarea
                        value={rejectForm.data.rejection_notes}
                        onChange={(e) =>
                            rejectForm.setData(
                                'rejection_notes',
                                e.target.value,
                            )
                        }
                        placeholder="Alasan penolakan..."
                        className="w-full resize-none rounded-xl border border-primary/10 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        rows={3}
                        required
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={rejectForm.processing}
                            className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                            {rejectForm.processing
                                ? 'Memproses...'
                                : 'Kirim Penolakan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowRejectForm(false)}
                            className="flex-1 rounded-xl border border-primary/10 px-4 py-2 font-medium text-primary transition-colors hover:bg-primary/5"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            )}

            {/* Status Badge */}
            {payment.status !== 'pending' && (
                <div className="mt-3">
                    <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                            payment.status === 'verified'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-600'
                        }`}
                    >
                        {payment.status === 'verified'
                            ? 'Terverifikasi'
                            : 'Ditolak'}
                    </div>
                </div>
            )}
        </div>
    );
}
