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
        Schema::create('loyalty_configs', function (Blueprint $table) {
            $table->id();

            $table->boolean('is_active')->default(false);

            $table->unsignedSmallInteger('min_orders')->default(10);

            $table->enum('discount_type', ['nominal', 'percentage'])->default('nominal');
            $table->decimal('discount_value', 15, 2)->default(0);
            $table->decimal('max_discount', 15, 2)->nullable();

            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();

            $table->enum('count_period', ['all_time', 'this_year', 'custom'])->default('all_time');
            $table->date('count_from')->nullable();
            $table->date('count_to')->nullable();

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_configs');
    }
};
