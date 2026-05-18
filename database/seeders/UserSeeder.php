<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@ringgitcatering.test'],
            [
                'name' => 'Ringgit Catering Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
        );

        User::updateOrCreate(
            ['email' => 'produksi@ringgitcatering.test'],
            [
                'name' => 'Ringgit Catering Produksi',
                'password' => Hash::make('password'),
                'role' => 'produksi',
            ],
        );

        User::updateOrCreate(
            ['email' => 'user@ringgitcatering.test'],
            [
                'name' => 'Ringgit Catering User',
                'password' => Hash::make('password'),
                'role' => 'user',
            ],
        );
    }
}
