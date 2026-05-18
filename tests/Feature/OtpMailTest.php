<?php

use App\Mail\OtpMail;

it('renders otp mail without laravel branding', function (): void {
    $html = (new OtpMail('123456'))->render();

    expect($html)
        ->toContain('123456')
        ->toContain('Ringgit Catering')
        ->not->toContain('Laravel');
});
