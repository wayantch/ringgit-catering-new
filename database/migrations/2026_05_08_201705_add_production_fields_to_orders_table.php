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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('production_stage', ['diproses', 'dimasak', 'siap'])
                ->default('diproses')
                ->after('order_status');
            $table->boolean('is_urgent')->default(false)->after('production_stage');
            $table->timestamp('production_completed_at')->nullable()->after('is_urgent');

            $table->index(['order_status', 'production_stage']);
            $table->index('production_completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['order_status', 'production_stage']);
            $table->dropIndex(['production_completed_at']);
            $table->dropColumn([
                'production_stage',
                'is_urgent',
                'production_completed_at',
            ]);
        });
    }
};
