<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the production columns that were never wired into the application.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['order_status', 'production_stage']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['production_stage', 'is_urgent']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('order_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['order_status']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('production_stage', ['diproses', 'dimasak', 'siap'])
                ->default('diproses')
                ->after('order_status');
            $table->boolean('is_urgent')->default(false)->after('production_stage');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['order_status', 'production_stage']);
        });
    }
};
