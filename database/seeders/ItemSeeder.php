<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

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
            ['name' => 'Keyboard Keychron K2', 'category' => 'Electronics', 'quantity' => 12, 'price' => 89, 'status' => 'In Stock'],
            ['name' => 'Headset Jabra Evolve 40', 'category' => 'Electronics', 'quantity' => 6, 'price' => 130, 'status' => 'Low Stock'],

            // New items
            ['name' => 'ATK Pulpen Pilot G2', 'category' => 'Office Supplies', 'quantity' => 100, 'price' => 2, 'status' => 'In Stock'],
            ['name' => 'Buku Tulis A5', 'category' => 'Office Supplies', 'quantity' => 50, 'price' => 3, 'status' => 'In Stock'],
            ['name' => 'Map Folder Plastik', 'category' => 'Office Supplies', 'quantity' => 70, 'price' => 1, 'status' => 'In Stock'],
            ['name' => 'Stapler Kangaro', 'category' => 'Office Supplies', 'quantity' => 30, 'price' => 5, 'status' => 'In Stock'],
            ['name' => 'Kalkulator Casio', 'category' => 'Office Supplies', 'quantity' => 20, 'price' => 15, 'status' => 'Low Stock'],

            ['name' => 'Safety Helmet', 'category' => 'Safety Equipment', 'quantity' => 25, 'price' => 20, 'status' => 'In Stock'],
            ['name' => 'Safety Shoes Cheetah', 'category' => 'Safety Equipment', 'quantity' => 10, 'price' => 75, 'status' => 'In Stock'],
            ['name' => 'Safety Vest Orange', 'category' => 'Safety Equipment', 'quantity' => 40, 'price' => 10, 'status' => 'In Stock'],
            ['name' => 'Earplug 3M', 'category' => 'Safety Equipment', 'quantity' => 60, 'price' => 3, 'status' => 'In Stock'],
            ['name' => 'Fire Extinguisher APAR', 'category' => 'Safety Equipment', 'quantity' => 5, 'price' => 100, 'status' => 'Low Stock'],

            ['name' => 'Mobil Operasional Toyota Avanza', 'category' => 'Vehicles', 'quantity' => 2, 'price' => 20000, 'status' => 'In Stock'],
            ['name' => 'Motor Honda Beat', 'category' => 'Vehicles', 'quantity' => 3, 'price' => 1200, 'status' => 'Low Stock'],
            ['name' => 'Sepeda Lipat Polygon', 'category' => 'Vehicles', 'quantity' => 5, 'price' => 500, 'status' => 'In Stock'],
            ['name' => 'Truk Mitsubishi Canter', 'category' => 'Vehicles', 'quantity' => 1, 'price' => 30000, 'status' => 'Out of Stock'],
        ];

        foreach ($items as $item) {
            $category = Category::where('name', $item['category'])->first();

            if ($category) {
                $randomDate = Carbon::now()->subDays(rand(0, 6))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

                Item::create([
                    'name' => $item['name'],
                    'category_id' => $category->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'status' => $item['status'],
                    'created_at' => $randomDate,
                    'updated_at' => $randomDate,
                ]);
            }
        }
    }
}
