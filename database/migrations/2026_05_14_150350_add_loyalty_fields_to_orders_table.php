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
            $table->foreignId('loyalty_redemption_id')
                ->nullable()
                ->after('remaining_amount')
                ->constrained('loyalty_redemptions')
                ->nullOnDelete();

            $table->decimal('loyalty_discount', 15, 2)
                ->nullable()
                ->after('loyalty_redemption_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('loyalty_redemption_id');
            $table->dropColumn('loyalty_discount');
        });
    }
};
