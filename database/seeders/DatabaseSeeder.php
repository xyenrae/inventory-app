<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\ItemSeeder;
use Database\Seeders\ActivityLogSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            RoomSeeder::class,
            ItemSeeder::class,
            ActivityLogSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
