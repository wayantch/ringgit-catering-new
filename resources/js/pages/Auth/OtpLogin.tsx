import { useForm } from '@inertiajs/react';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import React from 'react';
import otp from '@/routes/otp';

export default function OtpLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(otp.request().url);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-bg via-bg to-primary/5 px-4">
            {/* Background decorations */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm space-y-6">
                {/* Header */}
                <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                            <Mail className="h-7 w-7 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text">
                            Masuk ke Akun
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Kami kirimkan kode OTP ke emailmu untuk login dengan
                            aman
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email input */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@example.com"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-text transition placeholder:text-slate-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 focus:outline-none"
                            required
                        />
                        {errors.email && (
                            <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{errors.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:enabled:bg-primary-600 disabled:opacity-60"
                    >
                        {processing ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Mengirim...</span>
                            </>
                        ) : (
                            <>
                                <span>Kirim Kode OTP</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Info */}
                <div className="rounded-lg bg-primary/5 p-4 text-sm text-slate-700">
                    <p className="font-medium text-primary">💡 Informasi</p>
                    <p className="mt-2">
                        Masukan email yang terdaftar untuk menerima kode OTP.
                        Pastikan email benar agar kamu bisa masuk ke akunmu
                        dengan mudah!
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-500">
                    Ringgit Catering &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
