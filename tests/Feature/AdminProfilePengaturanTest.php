<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('shows the admin profile page with account data', function (): void {
    $admin = User::factory()->admin()->create([
        'name' => 'Admin Utama',
        'email' => 'admin@example.com',
        'phone' => '08123456789',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.profil.index'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Profil/Index')
            ->where('user.name', 'Admin Utama')
            ->where('user.email', 'admin@example.com')
            ->where('user.role', 'admin')
    );
});

it('updates the admin profile information', function (): void {
    $admin = User::factory()->admin()->create([
        'name' => 'Admin Lama',
        'phone' => '08111111111',
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.profil.update'), [
        'name' => 'Admin Baru',
        'phone' => '08122222222',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $admin->refresh();

    expect($admin->name)->toBe('Admin Baru')
        ->and($admin->phone)->toBe('08122222222');
});

it('updates the admin password', function (): void {
    $admin = User::factory()->admin()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.profil.update'), [
        'current_password' => 'password',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    expect(Hash::check('new-password-123', $admin->refresh()->password))->toBeTrue();
});

it('shows the admin settings page with business settings data', function (): void {
    $admin = User::factory()->admin()->create();
    $setting = Setting::current();
    $setting->update([
        'business_name' => 'Ringgit Catering',
        'whatsapp_number' => '08123456789',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_holder_name' => 'Ringgit Catering',
        'dp_percentage' => 30,
        'order_edit_limit_days' => 2,
        'otp_expiry_minutes' => 10,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.pengaturan.index'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Pengaturan/Index')
            ->where('setting.business_name', 'Ringgit Catering')
            ->where('setting.dp_percentage', 30)
            ->where('setting.otp_expiry_minutes', 10)
    );
});

it('updates the business settings', function (): void {
    $admin = User::factory()->admin()->create();
    $setting = Setting::current();

    $response = $this->actingAs($admin)->patch(route('admin.pengaturan.update'), [
        'business_name' => 'Ringgit Catering Baru',
        'whatsapp_number' => '082233445566',
        'bank_name' => 'Mandiri',
        'bank_account_number' => '9876543210',
        'bank_account_holder_name' => 'Pemilik Baru',
        'dp_percentage' => 35,
        'order_edit_limit_days' => 3,
        'otp_expiry_minutes' => 15,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $setting->refresh();

    expect($setting->business_name)->toBe('Ringgit Catering Baru')
        ->and($setting->whatsapp_number)->toBe('082233445566')
        ->and($setting->dp_percentage)->toBe(35)
        ->and($setting->order_edit_limit_days)->toBe(3)
        ->and($setting->otp_expiry_minutes)->toBe(15);
});
