<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->decimal('babi_mentah_price', 12, 2)->nullable()->after('sub_type');
            $table->decimal('babi_matang_price', 12, 2)->nullable()->after('babi_mentah_price');
        });
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->dropColumn(['babi_mentah_price', 'babi_matang_price']);
        });
    }
};
