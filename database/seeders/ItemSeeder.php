<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['name' => 'Laptop Lenovo ThinkPad X1', 'category' => 'Electronics', 'quantity' => 10, 'price' => 1500, 'status' => 'In Stock'],
            ['name' => 'Printer Epson L3150', 'category' => 'Electronics', 'quantity' => 5, 'price' => 200, 'status' => 'Low Stock'],
            ['name' => 'Meja Kantor Kayu', 'category' => 'Furniture', 'quantity' => 15, 'price' => 100, 'status' => 'In Stock'],
            ['name' => 'Kursi Ergonomis', 'category' => 'Furniture', 'quantity' => 8, 'price' => 120, 'status' => 'Low Stock'],
            ['name' => 'Proyektor BenQ MX550', 'category' => 'Electronics', 'quantity' => 3, 'price' => 500, 'status' => 'Low Stock'],
            ['name' => 'AC Daikin 1PK', 'category' => 'Electronics', 'quantity' => 2, 'price' => 750, 'status' => 'Out of Stock'],
            ['name' => 'Lemari Arsip Besi', 'category' => 'Furniture', 'quantity' => 7, 'price' => 250, 'status' => 'In Stock'],
            ['name' => 'Mouse Logitech MX Master 3', 'category' => 'Electronics', 'quantity' => 20, 'price' => 99, 'status' => 'In Stock'],
            ['name' => 'Keyboard Mechanical Keychron K2', 'category' => 'Electronics', 'quantity' => 12, 'price' => 89, 'status' => 'In Stock'],
            ['name' => 'Headset Jabra Evolve 40', 'category' => 'Electronics', 'quantity' => 6, 'price' => 130, 'status' => 'Low Stock'],
        ];

        foreach ($items as $item) {
            $category = Category::where('name', $item['category'])->first();

            if ($category) {
                Item::create([
                    'name' => $item['name'],
                    'category_id' => $category->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'status' => $item['status'],
                ]);
            }
        }
    }
}
