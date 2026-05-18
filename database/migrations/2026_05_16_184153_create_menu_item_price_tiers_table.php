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
        Schema::create('menu_item_price_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained()->cascadeOnDelete();
            $table->enum('kode', ['A', 'B', 'C']);
            $table->boolean('is_half')->default(false);
            $table->decimal('berat_min', 8, 2);
            $table->decimal('berat_max', 8, 2)->nullable();
            $table->decimal('harga_mentah', 15, 2);
            $table->decimal('harga_matang', 15, 2);
            $table->decimal('cashback', 15, 2)->default(0);
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_item_price_tiers');
    }
};
