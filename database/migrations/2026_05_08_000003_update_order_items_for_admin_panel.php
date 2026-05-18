<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Make menu_item_id nullable
            $table->foreignId('menu_item_id')->nullable()->change();

            // Add snapshots
            $table->string('menu_name');
            $table->enum('menu_category_type', ['timbang_hidup', 'olahan', 'eceran']);
            $table->string('menu_unit');

            // Rename and make unit_price nullable
            $table->decimal('unit_price', 15, 2)->nullable()->change();
            $table->decimal('subtotal', 15, 2)->nullable()->change();

            // Add notes
            $table->text('notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'menu_name',
                'menu_category_type',
                'menu_unit',
                'notes',
            ]);

            $table->foreignId('menu_item_id')->constrained('menu_items')->onDelete('cascade')->change();
            $table->decimal('unit_price', 15, 2)->change();
            $table->decimal('subtotal', 15, 2)->change();
        });
    }
};
