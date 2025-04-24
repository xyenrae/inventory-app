<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Ambil semua ID kategori yang sudah ada di DB
        $categoryIds = Category::pluck('id')->toArray();

        $statuses = ['In Stock', 'Low Stock', 'Out of Stock'];

        for ($i = 0; $i < 100; $i++) {
            Item::create([
                'name' => $faker->words(3, true), // contoh: "Wireless Mouse Pro"
                'category_id' => $faker->randomElement($categoryIds),
                'quantity' => $faker->numberBetween(0, 100),
                'price' => $faker->randomFloat(2, 5, 1500), // harga antara 5 sampai 1500
                'status' => $faker->randomElement($statuses),
            ]);
        }
    }
}
