import { Skeleton, SkeletonRegion } from '@/Components/UI/Skeleton';

/** Mirrors MenuItemCard: square image, title, price, footer row. */
export function MenuCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <Skeleton className="aspect-square rounded-none" />
            <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-end justify-between gap-2 pt-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="size-9 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

/** The menu grid at the same column counts as the real one. */
export function MenuGridSkeleton({ count = 10 }: { count?: number }) {
    return (
        <SkeletonRegion
            label="Memuat menu"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5"
        >
            {Array.from({ length: count }).map((_, index) => (
                <MenuCardSkeleton key={index} />
            ))}
        </SkeletonRegion>
    );
}

/** Mirrors PesananCard: number + badge, 2x2 detail grid, total row. */
export function PesananCardSkeleton() {
    return (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-1.5">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    );
}

export function PesananListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <SkeletonRegion
            label="Memuat pesanan"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4"
        >
            {Array.from({ length: count }).map((_, index) => (
                <PesananCardSkeleton key={index} />
            ))}
        </SkeletonRegion>
    );
}
