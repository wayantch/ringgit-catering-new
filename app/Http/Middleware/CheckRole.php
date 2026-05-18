<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('user.login');
        }

        if ($roles !== [] && ! in_array($user->role, $roles, true)) {
            return match ($user->role) {
                'admin' => redirect()->route('admin.dashboard')
                    ->with('error', 'Akses ditolak untuk halaman user.'),
                'produksi' => redirect()->route('produksi.beranda')
                    ->with('error', 'Akses ditolak untuk halaman user.'),
                default => redirect()->route('user.login')
                    ->with('error', 'Silakan login dengan akun yang sesuai.'),
            };
        }

        return $next($request);
    }
}
