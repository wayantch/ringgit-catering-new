import { Head, usePage, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    CalendarDays,
    Sparkles,
    TrendingUp,
    ShoppingBag,
    Users,
    UtensilsCrossed,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    Loader2,
    XCircle,
    Printer,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import admin from '@/routes/admin';

// ─── Helpers & Types ───────────────────────────────────────────────────────────

type WeeklyRevenue = {
    label: string;
    value: number;
};

type OrderStatusSegment = {
    label: string;
    value: number;
    color: string;
};

type RecentOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string | null;
    menu_summary: string;
    total_amount: number | null;
    is_price_pending: boolean;
    status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
};

type TopMenu = {
    name: string;
    orders: number;
    pct: number;
};

type Stats = {
    revenue_today: number;
    revenue_yesterday: number;
    orders_today: number;
    orders_yesterday: number;
    orders_today_new: number;
    total_customers: number;
    customers_this_week: number;
    active_menus: number;
    low_stock_menus: number;
};

type Props = {
    [key: string]: unknown;
    stats: Stats;
    weekly_revenue: WeeklyRevenue[];
    order_status_distribution: OrderStatusSegment[];
    completion_rate: number;
    recent_orders: RecentOrder[];
    top_menus: TopMenu[];
};

const fmt = (n: number | null): string => {
    if (n === null) {
        return 'Harga menyusul';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n);
};

