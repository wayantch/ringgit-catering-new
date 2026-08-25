<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $token,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode OTP Ringgit Catering: '.$this->token,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.otp-mail',
            with: [
                'token' => $this->token,
                'expiryMinutes' => config('auth.otp_expiry_minutes', 5),
            ],
        );
    }
}
