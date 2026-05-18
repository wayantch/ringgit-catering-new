<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePelangganRequest;
use App\Http\Requests\Admin\UpdatePelangganRequest;
use App\Models\User;
use App\Services\Admin\PelangganService;
use App\Services\LoyaltyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PelangganController extends Controller
{
    public function __construct(
        private PelangganService $pelangganService,
        private LoyaltyService $loyaltyService,
    ) {}

    public function index(): Response
    {
        $filters = [
            'search' => request('search'),
            'status' => request('status', 'semua'),
        ];

        $pelanggan = $this->pelangganService->getPaginatedPelanggan($filters);
        $stats = $this->pelangganService->getStats();

        return inertia('Admin/Pelanggan/Index', [
            'pelanggan' => $pelanggan,
            'filters' => $filters,
            'stats' => $stats,
            'loyaltyStats' => $this->loyaltyService->getAdminStats(),
        ]);
    }

    public function create(): Response
    {
        return inertia('Admin/Pelanggan/Form', [
            'mode' => 'create',
            'pelanggan' => null,
        ]);
    }

    public function store(StorePelangganRequest $request): RedirectResponse
    {
        $pelanggan = $this->pelangganService->createPelanggan(
            $request->validated()
        );

        if ($request->boolean('send_invite')) {
            $this->pelangganService->sendInviteOtp($pelanggan);
            $message = "Pelanggan berhasil dibuat. Undangan login telah dikirim ke {$pelanggan->email}.";
        } else {
            $message = 'Pelanggan berhasil dibuat.';
        }

        return redirect()
            ->route('admin.pelanggan.show', $pelanggan)
            ->with('success', $message);
    }

    public function show(Request $request, User $pelanggan): Response
    {
        abort_unless($pelanggan->role === 'pembeli', 404);

        $detail = $this->pelangganService->getPelangganDetail(
            $pelanggan,
            10,
            (int) $request->integer('page', 1),
        );

        return inertia('Admin/Pelanggan/Show', [
            'pelanggan' => $detail,
        ]);
    }

    public function edit(User $pelanggan): Response
    {
        abort_unless($pelanggan->role === 'pembeli', 404);

        return inertia('Admin/Pelanggan/Form', [
            'mode' => 'edit',
            'pelanggan' => [
                'id' => $pelanggan->hashid,
                'name' => $pelanggan->name,
                'email' => $pelanggan->email,
                'phone' => $pelanggan->phone,
            ],
        ]);
    }

    public function update(
        UpdatePelangganRequest $request,
        User $pelanggan,
    ): RedirectResponse {
        abort_unless($pelanggan->role === 'pembeli', 404);

        $this->pelangganService->updatePelanggan(
            $pelanggan,
            $request->validated()
        );

        return redirect()
            ->route('admin.pelanggan.show', $pelanggan)
            ->with('success', 'Pelanggan berhasil diperbarui.');
    }

    public function sendInvite(User $pelanggan): RedirectResponse
    {
        abort_unless($pelanggan->role === 'pembeli', 404);

        $this->pelangganService->sendInviteOtp($pelanggan);

        return back()->with(
            'success',
            "Undangan login telah dikirim ke {$pelanggan->email}."
        );
    }
}
