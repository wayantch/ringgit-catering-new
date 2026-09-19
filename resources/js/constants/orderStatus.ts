export type OrderStatus =
    | 'baru'
    | 'menunggu_verifikasi'
    | 'diproses'
    | 'selesai'
    | 'dibatalkan';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    baru: 'Menunggu verifikasi',
    menunggu_verifikasi: 'Menunggu verifikasi',
    diproses: 'Diproses',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
    baru: 'bg-blue-50 text-blue-600',
    menunggu_verifikasi: 'bg-amber-50 text-amber-600',
    diproses: 'bg-amber-50 text-amber-600',
    selesai: 'bg-emerald-50 text-emerald-600',
    dibatalkan: 'bg-red-50 text-red-600',
};

/** Orders still moving through the flow, i.e. not finished or cancelled. */
export function isOrderActive(status: OrderStatus): boolean {
    return status !== 'selesai' && status !== 'dibatalkan';
}

export function orderStatusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusBadge(status: OrderStatus): string {
    return ORDER_STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-600';
}
