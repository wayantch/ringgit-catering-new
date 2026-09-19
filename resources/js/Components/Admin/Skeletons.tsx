import { Skeleton, SkeletonRegion } from '@/Components/UI/Skeleton';

/** Mirrors StatCard: icon, label, big value, sub line, sparkline. */
function StatCardSkeleton() {
    return (
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-3">
                <Skeleton className="size-10 rounded-2xl" />
                <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-3 w-24" />
            <Skeleton className="mt-2 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-4 h-8 w-full" />
        </div>
    );
}

/** The four stat cards plus the chart row underneath them. */
export function DashboardSummarySkeleton() {
    return (
        <SkeletonRegion label="Memuat ringkasan" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                    <StatCardSkeleton />
                </div>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 ring-1 ring-black/5 lg:col-span-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-3 w-28" />
                    <div className="mt-6 flex items-end gap-3">
                        {[38, 62, 45, 80, 55, 70, 48].map((height, index) => (
                            <Skeleton
                                key={index}
                                className="flex-1 rounded-t-lg"
                                // Varied heights read as a chart rather than a block.
                                style={{ height: `${height}%` }}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 ring-1 ring-black/5">
                    <Skeleton className="h-4 w-32" />
                    <div className="mt-6 flex justify-center">
                        <Skeleton className="size-36 rounded-full" />
                    </div>
                    <div className="mt-6 space-y-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-3 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </SkeletonRegion>
    );
}

/** The two list panels: recent orders and top menus. */
export function DashboardListsSkeleton() {
    return (
        <SkeletonRegion
            label="Memuat daftar"
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 ring-1 ring-black/5 lg:col-span-2">
                <Skeleton className="h-4 w-32" />
                <div className="mt-5 space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3.5 w-1/3" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 ring-1 ring-black/5">
                <Skeleton className="h-4 w-28" />
                <div className="mt-5 space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="space-y-1.5">
                            <Skeleton className="h-3.5 w-3/4" />
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </SkeletonRegion>
    );
}

/** Generic table placeholder for the admin list pages. */
export function TableSkeleton({
    rows = 8,
    columns = 5,
}: {
    rows?: number;
    columns?: number;
}) {
    return (
        <SkeletonRegion
            label="Memuat tabel"
            className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 ring-1 ring-black/5"
        >
            <div className="border-b border-slate-100 px-5 py-3.5">
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: columns }).map((_, index) => (
                        <Skeleton key={index} className="h-3 w-20" />
                    ))}
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="px-5 py-4">
                        <div
                            className="grid items-center gap-4"
                            style={{
                                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                        >
                            {Array.from({ length: columns }).map(
                                (_, columnIndex) => (
                                    <Skeleton
                                        key={columnIndex}
                                        className={
                                            columnIndex === 0
                                                ? 'h-4 w-full'
                                                : 'h-4 w-3/4'
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </SkeletonRegion>
    );
}
