<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('order_number')->unique();
            $table->enum('order_type', ['takeaway', 'delivery']);
            $table->date('booking_date');
            $table->time('booking_time');
            $table->string('delivery_address')->nullable();
            $table->enum('order_status', ['baru', 'menunggu_verifikasi', 'diproses', 'selesai'])->default('baru');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('dp_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
