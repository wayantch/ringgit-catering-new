<?php

namespace App\Http\Controllers\Pelanggan;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Pelanggan\PesananService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

    public function store(Request $request, PesananService $service): RedirectResponse
    {
        $validated = $request->validate([
            'order_type' => 'required|in:takeaway,delivery',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'delivery_address' => 'required_if:order_type,delivery|nullable|string',
            'notes' => 'nullable|string',
            'phone' => 'required|string',
            'use_loyalty_discount' => 'sometimes|boolean',
        ]);

        try {
            $order = $service->create($request->user(), $validated);

            $message = 'Pesanan berhasil dibuat. Silakan upload bukti pembayaran.';

            if (($validated['use_loyalty_discount'] ?? false) && (float) $order->loyalty_discount > 0) {
                $message = 'Pesanan berhasil dibuat dan diskon loyalti telah diterapkan. Silakan upload bukti pembayaran.';
            }

            return redirect()->route('user.pesanan.uploadForm', $order)->with('success', $message);
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
}
