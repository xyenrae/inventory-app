<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'description' => 'Devices, gadgets, and electronic accessories.',
                'status' => 'Active',
            ],
            [
                'name' => 'Furniture',
                'description' => 'Home and office furniture.',
                'status' => 'Active',
            ],
            [
                'name' => 'Office Supplies',
                'description' => 'Essentials for everyday office work.',
                'status' => 'Active',
            ],
            [
                'name' => 'Stationery',
                'description' => 'Writing, paper, and art supplies.',
                'status' => 'Active',
            ],
            [
                'name' => 'Tools',
                'description' => 'Hardware and tools for work.',
                'status' => 'Active',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
