<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectPaymentRequest;
use App\Http\Requests\Admin\StoreManualOrderRequest;
use App\Http\Requests\Admin\UpdateManualOrderRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentVerification;
use App\Services\Admin\KasirService;
use App\Services\Admin\PesananPresenter;
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
        private PesananPresenter $presenter,
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
            'order' => $this->presenter->orderDetail($order),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pesanan/Create', $this->kasirService->getFormData());
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

        return Inertia::render('Admin/Pesanan/Edit', [
            'order' => $this->presenter->orderDetail($order),
            'menuItems' => $this->kasirService->getMenuOptions(),
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
            'status' => 'required|string|in:baru,diproses,selesai',
        ]);

        $this->service->updateStatus($order, $validated['status']);

        return back()->with('success', 'Status pesanan berhasil diperbarui');
    }
}
