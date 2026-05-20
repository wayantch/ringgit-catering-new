import { useForm, Link } from '@inertiajs/react';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import React, { useEffect, useRef, useState, FormEvent } from 'react';
import otpRoutes from '@/routes/otp';
import user from '@/routes/user';

interface Props {
    email: string;
}

export default function OtpVerify({ email }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email,
        token: '',
    });

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(300); // 5 menit
    const [canResend, setCanResend] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);

            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow single digit
        if (!/^\d?$/.test(value)) {
return;
}

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Update form token
        setData('token', newOtp.join(''));

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if all 6 digits filled
        if (newOtp.every((digit) => digit !== '') && index === 5) {
            setTimeout(() => {
                handleSubmit();
            }, 100);
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                setData('token', newOtp.join(''));
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const digits = pasteData.replace(/\D/g, '').slice(0, 6);

        if (digits.length > 0) {
            const newOtp = digits
                .split('')
                .concat(Array(6 - digits.length).fill(''));
            setOtp(newOtp as string[]);
            setData('token', digits);

            if (digits.length === 6) {
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            } else {
                inputRefs.current[digits.length]?.focus();
            }
        }
    };

    const handleSubmit = () => {
        if (otp.join('').length === 6 && !processing && !isSubmitting) {
            setIsSubmitting(true);

            post(otpRoutes.verify().url, {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleResend = () => {
        post(otpRoutes.resend().url, {
            onSuccess: () => {
                setOtp(['', '', '', '', '', '']);
                setData('token', '');
                setCountdown(300);
                setCanResend(false);
                inputRefs.current[0]?.focus();
            },
        });
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

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
                {/* Back button */}
                <Link
                    href={user.login().url}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Ganti Email</span>
                </Link>

                {/* Header */}
                <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                            <Mail className="h-7 w-7 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text">
                            Cek Inbox Kamu
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Kode OTP dikirim ke{' '}
                            <span className="font-semibold text-text">
                                {email}
                            </span>
                        </p>
                    </div>
                </div>

                {/* OTP Input boxes */}
                <div>
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={otp[index]}
                                onChange={(e) =>
                                    handleOtpChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="h-14 w-12 rounded-xl border-2 border-slate-200 bg-white text-center text-2xl font-bold text-text transition placeholder:text-slate-400 focus:border-primary focus:outline-none"
                                placeholder="-"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {errors.token && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{errors.token}</span>
                        </div>
                    )}
                </div>

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={!isOtpComplete || processing || isSubmitting}
                    className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:enabled:bg-primary-600 disabled:opacity-60"
                >
                    {processing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Memverifikasi...</span>
                        </span>
                    ) : (
                        'Verifikasi'
                    )}
                </button>

                {/* Resend section */}
                <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                    <p className="text-center text-sm text-slate-600">
                        {canResend ? (
                            <span>Belum terima kode? </span>
                        ) : (
                            <span>Kirim ulang dalam </span>
                        )}
                        {!canResend && (
                            <span className="font-semibold text-primary">
                                {formatTime(countdown)}
                            </span>
                        )}
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={!canResend || processing}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:enabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Kirim Ulang OTP
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-500">
                    Ringgit Catering © 2025
                </p>
            </div>
        </div>
    );
}
