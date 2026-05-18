<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Make user_id nullable for walk-in orders
            $table->foreignId('user_id')->nullable()->change();

            // Add admin management fields
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->enum('source', ['pembeli', 'admin'])->default('pembeli');

            // Customer snapshot
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();

            // Separate time fields
            $table->time('pickup_time')->nullable();
            $table->time('delivery_time')->nullable();

            // Price tracking
            $table->boolean('is_price_pending')->default(false);
            $table->decimal('subtotal', 15, 2)->nullable();
            $table->unsignedSmallInteger('unique_code')->nullable();

            // DP details
            $table->unsignedTinyInteger('dp_percentage')->default(25);
            $table->unsignedSmallInteger('dp_unique_code')->nullable();

            // Edit limit for admin orders
            $table->date('editable_until')->nullable();

            // Status update: remove menunggu_verifikasi, add dibatalkan
            // This will be handled by modifying the column
        });

        // Update order_status enum by dropping and recreating
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('order_status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('order_status', ['baru', 'diproses', 'selesai', 'dibatalkan'])
                ->default('baru')
                ->after('booking_time');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeignIdFor(User::class, 'created_by');
            $table->dropColumn([
                'created_by',
                'source',
                'customer_name',
                'customer_phone',
                'customer_email',
                'pickup_time',
                'delivery_time',
                'is_price_pending',
                'subtotal',
                'unique_code',
                'dp_percentage',
                'dp_unique_code',
                'editable_until',
            ]);

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('order_status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('order_status', ['baru', 'menunggu_verifikasi', 'diproses', 'selesai'])
                ->default('baru');
        });
    }
};
