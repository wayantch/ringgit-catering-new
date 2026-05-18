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
        Schema::table('menu_items', function (Blueprint $table) {
            $table->enum('menu_type', ['timbang_hidup', 'eceran'])->after('category_id');
            $table->string('sub_type', 30)->nullable()->after('menu_type');
            $table->boolean('is_bundle')->default(false)->after('sub_type');
            $table->text('bundle_desc')->nullable()->after('is_bundle');
            $table->smallInteger('free_ongkir_km')->nullable()->after('bundle_desc');
            $table->json('ongkir_subsidi')->nullable()->after('free_ongkir_km');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn([
                'menu_type',
                'sub_type',
                'is_bundle',
                'bundle_desc',
                'free_ongkir_km',
                'ongkir_subsidi',
            ]);
        });
    }
};
