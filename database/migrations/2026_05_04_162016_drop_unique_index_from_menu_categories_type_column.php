<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_categories', function (Blueprint $table): void {
            $table->dropUnique('menu_categories_type_unique');
        });
    }

    public function down(): void
    {
        Schema::table('menu_categories', function (Blueprint $table): void {
            $table->unique('type');
        });
    }
};
