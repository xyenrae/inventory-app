<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Category;
use App\Models\Room;
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
            ['name' => 'Laptop Lenovo ThinkPad X1', 'category' => 'Electronics', 'room' => 'IT Department', 'quantity' => 10, 'price' => 22500000, 'status' => 'In Stock'],
            ['name' => 'Printer Epson L3150', 'category' => 'Electronics', 'room' => 'Main Office', 'quantity' => 5, 'price' => 3000000, 'status' => 'Low Stock'],
            ['name' => 'Meja Kantor Kayu', 'category' => 'Furniture', 'room' => 'Main Office', 'quantity' => 15, 'price' => 1500000, 'status' => 'In Stock'],
            ['name' => 'Kursi Ergonomis', 'category' => 'Furniture', 'room' => 'Main Office', 'quantity' => 8, 'price' => 1800000, 'status' => 'Low Stock'],
            ['name' => 'Proyektor BenQ MX550', 'category' => 'Electronics', 'room' => 'Meeting Room A', 'quantity' => 3, 'price' => 7500000, 'status' => 'Low Stock'],
            ['name' => 'AC Daikin 1PK', 'category' => 'Electronics', 'room' => 'Server Room', 'quantity' => 2, 'price' => 11250000, 'status' => 'Out of Stock'],
            ['name' => 'Lemari Arsip Besi', 'category' => 'Furniture', 'room' => 'Storage Room A', 'quantity' => 7, 'price' => 3750000, 'status' => 'In Stock'],
            ['name' => 'Mouse Logitech MX Master 3', 'category' => 'Electronics', 'room' => 'IT Department', 'quantity' => 20, 'price' => 1500000, 'status' => 'In Stock'],
            ['name' => 'Keyboard Keychron K2', 'category' => 'Electronics', 'room' => 'IT Department', 'quantity' => 12, 'price' => 1350000, 'status' => 'In Stock'],
            ['name' => 'Headset Jabra Evolve 40', 'category' => 'Electronics', 'room' => 'IT Department', 'quantity' => 6, 'price' => 1950000, 'status' => 'Low Stock'],

            // New items
            ['name' => 'ATK Pulpen Pilot G2', 'category' => 'Office Supplies', 'room' => 'Main Office', 'quantity' => 100, 'price' => 3000, 'status' => 'In Stock'],
            ['name' => 'Buku Tulis A5', 'category' => 'Office Supplies', 'room' => 'Main Office', 'quantity' => 50, 'price' => 4500, 'status' => 'In Stock'],
            ['name' => 'Map Folder Plastik', 'category' => 'Office Supplies', 'room' => 'Storage Room B', 'quantity' => 70, 'price' => 1500, 'status' => 'In Stock'],
            ['name' => 'Stapler Kangaro', 'category' => 'Office Supplies', 'room' => 'Main Office', 'quantity' => 30, 'price' => 7500, 'status' => 'In Stock'],
            ['name' => 'Kalkulator Casio', 'category' => 'Office Supplies', 'room' => 'Finance Department', 'quantity' => 20, 'price' => 225000, 'status' => 'Low Stock'],

            ['name' => 'Safety Helmet', 'category' => 'Safety Equipment', 'room' => 'Storage Room A', 'quantity' => 25, 'price' => 300000, 'status' => 'In Stock'],
            ['name' => 'Safety Shoes Cheetah', 'category' => 'Safety Equipment', 'room' => 'Storage Room A', 'quantity' => 10, 'price' => 1125000, 'status' => 'In Stock'],
            ['name' => 'Safety Vest Orange', 'category' => 'Safety Equipment', 'room' => 'Storage Room A', 'quantity' => 40, 'price' => 150000, 'status' => 'In Stock'],
            ['name' => 'Earplug 3M', 'category' => 'Safety Equipment', 'room' => 'Storage Room A', 'quantity' => 60, 'price' => 45000, 'status' => 'In Stock'],
            ['name' => 'Fire Extinguisher APAR', 'category' => 'Safety Equipment', 'room' => 'Main Office', 'quantity' => 5, 'price' => 1500000, 'status' => 'Low Stock'],

            ['name' => 'Mobil Operasional Toyota Avanza', 'category' => 'Vehicles', 'room' => null, 'quantity' => 2, 'price' => 300000000, 'status' => 'In Stock'],
            ['name' => 'Motor Honda Beat', 'category' => 'Vehicles', 'room' => null, 'quantity' => 3, 'price' => 18000000, 'status' => 'Low Stock'],
            ['name' => 'Sepeda Lipat Polygon', 'category' => 'Vehicles', 'room' => 'Storage Room B', 'quantity' => 5, 'price' => 7500000, 'status' => 'In Stock'],
            ['name' => 'Truk Mitsubishi Canter', 'category' => 'Vehicles', 'room' => null, 'quantity' => 1, 'price' => 450000000, 'status' => 'Out of Stock'],
        ];

        foreach ($items as $item) {
            $category = Category::where('name', $item['category'])->first();

            // Find the room or set to null if not specified
            $room = null;
            if (!empty($item['room'])) {
                $room = Room::where('name', $item['room'])->first();
            }

            if ($category) {
                $randomDate = Carbon::now()->subDays(rand(0, 6))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

                Item::create([
                    'name' => $item['name'],
                    'category_id' => $category->id,
                    'room_id' => $room ? $room->id : null,
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
