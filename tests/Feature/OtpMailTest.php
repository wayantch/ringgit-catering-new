<?php

use App\Mail\OtpMail;
use App\Models\OtpToken;
use App\Services\Auth\OtpService;

it('renders otp mail without laravel branding', function (): void {
    $html = (new OtpMail('123456'))->render();

    expect($html)
        ->toContain('123456')
        ->toContain('Ringgit Catering')
        ->not->toContain('Laravel');
});

it('uses a finite smtp timeout for otp mail sending', function (): void {
    expect(config('mail.mailers.smtp.timeout'))->toBe(10);
});

it('returns a validation error when otp mail sending fails', function (): void {
    $this->instance(OtpService::class, new class extends OtpService
    {
        public function sendOtp(string $email): OtpToken
        {
            throw new RuntimeException('SMTP failed');
        }
    });

    $this->post('/login/otp/request', [
        'email' => 'yanss@example.com',
    ])
        ->assertSessionHasErrors(['email']);
});