function calcChange(
    current: number,
    previous: number,
): { pct: string; type: 'up' | 'down' } {
    if (previous === 0) {
        return { pct: '0%', type: 'up' };
    }

    const diff = ((current - previous) / previous) * 100;

    return {
        pct: `${Math.abs(Math.round(diff))}%`,
        type: diff >= 0 ? 'up' : 'down',
    };
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({
    data,
    color = '#7a8f6b',
    fill = false,
}: {
    data: number[];
    color?: string;
    fill?: boolean;
}) {
    const w = 120,
        h = 40,
        pad = 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);

        return `${x},${y}`;
    });
    const polyline = pts.join(' ');
    const areaPath = `M${pts[0]} ${pts.join(' L')} L${w - pad},${h - pad} L${pad},${h - pad} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full">
            {fill && (
                <path
                    d={areaPath}
                    fill={color}
                    fillOpacity={0.12}
                    stroke="none"
                />
            )}
            <polyline
                points={polyline}
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ─── Bar Chart (Revenue 7 hari) ───────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; value: number }[] }) {
    const max = Math.max(...data.map((d) => d.value));

    return (
        <div className="flex h-36 items-end gap-1.5">
            {data.map((d, i) => {
                const pct = (d.value / max) * 100;
                const isToday = i === data.length - 1;

                return (
                    <div
                        key={i}
                        className="group flex flex-1 flex-col items-center gap-1"
                    >
                        <div
                            className="relative flex w-full items-end justify-center"
                            style={{ height: '120px' }}
                        >
                            {/* Tooltip */}
                            <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-text px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {fmt(d.value)}
                            </div>
                            <div
                                className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-90"
                                style={{
                                    height: `${pct}%`,
                                    background: isToday
                                        ? 'var(--color-primary)'
                                        : 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
                                }}
                            />
                        </div>
                        <span
                            className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-slate-400'}`}
                        >
                            {d.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Donut Chart (Status Pesanan) ─────────────────────────────────────────────

function DonutChart({ segments }: { segments: OrderStatusSegment[] }) {
    const total = segments.reduce((s, d) => s + d.value, 0);
    const r = 40;
    const cx = 60;
    const cy = 60;

    const arc = (startDeg: number, endDeg: number): string => {
        const toRad = (d: number): number => (d * Math.PI) / 180;
        const x1 = cx + r * Math.cos(toRad(startDeg));
        const y1 = cy + r * Math.sin(toRad(startDeg));
        const x2 = cx + r * Math.cos(toRad(endDeg));
        const y2 = cy + r * Math.sin(toRad(endDeg));
        const large = endDeg - startDeg > 180 ? 1 : 0;

        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    };

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0">
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    className="stroke-slate-100"
                    strokeWidth="2"
                />
                {segments.map((seg, i) => {
                    const startAngle =
                        -90 +
                        segments
                            .slice(0, i)
                            .reduce(
                                (sum, item) => sum + (item.value / total) * 360,
                                0,
                            );
                    const sweep = (seg.value / total) * 360;
                    const path = arc(startAngle, startAngle + sweep - 1);

                    return (
                        <path
                            key={i}
                            d={path}
                            fill={seg.color}
                            fillOpacity={0.85}
                            className="hover:fillOpacity-100 transition-opacity"
                        />
                    );
                })}
                <circle cx={cx} cy={cy} r={28} fill="white" />
                <text
                    x={cx}
                    y={cy - 4}
                    textAnchor="middle"
                    className="text-lg font-bold"
                    fontSize="14"
                    fontWeight="700"
                    fill="#2e2e2e"
                >
                    {total}
                </text>
                <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#94a3b8"
                >
                    pesanan
                </text>
            </svg>
            <div className="space-y-2">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: seg.color }}
                        />
                        <span className="text-xs text-slate-500">
                            {seg.label}
                        </span>
                        <span className="ml-auto text-xs font-semibold text-text">
                            {seg.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    icon: Icon,
    label,
    value,
    change,
    changeType = 'up',
    sub,
    spark,
    accent = false,
}: {
    icon: any;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down';
    sub?: string;
    spark?: number[];
    accent?: boolean;
}) {
    const isUp = changeType === 'up';

    return (
        <div
            className={`group relative cursor-default overflow-hidden rounded-[28px] p-5 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.4)] ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_-28px_rgba(15,23,42,0.45)] ${
                accent
                    ? 'bg-linear-to-br from-primary via-primary to-primary/85 text-white ring-primary/20'
                    : 'bg-white/92 ring-black/5 backdrop-blur'
            }`}
        >
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent ? 'bg-white/15' : 'bg-secondary'}`}
                >
                    <Icon
                        className={`h-4.5 w-4.5 ${accent ? 'text-white' : 'text-primary'}`}
                    />
                </div>
                {change !== undefined && (
                    <span
                        className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            accent
                                ? 'bg-white/20 text-white'
                                : isUp
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-red-50 text-red-500'
                        }`}
                    >
                        {isUp ? (
                            <ArrowUpRight className="h-3 w-3" />
                        ) : (
                            <ArrowDownRight className="h-3 w-3" />
                        )}
                        {change}
                    </span>
                )}
            </div>

            <div className="mt-3">
                <p
                    className={`text-xs font-medium ${accent ? 'text-white/70' : 'text-slate-400'}`}
                >
                    {label}
                </p>
                <p
                    className={`mt-0.5 text-2xl font-bold tracking-tight ${accent ? 'text-white' : 'text-text'}`}
                >
                    {value}
                </p>
            </div>

            <div className="mt-4 flex items-end gap-4">
                {sub ? (
                    <p
                        className={`min-w-0 flex-1 text-xs leading-relaxed ${accent ? 'text-white/75' : 'text-slate-500'}`}
                    >
                        {sub}
                    </p>
                ) : (
                    <div className="flex-1" />
                )}

                {spark && spark.length > 1 ? (
                    <div className="w-24 shrink-0 opacity-90">
                        <Sparkline
                            data={spark}
                            color={accent ? '#ffffff' : '#7a8f6b'}
                            fill
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; icon: any; cls: string }> = {
        baru: { label: 'Baru', icon: Clock, cls: 'bg-blue-50 text-blue-600' },
        diproses: {
            label: 'Diproses',
            icon: Loader2,
            cls: 'bg-amber-50 text-amber-600',
        },
        selesai: {
            label: 'Selesai',
            icon: CheckCircle2,
            cls: 'bg-emerald-50 text-emerald-600',
        },
        dibatalkan: {
            label: 'Batal',
            icon: XCircle,
            cls: 'bg-red-50 text-red-500',
        },
    };
    const cfg = map[status] || map.baru;
    const Icon = cfg.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.cls}`}
        >
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

// No local dummy data — values come from props passed by Inertia

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const page = usePage<Props>();
    const pageProps = page.props;

    const stats = pageProps.stats;
    const weekly_revenue = pageProps.weekly_revenue ?? [];
    const order_status_distribution = pageProps.order_status_distribution ?? [];
    const completion_rate = pageProps.completion_rate ?? 0;
    const recent_orders = pageProps.recent_orders ?? [];
    const top_menus = pageProps.top_menus ?? [];

    // Safe defaults to avoid runtime errors when props are not yet available
    const s: Stats = stats ?? {
        revenue_today: 0,
        revenue_yesterday: 0,
        orders_today: 0,
        orders_yesterday: 0,
        orders_today_new: 0,
        total_customers: 0,
        customers_this_week: 0,
        active_menus: 0,
        low_stock_menus: 0,
    };

    const weekly =
        weekly_revenue.length === 7
            ? weekly_revenue
            : Array.from({ length: 7 }).map(() => ({ label: '', value: 0 }));

    const segments = order_status_distribution.length
        ? order_status_distribution
        : [
              { label: 'Baru', value: 0, color: '#60a5fa' },
              { label: 'Diproses', value: 0, color: '#f59e0b' },
              { label: 'Selesai', value: 0, color: '#7a8f6b' },
              { label: 'Dibatalkan', value: 0, color: '#f87171' },
          ];

    const recentSafe = recent_orders;
    const topMenusSafe = top_menus;

    const revenueChange = calcChange(s.revenue_today, s.revenue_yesterday);
    const ordersChange = calcChange(s.orders_today, s.orders_yesterday);

    return (
        <>
            <Head title="Admin Dashboard" />

            <AdminLayout>
                <div className="relative space-y-6 p-4">
                    {/* Header */}
                    <div className="relative overflow-hidden rounded-4xl border border-white/70 bg-linear-to-br from-white via-[#fbfcf8] to-primary/10 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,143,107,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(165,180,252,0.12),transparent_28%)]" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Ringkasan Harian
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-5xl">
                                        Dashboard admin.
                                    </h1>
                                    <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                        Lihat performa penjualan hari ini,
                                        status pesanan, dan menu yang paling
                                        sering dipesan
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={admin.pesanan.index.url()}
                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(122,143,107,0.85)] transition hover:-translate-y-0.5 hover:bg-primary-600"
                                    >
                                        Lihat Pesanan
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={admin.menu.index.url()}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                                    >
                                        Kelola Menu
                                    </Link>
                                    <Link
                                        href={admin.print.index.url()}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Cetak
                                    </Link>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:w-130">
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Pendapatan
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                        {fmt(s.revenue_today)}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                        {revenueChange.pct} dari kemarin
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Pesanan
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                        {s.orders_today}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                                        {s.orders_today_new} pesanan baru
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                        Status
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                                        {completion_rate}%
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                                        Tingkat penyelesaian
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Bento Grid ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* 1. Total Pendapatan Hari Ini — accent card */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <StatCard
                                icon={TrendingUp}
                                label="Pendapatan Hari Ini"
                                value={fmt(s.revenue_today)}
                                change={revenueChange.pct}
                                changeType={revenueChange.type}
                                sub={`vs kemarin ${fmt(s.revenue_yesterday)}`}
                                spark={weekly.map((d) => d.value)}
                                accent
                            />
                        </div>

                        {/* 2. Pesanan Hari Ini */}
                        <StatCard
                            icon={ShoppingBag}
                            label="Pesanan Hari Ini"
                            value={String(s.orders_today)}
                            change={ordersChange.pct}
                            changeType={ordersChange.type}
                            sub={`${s.orders_today_new} pesanan baru`}
                            spark={weekly.map((d) => d.value)}
                        />

                        {/* 3. Total Pelanggan */}
                        <StatCard
                            icon={Users}
                            label="Total Pelanggan"
                            value={String(s.total_customers)}
                            sub={`${s.customers_this_week} bergabung minggu ini`}
                            spark={weekly.map((d) => d.value)}
                        />

                        {/* 4. Menu Aktif */}
                        <StatCard
                            icon={UtensilsCrossed}
                            label="Menu Aktif"
                            value={String(s.active_menus)}
                            sub={
                                s.low_stock_menus > 0
                                    ? `${s.low_stock_menus} menu stok menipis`
                                    : 'Semua stok aman'
                            }
                            spark={weekly.map((d) => d.value)}
                        />
                    </div>

                    {/* ── Row 2: Bar Chart + Donut ── */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {/* Revenue 7 Hari */}
                        <div className="group rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-34px_rgba(15,23,42,0.52)] lg:col-span-2">
                            <div className="mb-5 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-text">
                                        Pendapatan 7 Hari
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Senin – Minggu ini
                                    </p>
                                </div>
                                <span className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
                                    {fmt(
                                        weekly.reduce(
                                            (acc, d) => acc + d.value,
                                            0,
                                        ),
                                    )}
                                </span>
                            </div>
                            <BarChart data={weekly} />
                        </div>

                        {/* Status Pesanan Donut */}
                        <div className="group rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-34px_rgba(15,23,42,0.52)]">
                            <p className="mb-1 text-sm font-semibold text-text">
                                Status Pesanan
                            </p>
                            <p className="mb-4 text-xs text-slate-400">
                                Total aktif hari ini
                            </p>
                            <DonutChart segments={segments} />

                            <div className="mt-4 rounded-xl bg-secondary p-3">
                                <p className="text-[11px] text-slate-400">
                                    Tingkat penyelesaian
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-700"
                                            style={{
                                                width: `${completion_rate}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-primary">
                                        {completion_rate}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Row 3: Tabel + Top Menu ── */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {/* Recent Orders Table */}
                        <div className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-34px_rgba(15,23,42,0.52)] lg:col-span-2">
                            <div className="flex items-center justify-between border-b border-slate-100/80 px-6 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-text">
                                        Pesanan Terbaru
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        5 pesanan terakhir
                                    </p>
                                </div>
                                <Link
                                    href={admin.pesanan.index.url()}
                                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                                >
                                    Lihat semua →
                                </Link>
                            </div>

                            {recentSafe.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-120">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                                {[
                                                    'ID',
                                                    'Pelanggan',
                                                    'Menu',
                                                    'Total',
                                                    'Status',
                                                ].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-slate-400 uppercase"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {recentSafe.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="transition-colors hover:bg-secondary/40"
                                                >
                                                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm font-medium text-text">
                                                        {order.customer_name}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-slate-500">
                                                        {order.menu_summary}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm font-semibold text-text">
                                                        {order.is_price_pending ? (
                                                            <span className="inline-flex items-center rounded-full bg-accent-2/10 px-2 py-1 text-xs font-semibold text-accent">
                                                                Harga menyusul
                                                            </span>
                                                        ) : (
                                                            fmt(
                                                                order.total_amount,
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <StatusBadge
                                                            status={
                                                                order.status
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-text">
                                        Belum ada pesanan terbaru
                                    </p>
                                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                                        Begitu ada pesanan masuk, daftar ini
                                        akan tampil otomatis di sini.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Top Menu */}
                        <div className="group rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-34px_rgba(15,23,42,0.52)]">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-text">
                                        Menu Terlaris
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Berdasarkan jumlah pesanan
                                    </p>
                                </div>
                                <div className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-primary">
                                    <CalendarDays className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                                    Minggu ini
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                {topMenusSafe.length > 0 ? (
                                    topMenusSafe.map((item, i) => (
                                        <div key={i}>
                                            <div className="mb-1.5 flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <span
                                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? 'bg-primary text-white' : 'bg-secondary text-slate-500'}`}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                    <span className="truncate text-xs leading-tight font-medium text-text">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-primary">
                                                    {item.orders}x
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${item.pct}%`,
                                                        background:
                                                            i === 0
                                                                ? 'var(--color-primary)'
                                                                : 'color-mix(in srgb, var(--color-primary) 45%, transparent)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
                                        <p className="text-sm font-semibold text-text">
                                            Belum ada data menu terlaris
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Data akan muncul setelah pesanan
                                            mulai tercatat.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Quick insight */}
                            <div className="mt-6 rounded-3xl bg-linear-to-br from-primary/10 via-secondary/70 to-white px-4 py-4 ring-1 ring-primary/10">
                                <p className="text-[11px] font-semibold text-primary">
                                    <BadgeCheck className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                                    Insight
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                                    {topMenusSafe && topMenusSafe.length > 0 ? (
                                        <>
                                            {topMenusSafe[0].name} mendominasi{' '}
                                            <strong className="text-text">
                                                {topMenusSafe[0].orders} pesanan
                                            </strong>{' '}
                                            minggu ini. Pertimbangkan tambah
                                            stok untuk akhir pekan.
                                        </>
                                    ) : (
                                        'Tidak ada data menu terlaris.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
