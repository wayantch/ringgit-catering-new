import { CheckCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
    | 'baru'
    | 'menunggu_verifikasi'
    | 'diproses'
    | 'selesai'
    | 'dibatalkan';

interface TimelineStep {
    status: OrderStatus;
    label: string;
    sub: string;
}

interface OrderTimelineProps {
    status: OrderStatus;
    bookingDate?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STEPS: TimelineStep[] = [
    { status: 'baru', label: 'Dipesan', sub: 'Pesanan dibuat' },
    {
        status: 'menunggu_verifikasi',
        label: 'Verifikasi',
        sub: 'Menunggu konfirmasi admin',
    },
    { status: 'diproses', label: 'Diproses', sub: 'Sedang disiapkan' },
    { status: 'selesai', label: 'Selesai', sub: 'Pesanan selesai' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string): string {
    const d = new Date(value);

    if (isNaN(d.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderTimelineUser({
    status,
    bookingDate,
}: OrderTimelineProps) {
    const isCancelled = status === 'dibatalkan';
    const isCompleted = status === 'selesai';
    const activeIndex = isCancelled
        ? -1
        : STEPS.findIndex((s) => s.status === status);

    return (
        <section className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-tight text-text">
                    Pantau Pesanan
                </h2>
                {bookingDate && (
                    <p className="text-xs text-slate-400">
                        {formatDate(bookingDate)}
                    </p>
                )}
                {isCancelled && (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-500">
                        Dibatalkan
                    </span>
                )}
            </div>

            <div className="relative flex items-start">
                {STEPS.map((step, index) => {
                    const isDone =
                        !isCancelled &&
                        (index < activeIndex ||
                            (isCompleted && index === activeIndex));
                    const isActive = !isCancelled && index === activeIndex;
                    const isLast = index === STEPS.length - 1;

                    return (
                        <div
                            key={step.status}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {index > 0 && (
                                <div className="absolute top-4 right-1/2 left-0 h-0.5 -translate-y-1/2">
                                    <div
                                        className={`h-full w-full transition-all duration-500 ${
                                            isDone || isActive
                                                ? 'bg-primary'
                                                : 'bg-slate-200'
                                        }`}
                                    />
                                </div>
                            )}

                            {!isLast && (
                                <div className="absolute top-4 right-0 left-1/2 h-0.5 -translate-y-1/2">
                                    <div
                                        className={`h-full w-full transition-all duration-500 ${
                                            isDone
                                                ? 'bg-primary'
                                                : 'bg-slate-200'
                                        }`}
                                    />
                                </div>
                            )}

                            <div
                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 transition-all duration-300 ${
                                    isDone
                                        ? 'bg-primary text-white ring-primary/15'
                                        : isActive
                                          ? 'bg-primary text-white shadow-[0_0_0_4px_rgba(122,143,107,0.15)] ring-primary/20'
                                          : 'bg-white text-slate-300 ring-slate-200'
                                }`}
                            >
                                {isDone ? (
                                    <CheckCheck className="h-3.5 w-3.5" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                                {isActive && !isCompleted && (
                                    <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-25" />
                                )}
                            </div>

                            <div className="mt-2.5 w-full px-1 text-center">
                                <p
                                    className={`text-[11px] leading-tight font-semibold transition-colors ${
                                        isActive
                                            ? 'text-primary'
                                            : isDone
                                              ? 'text-slate-600'
                                              : 'text-slate-300'
                                    }`}
                                >
                                    {step.label}
                                </p>
                                <p
                                    className={`mt-0.5 text-[10px] leading-tight transition-colors ${
                                        isActive || isDone
                                            ? 'text-slate-400'
                                            : 'text-slate-200'
                                    }`}
                                >
                                    {step.sub}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isCancelled && (
                <div className="mt-4 rounded-[24px] border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-xs font-medium text-red-600">
                        Pesanan ini telah dibatalkan.
                    </p>
                </div>
            )}
        </section>
    );
}
