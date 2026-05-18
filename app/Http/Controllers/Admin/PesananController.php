<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectPaymentRequest;
use App\Http\Requests\Admin\StoreManualOrderRequest;
use App\Http\Requests\Admin\UpdateManualOrderRequest;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentVerification;
use App\Models\User;
use App\Services\Admin\KasirService;
use App\Services\Admin\PesananService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PesananController extends Controller
{
    public function __construct(
        private PesananService $service,
        private KasirService $kasirService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->query('search'),
            'status' => $request->query('status'),
            'source' => $request->query('source'),
            'date_from' => $request->query('date_from'),
            'date_to' => $request->query('date_to'),
        ];

        $page = (int) $request->query('page', 1);
        $orders = $this->service->getPaginatedOrders(array_filter($filters), 15, $page);

        return Inertia::render('Admin/Pesanan/Index', [
            'orders' => $orders,
            'filters' => $filters,
        ]);
    }

    public function show(Order $order): Response
    {
        $order = $this->service->getOrderDetail($order);

        return Inertia::render('Admin/Pesanan/Show', [
            'order' => $this->formatOrderForFrontend($order),
        ]);
    }

    public function create(): Response
    {
        $menuItems = MenuItem::query()
            ->with(['category:id,name,type', 'tiers'])
            ->where('is_available', true)
            ->orderBy('sort_order')
            ->get(['id', 'category_id', 'name', 'image', 'unit', 'base_price', 'is_available']);

        return Inertia::render('Admin/Pesanan/Create', [
            'menuItems' => $menuItems->map(static function (MenuItem $menuItem): array {
                return [
                    'id' => $menuItem->hashid,
                    'name' => $menuItem->name,
                    'image' => $menuItem->image,
                    'base_price' => $menuItem->base_price !== null ? (float) $menuItem->base_price : null,
                    'unit' => $menuItem->unit,
                    'is_available' => (bool) $menuItem->is_available,
                    'category' => [
                        'id' => $menuItem->category?->hashid,
                        'name' => $menuItem->category?->name,
                        'type' => $menuItem->category?->type,
                    ],
                    'tiers' => $menuItem->tiers->map(static function ($tier): array {
                        return [
                            'id' => (string) $tier->id,
                            'kode' => $tier->kode,
                            'is_half' => (bool) $tier->is_half,
                            'berat_min' => (float) $tier->berat_min,
                            'berat_max' => $tier->berat_max !== null ? (float) $tier->berat_max : null,
                            'harga_mentah' => (float) $tier->harga_mentah,
                            'harga_matang' => (float) $tier->harga_matang,
                            'cashback' => (float) $tier->cashback,
                        ];
                    })->values(),
                ];
            })->values(),
            'customers' => User::query()
                ->where('role', 'pembeli')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'phone'])
                ->map(static fn(User $user): array => [
                    'id' => $user->hashid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ])
                ->values(),
        ]);
    }

    public function store(StoreManualOrderRequest $request): RedirectResponse
    {
        try {
            $order = $this->kasirService->createManualOrder(
                $request->validated(),
                $request->user(),
            );
        } catch (\InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'items' => $exception->getMessage(),
            ]);
        }

        return redirect()
            ->route('admin.pesanan.show', $order)
            ->with('success', "Pesanan {$order->order_number} berhasil dibuat.");
    }

    public function edit(Order $order): Response
    {
        if ($order->source === 'pembeli') {
            abort(403, 'Tidak dapat mengedit pesanan dari pelanggan');
        }

        $order = $this->service->getOrderDetail($order);
        $menuItems = MenuItem::query()
            ->with('category:id,type')
            ->where('is_available', true)
            ->get(['id', 'category_id', 'name', 'unit', 'base_price']);

        return Inertia::render('Admin/Pesanan/Edit', [
            'order' => $this->formatOrderForFrontend($order),
            'menuItems' => $menuItems->map(static function (MenuItem $menuItem): array {
                return [
                    'id' => $menuItem->hashid,
                    'name' => $menuItem->name,
                    'category_type' => $menuItem->category?->type,
                    'unit' => $menuItem->unit,
                    'base_price' => $menuItem->base_price !== null ? (float) $menuItem->base_price : null,
                ];
            })->values(),
            'isEditable' => $order->isEditable(),
        ]);
    }

    public function update(Order $order, UpdateManualOrderRequest $request): RedirectResponse
    {
        try {
            $this->service->updateManualOrder(
                $order,
                $request->validated(),
                $request->user(),
            );
        } catch (\InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'items' => $exception->getMessage(),
            ]);
        }

        return redirect()->route('admin.pesanan.index')->with('success', 'Pesanan berhasil diperbarui');
    }

    public function verifyPayment(Request $request, Order $order, Payment $payment)
    {
        $this->authorize('verify', $order);

        $this->service->verifyPayment($payment, $request->user());

        return back()->with('success', 'Pembayaran berhasil diverifikasi');
    }

    public function rejectPayment(RejectPaymentRequest $request, Order $order, Payment $payment)
    {
        $this->authorize('reject', $order);

        $this->service->rejectPayment(
            $payment,
            $request->validated()['rejection_notes'],
            $request->user(),
        );

        return back()->with('success', 'Pembayaran berhasil ditolak');
    }

    public function verifyPaymentVerification(Request $request, Order $order, PaymentVerification $paymentVerification)
    {
        $this->authorize('verify', $paymentVerification->order);

        $this->service->verifyPaymentVerification($paymentVerification, $request->user());

        return back()->with('success', 'Bukti pembayaran berhasil diverifikasi');
    }

    public function rejectPaymentVerification(Request $request, Order $order, PaymentVerification $paymentVerification)
    {
        $request->validate([
            'rejection_notes' => 'nullable|string',
        ]);

        $this->authorize('reject', $paymentVerification->order);

        $this->service->rejectPaymentVerification(
            $paymentVerification,
            $request->input('rejection_notes', ''),
            $request->user(),
        );

        return back()->with('success', 'Bukti pembayaran berhasil ditolak');
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:baru,menunggu_verifikasi,diproses,selesai',
        ]);

        $this->service->updateStatus($order, $validated['status']);

        return back()->with('success', 'Status pesanan berhasil diperbarui');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOrderForFrontend(Order $order): array
    {
        $items = $order->items->map(static function ($item): array {
            return [
                'id' => $item->hashid,
                'order_id' => $item->order?->hashid,
                'menu_item_id' => $item->menuItem?->hashid,
                'menu_name' => $item->menu_name,
                'menu_category_type' => $item->menu_category_type,
                'menu_unit' => $item->menu_unit,
                'kondisi_produk' => $item->kondisi_produk,
                'adat_type' => $item->adat_type,
                'qty' => (float) $item->quantity,
                'quantity' => (float) $item->quantity,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
                'notes' => $item->notes,
            ];
        })->values()->toArray();

        $payments = $order->payments->map(static function ($payment): array {
            return [
                'id' => $payment->hashid,
                'order_id' => $payment->order?->hashid,
                'type' => $payment->type,
                'expected_amount' => $payment->expected_amount,
                'unique_code' => $payment->unique_code,
                'payment_proof' => $payment->payment_proof,
                'status' => $payment->status,
                'verified_by' => $payment->verified_by,
                'verified_at' => $payment->verified_at,
                'rejection_notes' => $payment->rejection_notes,
            ];
        })->values()->toArray();

        if ($order->paymentVerifications && $order->paymentVerifications->isNotEmpty()) {
            foreach ($order->paymentVerifications as $paymentVerification) {
                $payments[] = [
                    'id' => $paymentVerification->hashid,
                    'type' => $paymentVerification->payment_type ?? null,
                    'payment_type' => $paymentVerification->payment_type ?? null,
                    'expected_amount' => $paymentVerification->amount ?? null,
                    'unique_code' => null,
                    'payment_proof' => $paymentVerification->proof_image ?? null,
                    'status' => $paymentVerification->status ?? null,
                    'verified_at' => $paymentVerification->verified_at ?? null,
                    'rejection_notes' => $paymentVerification->rejection_notes ?? null,
                    'is_verification' => true,
                ];
            }
        }

        return [
            'id' => $order->hashid,
            'order_number' => $order->order_number,
            'source' => $order->source ?? 'pembeli',
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'order_type' => $order->order_type,
            'booking_date' => $order->booking_date,
            'booking_time' => $order->booking_time,
            'pickup_time' => $order->pickup_time,
            'delivery_time' => $order->delivery_time,
            'delivery_address' => $order->delivery_address,
            'order_status' => $order->order_status,
            'notes' => $order->notes,
            'subtotal' => $order->subtotal,
            'total_amount' => $order->total_amount,
            'dp_percentage' => $order->dp_percentage,
            'dp_amount' => $order->dp_amount,
            'remaining_amount' => $order->remaining_amount,
            'is_price_pending' => $order->is_price_pending,
            'editable_until' => $order->editable_until,
            'isEditable' => $order->isEditable(),
            'items' => $items,
            'payments' => $payments,
            'created_by' => $order->createdBy
                ? array_merge($order->createdBy->toArray(), ['id' => $order->createdBy->hashid])
                : null,
            'user' => $order->user
                ? array_merge($order->user->toArray(), ['id' => $order->user->hashid])
                : null,
        ];
    }
}
