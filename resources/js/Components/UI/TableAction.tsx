import { Link } from '@inertiajs/react';
import { Eye, Pencil, Printer, Trash2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TableActionKind = 'view' | 'edit' | 'delete' | 'print';

const ACTION_META: Record<
    TableActionKind,
    { icon: typeof Eye; label: string; danger: boolean }
> = {
    view: { icon: Eye, label: 'Lihat detail', danger: false },
    edit: { icon: Pencil, label: 'Edit', danger: false },
    delete: { icon: Trash2, label: 'Hapus', danger: true },
    print: { icon: Printer, label: 'Cetak', danger: false },
};

const BASE_CLASS =
    'inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 transition disabled:cursor-not-allowed disabled:opacity-50';

interface TableActionProps {
    action: TableActionKind;
    /** Render as a link when given, otherwise as a button. */
    href?: ComponentProps<typeof Link>['href'];
    onClick?: () => void;
    /** Overrides the default tooltip, e.g. "Lihat pelanggan". */
    label?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * One action in a table row. Icon only — the label rides along as a tooltip and
 * as the accessible name, so every table speaks the same visual language.
 */
export default function TableAction({
    action,
    href,
    onClick,
    label,
    disabled,
    className,
}: TableActionProps) {
    const meta = ACTION_META[action];
    const Icon = meta.icon;
    const text = label ?? meta.label;

    const classes = cn(
        BASE_CLASS,
        meta.danger
            ? 'text-rose-600 hover:border-rose-200 hover:bg-rose-50'
            : 'text-slate-700 hover:border-slate-300 hover:bg-slate-50',
        className,
    );

    const icon = <Icon className="size-4" aria-hidden="true" />;

    if (href !== undefined && !disabled) {
        return (
            <Link href={href} className={classes} title={text} aria-label={text}>
                {icon}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={classes}
            title={text}
            aria-label={text}
        >
            {icon}
        </button>
    );
}

/** Container that keeps the spacing between row actions identical everywhere. */
export function TableActions({ children }: { children: ReactNode }) {
    return <div className="flex items-center gap-2">{children}</div>;
}
