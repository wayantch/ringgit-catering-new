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
        if (! Schema::hasTable('carts')) {
            return;
        }

        Schema::table('carts', function (Blueprint $table) {
            $table->string('portion')->nullable()->after('adat_type');
        });

        // Recreate unique index to include portion
        Schema::table('carts', function (Blueprint $table) {
            // Drop existing unique index if present (name varies by DB), attempt by columns
            try {
                $table->dropUnique(['user_id', 'menu_item_id', 'kondisi_produk', 'adat_type']);
            } catch (Throwable $e) {
                // ignore
            }

            $table->unique(['user_id', 'menu_item_id', 'kondisi_produk', 'adat_type', 'portion'], 'carts_user_menu_kondisi_adat_portion_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('carts')) {
            return;
        }

        Schema::table('carts', function (Blueprint $table) {
            try {
                $table->dropUnique('carts_user_menu_kondisi_adat_portion_unique');
            } catch (Throwable $e) {
            }

            $table->unique(['user_id', 'menu_item_id', 'kondisi_produk', 'adat_type'], 'carts_user_menu_kondisi_adat_unique');

            $table->dropColumn('portion');
        });
    }
};
