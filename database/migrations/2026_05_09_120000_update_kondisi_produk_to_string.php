<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Convert enum to varchar on carts (nullable)
        if (Schema::hasTable('carts')) {
            DB::statement('ALTER TABLE carts MODIFY kondisi_produk VARCHAR(20) NULL');
        }

        // Convert enum to varchar on order_items (not null)
        if (Schema::hasTable('order_items')) {
            DB::statement('ALTER TABLE order_items MODIFY kondisi_produk VARCHAR(20) NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Recreate the original enum for carts and order_items.
        // NOTE: Downgrading enums can be destructive if values outside ['mentah','mateng'] exist.
        if (Schema::hasTable('carts')) {
            DB::statement("ALTER TABLE carts MODIFY kondisi_produk ENUM('mentah','mateng') NOT NULL");
        }

        if (Schema::hasTable('order_items')) {
            DB::statement("ALTER TABLE order_items MODIFY kondisi_produk ENUM('mentah','mateng') NOT NULL");
        }
    }
};
