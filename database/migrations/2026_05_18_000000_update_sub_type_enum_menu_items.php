<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update enum values for sub_type to new eceran taxonomy
        DB::statement("ALTER TABLE menu_items MODIFY COLUMN sub_type ENUM('paket_pass','paket_nasi_box','babi_adat') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // revert to previous enum values
        DB::statement("ALTER TABLE menu_items MODIFY COLUMN sub_type ENUM('saksang','panggang','sop_tulang','paket_pass') NULL");
    }
};
