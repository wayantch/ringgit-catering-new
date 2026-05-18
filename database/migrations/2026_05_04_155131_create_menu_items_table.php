<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained('menu_categories')->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->decimal('base_price', 15, 2)->nullable();
            $table->string('unit')->default('kg');
            $table->boolean('is_available')->default(true);
            $table->decimal('stock_quantity', 15, 2)->nullable();
            $table->smallInteger('min_order_hours')->nullable();
            $table->smallInteger('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
