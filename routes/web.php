<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PelangganController;
use App\Http\Controllers\Admin\PengaturanController;
use App\Http\Controllers\Admin\PengaturanLoyaltiController;
use App\Http\Controllers\Admin\PesananController;
use App\Http\Controllers\Admin\PrintController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\Pelanggan\BerandaController;
use App\Http\Controllers\Pelanggan\CheckoutController;
use App\Http\Controllers\Pelanggan\KeranjangController;
use App\Http\Controllers\Pelanggan\MenuController as PelangganMenuController;
use App\Http\Controllers\Pelanggan\PesananController as PelangganPesananController;
use App\Http\Controllers\Pelanggan\ProfilController;
use App\Http\Controllers\Produksi\BerandaController as ProduksiBerandaController;
use App\Http\Controllers\Produksi\PesananController as ProduksiPesananController;
use App\Http\Controllers\Produksi\RiwayatController as ProduksiRiwayatController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    // OTP Login routes
    Route::get('/login', [OtpController::class, 'showLogin'])->name('login');
    Route::post('/login/otp/request', [OtpController::class, 'requestOtp'])->name('otp.request');
    Route::get('/login/otp/verify', [OtpController::class, 'showVerify'])->name('otp.verify.show');
    Route::post('/login/otp/verify', [OtpController::class, 'verifyOtp'])->name('otp.verify');
    Route::post('/login/otp/resend', [OtpController::class, 'resendOtp'])->name('otp.resend');

    // Legacy login routes (for backward compatibility, redirect to OTP)
    Route::get('/user/login', [LoginController::class, 'showUserLoginForm'])->name('user.login');
    Route::post('/user/login', [LoginController::class, 'loginUser']);

    Route::get('/admin/login', [LoginController::class, 'showAdminLoginForm'])->name('admin.login');
    Route::post('/admin/login', [LoginController::class, 'loginAdmin']);
});

Route::post('/logout', [OtpController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

Route::get('/', [LandingPageController::class, 'index'])->name('home');

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/profil', [ProfileController::class, 'index'])->name('profil.index');
        Route::patch('/profil', [ProfileController::class, 'update'])->name('profil.update');
        Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan.index');
        Route::patch('/pengaturan', [PengaturanController::class, 'update'])->name('pengaturan.update');

        // Custom pesanan routes must come before resource routes
        Route::post('pesanan/{order}/verify-payment/{payment}', [PesananController::class, 'verifyPayment'])->name('pesanan.verifyPayment');
        Route::post('pesanan/{order}/reject-payment/{payment}', [PesananController::class, 'rejectPayment'])->name('pesanan.rejectPayment');
        Route::post('pesanan/{order}/verify-payment-verification/{paymentVerification}', [PesananController::class, 'verifyPaymentVerification'])->name('pesanan.verifyPaymentVerification');
        Route::post('pesanan/{order}/reject-payment-verification/{paymentVerification}', [PesananController::class, 'rejectPaymentVerification'])->name('pesanan.rejectPaymentVerification');
        Route::post('pesanan/{order}/update-status', [PesananController::class, 'updateStatus'])->name('pesanan.updateStatus');

        // Resource routes come after custom routes
        Route::resource('pesanan', PesananController::class)->parameters([
            'pesanan' => 'order',
        ]);
        Route::resource('menu', MenuController::class);
        Route::patch('menu/{menu}/toggle', [MenuController::class, 'toggle'])->name('menu.toggle');
        Route::resource('pelanggan', PelangganController::class)->except(['destroy']);
        Route::post('pelanggan/{pelanggan}/invite', [PelangganController::class, 'sendInvite'])->name('pelanggan.invite');
        Route::prefix('pengaturan')->name('pengaturan.')->group(function (): void {
            Route::get('loyalti', [PengaturanLoyaltiController::class, 'index'])->name('loyalti');
            Route::post('loyalti', [PengaturanLoyaltiController::class, 'store'])->name('loyalti.store');
            Route::patch('loyalti/{loyaltyConfig}', [PengaturanLoyaltiController::class, 'update'])->name('loyalti.update');
        });
        Route::get('print', [PrintController::class, 'index'])->name('print.index');
    });

Route::middleware(['auth', 'role:produksi'])
    ->prefix('produksi')
    ->name('produksi.')
    ->group(function (): void {
        Route::get('/beranda', ProduksiBerandaController::class)->name('beranda');

        Route::prefix('pesanan')->name('pesanan.')->group(function (): void {
            Route::get('/', [ProduksiPesananController::class, 'index'])->name('index');
            Route::get('/{order}', [ProduksiPesananController::class, 'show'])->name('detail');
            Route::patch('/{order}/proses', [ProduksiPesananController::class, 'proses'])->name('proses');
            Route::patch('/{order}/selesai', [ProduksiPesananController::class, 'selesai'])->name('selesai');
        });

        Route::get('/riwayat', ProduksiRiwayatController::class)->name('riwayat');
    });

Route::middleware(['auth', 'role:pembeli,user'])
    ->prefix('user')
    ->name('user.')
    ->group(function (): void {
        Route::get('/beranda', BerandaController::class)->name('beranda');
        Route::get('/menu', PelangganMenuController::class)->name('menu');

        Route::prefix('keranjang')->name('keranjang.')->group(function (): void {
            Route::get('/', [KeranjangController::class, 'index'])->name('index');
            Route::post('/', [KeranjangController::class, 'store'])->name('store');
            Route::patch('/{cart}', [KeranjangController::class, 'update'])->name('update');
            Route::delete('/{cart}', [KeranjangController::class, 'destroy'])->name('destroy');
        });

        Route::get('/checkout', CheckoutController::class)->name('checkout');

        Route::prefix('pesanan')->name('pesanan.')->group(function (): void {
            Route::get('/', [PelangganPesananController::class, 'index'])->name('index');
            Route::post('/', [PelangganPesananController::class, 'store'])->name('store');
            Route::get('/draft/upload', [PelangganPesananController::class, 'uploadDraftForm'])->name('uploadDraftForm');
            Route::post('/draft/upload-bukti', [PelangganPesananController::class, 'uploadDraftBukti'])->name('uploadDraftBukti');
            Route::get('/{order}/upload', [PelangganPesananController::class, 'uploadForm'])->name('uploadForm');
            Route::get('/{order}', [PelangganPesananController::class, 'show'])->name('show');
            Route::post('/{order}/upload-bukti', [PelangganPesananController::class, 'uploadBukti'])->name('uploadBukti');
        });

        Route::prefix('profil')->name('profil.')->group(function (): void {
            Route::get('/', [ProfilController::class, 'index'])->name('index');
            Route::patch('/', [ProfilController::class, 'update'])->name('update');
        });
    });
