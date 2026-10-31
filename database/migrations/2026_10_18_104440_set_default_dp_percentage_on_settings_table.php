<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Checkout used to hardcode a 25% DP while the setting defaulted to 0,
     * so rows still at 0 never meant "no DP". Carry the 25% over now that
     * the setting drives the calculation.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('dp_percentage')->default(25)->change();
        });

        DB::table('settings')->where('dp_percentage', 0)->update(['dp_percentage' => 25]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('dp_percentage')->default(0)->change();
        });
    }
};
