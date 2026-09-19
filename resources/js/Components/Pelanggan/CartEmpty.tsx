import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { menu } from '@/routes/user';

export default function CartEmpty() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingCart className="size-6 text-primary" />
            </span>
            <p className="mt-4 text-sm font-medium text-text">
                Keranjang kamu kosong
            </p>
            <p className="mt-1 text-sm text-slate-500">
                Pilih menu untuk mulai memesan.
            </p>
            <Link
                href={menu()}
                className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
                Lihat menu
            </Link>
        </div>
    );
}
