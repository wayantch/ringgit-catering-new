import {
    MoreVertical,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
} from 'lucide-react';

interface OrderRow {
    id: number;
    customerName: string;
    product: string;
    total: string;
    status: 'pending' | 'diproses' | 'selesai' | 'batal';
    date: string;
}

interface OrderTableProps {
    orders: OrderRow[];
}

const statusColors = {
    pending: 'bg-yellow-50 text-yellow-800',
    diproses: 'bg-blue-50 text-blue-800',
    selesai: 'bg-green-50 text-green-800',
    batal: 'bg-red-50 text-red-800',
};

const statusIcons: Record<string, any> = {
    pending: Clock,
    diproses: RefreshCw,
    selesai: CheckCircle,
    batal: XCircle,
};

const statusLabels = {
    pending: 'Pending',
    diproses: 'Diproses',
    selesai: 'Selesai',
    batal: 'Batal',
};

export default function OrderTable({ orders }: OrderTableProps) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-transparent">
                            <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-black/60 uppercase">
                                Nama Pelanggan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-black/60 uppercase">
                                Produk
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-black/60 uppercase">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-black/60 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-black/60 uppercase">
                                Tanggal
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold tracking-wide text-black/60 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {orders.map((order) => {
                            const StatusIcon = statusIcons[order.status];

                            return (
                                <tr
                                    key={order.id}
                                    className="transition duration-200 hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">
                                            {order.customerName}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">
                                            {order.product}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">
                                            {order.total}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}
                                        >
                                            <StatusIcon
                                                className="h-4 w-4"
                                                strokeWidth={2}
                                            />
                                            {statusLabels[order.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-500">
                                            {order.date}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="rounded p-1 text-black/40 transition hover:bg-secondary hover:text-text active:scale-95">
                                            <MoreVertical
                                                className="h-4 w-4"
                                                strokeWidth={2}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
