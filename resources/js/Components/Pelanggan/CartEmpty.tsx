import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { menu } from '@/routes/user';

export default function CartEmpty() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-black/5 sm:px-8 sm:py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                <ShoppingCart className="h-10 w-10 text-primary/40" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-text">
                Keranjang kamu kosong
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Yuk mulai pilih menu favoritmu.
            </p>
            <Link
                href={menu()}
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
                Lihat Menu
            </Link>
        </div>
    );
}
