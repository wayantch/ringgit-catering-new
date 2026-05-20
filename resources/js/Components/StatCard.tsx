import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color?: 'primary' | 'accent' | 'blue' | 'green' | 'purple' | 'yellow';
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    color = 'primary',
}: StatCardProps) {
    const colorMap: Record<string, string> = {
        primary: 'from-primary/10 to-transparent',
        accent: 'from-accent/10 to-transparent',
        blue: 'from-blue-100 to-transparent',
        green: 'from-green-100 to-transparent',
        purple: 'from-purple-100 to-transparent',
        yellow: 'from-yellow-100 to-transparent',
    };

    return (
        <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-12px_rgba(46,46,46,0.08)] ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-1 text-3xl font-extrabold text-gray-900">
                        {value}
                    </p>
                </div>

                <div
                    className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-white/40 ${colorMap[color]} p-2`}
                >
                    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white to-transparent opacity-10 blur-md"></div>
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm">
                        <Icon
                            className="h-6 w-6 text-gray-700"
                            strokeWidth={2}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
