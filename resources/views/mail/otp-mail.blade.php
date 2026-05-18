<div
    style="margin: 0; padding: 0; background-color: #f4efe6; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; padding: 32px 20px;">
        <div
            style="background: #ffffff; border: 1px solid #eadfce; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(31, 41, 55, 0.08);">
            <div
                style="display: inline-block; background: #f6d7a7; color: #8a4b08; border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px;">
                Ringgit Catering
            </div>

            <h1 style="margin: 0 0 12px; font-size: 28px; line-height: 1.2; color: #111827;">
                Kode OTP Anda
            </h1>

            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Berikut adalah kode OTP untuk login ke akun Anda.
            </p>

            <div
                style="margin: 28px 0; padding: 22px 18px; text-align: center; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px;">
                <div
                    style="font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #9a3412; margin-bottom: 10px;">
                    Kode OTP
                </div>
                <div style="font-size: 32px; line-height: 1; font-weight: 800; letter-spacing: 0.2em; color: #111827;">
                    {{ $token }}
                </div>
            </div>

            <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.7; color: #4b5563;">
                Kode ini berlaku selama {{ $expiryMinutes }} menit.
            </p>

            <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.7; color: #4b5563;">
                Jika Anda tidak meminta kode ini, abaikan email ini.
            </p>

            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #991b1b; font-weight: 700;">
                Jangan bagikan kode ini kepada siapa pun. Kami tidak akan pernah meminta kode OTP Anda.
            </p>
        </div>

        <p style="margin: 18px 0 0; font-size: 12px; line-height: 1.6; color: #9ca3af; text-align: center;">
            &copy; {{ date('Y') }} Ringgit Catering. Semua hak dilindungi.
        </p>
    </div>
</div>
