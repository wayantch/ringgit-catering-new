import { CheckCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimelineStatus = 'baru' | 'diproses' | 'selesai' | 'dibatalkan';

interface TimelineStep {
    status: Exclude<TimelineStatus, 'dibatalkan'>;
    label: string;
    sub?: string;
}

interface OrderTimelineProps {
    status: TimelineStatus;
    source: 'pembeli' | 'admin';
    bookingDate: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEPS: Record<OrderTimelineProps['source'], TimelineStep[]> = {
    pembeli: [
        { status: 'baru', label: 'Dipesan', sub: 'Menunggu verifikasi' },
        { status: 'diproses', label: 'Diproses', sub: 'Sedang disiapkan' },
        { status: 'selesai', label: 'Selesai', sub: 'Pesanan selesai' },
    ],
    admin: [
        { status: 'baru', label: 'Dipesan', sub: 'Input kasir' },
        { status: 'diproses', label: 'Diproses', sub: 'Sedang disiapkan' },
        { status: 'selesai', label: 'Selesai', sub: 'Pesanan selesai' },
    ],
};

function formatDate(value: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderTimeline({
    status,
    source,
    bookingDate,
}: OrderTimelineProps) {
    const steps = STEPS[source] ?? STEPS.pembeli;
    const isCancelled = status === 'dibatalkan';
    const isCompleted = status === 'selesai';

    // Index step yang sedang aktif (-1 jika dibatalkan)
    const activeIndex = isCancelled
        ? -1
        : steps.findIndex((s) => s.status === status);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-text">
                        Timeline Pesanan
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Jadwal: {formatDate(bookingDate)}
                    </p>
                </div>

                {isCancelled && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
                        Dibatalkan
                    </span>
                )}
            </div>

            {/* Timeline */}
            <div className="relative flex items-start">
                {steps.map((step, index) => {
                    const isDone =
                        !isCancelled &&
                        (index < activeIndex ||
                            (isCompleted && index === activeIndex));
                    const isActive = !isCancelled && index === activeIndex;
                    const isPending = isCancelled || index > activeIndex;
                    const isLast = index === steps.length - 1;

                    return (
                        <div
                            key={step.status}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {/* Connector line — kiri */}
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

                            {/* Connector line — kanan */}
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

                            {/* Circle */}
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

                                {/* Pulse saat aktif */}
                                {isActive && !isCompleted && (
                                    <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-30" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-2.5 text-center">
                                <p
                                    className={`text-xs leading-tight font-semibold transition-colors ${
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

            {/* Cancelled banner */}
            {isCancelled && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-xs font-medium text-red-600">
                        Pesanan ini telah dibatalkan dan tidak dapat diproses
                        kembali.
                    </p>
                </div>
            )}
        </div>
    );
}
