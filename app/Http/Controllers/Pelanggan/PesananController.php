<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pelanggan\StoreCheckoutRequest;
use App\Models\Order;
use App\Services\Pelanggan\PesananService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class PesananController extends Controller
{
    public function index(Request $request, PesananService $service): Response
    {
        $filter = $request->string('filter')->toString() ?: 'all';
        $date = $request->string('date')->toString() ?: null;

        $orders = $service->getOrders($request->user(), 12, $filter, $date);

        return Inertia::render('Pelanggan/Pesanan/Index', [
            'orders' => $orders,
            'filters' => [
                'filter' => $filter,
                'date' => $date,
            ],
        ]);
    }

    public function store(StoreCheckoutRequest $request, PesananService $service): SymfonyResponse|RedirectResponse
    {
        $validated = $request->validated();
        $validated['booking_time'] = $validated['pickup_time']
            ?? $validated['delivery_time'];

        try {
            $draft = $service->buildCheckoutDraft($request->user(), $validated);

            $request->session()->put('checkout_draft', $draft);
            $request->session()->flash('success', 'Checkout tersimpan. Silakan upload bukti pembayaran.');

            return Inertia::location(route('user.pesanan.uploadDraftForm'));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Request $request, Order $order, PesananService $service): Response
    {
        $this->authorize('view', $order);
        $detail = $service->getDetail($order);

        return Inertia::render('Pelanggan/Pesanan/Detail', [
            'order' => $detail,
        ]);
    }

    public function uploadBukti(Request $request, Order $order, PesananService $service): RedirectResponse
    {
        $this->authorize('view', $order);

        if ($order->order_status === 'dibatalkan') {
            return back()->with('error', 'Pesanan sudah dibatalkan, bukti pembayaran tidak bisa diupload lagi.');
        }

        $validated = $request->validate([
            'payment_type' => 'required|in:dp,pelunasan',
            'proof_image' => 'required|image|max:2048',
        ]);

        $service->uploadPaymentVerification($order, $validated['proof_image'], $validated['payment_type']);

        // After upload, redirect to detail page
        return redirect()->route('user.pesanan.show', $order)->with('success', 'Bukti pembayaran berhasil diupload. Admin akan memverifikasi dalam waktu singkat.');
    }

    public function uploadForm(
        Request $request,
        Order $order,
        PesananService $service,
    ): Response {
        $this->authorize('view', $order);

        $detail = $service->getDetail($order);

        return Inertia::render('Pelanggan/Pesanan/UploadForm', [
            'order' => $detail,
        ]);
    }

    public function uploadDraftForm(Request $request): Response|RedirectResponse
    {
        $draft = $request->session()->get('checkout_draft');

        if (! is_array($draft)) {
            return redirect()
                ->route('user.checkout')
                ->with('error', 'Draft checkout tidak ditemukan. Silakan checkout ulang.');
        }

        return Inertia::render('Pelanggan/Pesanan/UploadDraftForm', [
            'draft' => $draft,
        ]);
    }

    public function uploadDraftBukti(Request $request, PesananService $service): RedirectResponse
    {
        $draft = $request->session()->get('checkout_draft');

        if (! is_array($draft)) {
            return redirect()
                ->route('user.checkout')
                ->with('error', 'Draft checkout tidak ditemukan. Silakan checkout ulang.');
        }

        $validated = $request->validate([
            'payment_type' => 'required|in:dp,pelunasan',
            'proof_image' => 'required|image|max:2048',
        ]);

        try {
            $order = $service->finalizeCheckoutDraft(
                $request->user(),
                $draft,
                $validated['proof_image'],
                $validated['payment_type'],
            );

            $request->session()->forget('checkout_draft');

            return redirect()
                ->route('user.pesanan.show', $order)
                ->with('success', 'Bukti pembayaran berhasil diupload. Admin akan memverifikasi dalam waktu singkat.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
