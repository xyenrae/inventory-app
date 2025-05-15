<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            ['name' => 'Main Office', 'location' => 'Floor 1', 'description' => 'Main office area', 'status' => 'Active'],
            ['name' => 'Meeting Room A', 'location' => 'Floor 1', 'description' => 'Meeting room with projector', 'status' => 'Active'],
            ['name' => 'Meeting Room B', 'location' => 'Floor 1', 'description' => 'Small meeting room', 'status' => 'Active'],
            ['name' => 'IT Department', 'location' => 'Floor 2', 'description' => 'IT staff workspace', 'status' => 'Active'],
            ['name' => 'Finance Department', 'location' => 'Floor 2', 'description' => 'Finance team workspace', 'status' => 'Active'],
            ['name' => 'HR Department', 'location' => 'Floor 2', 'description' => 'Human resources workspace', 'status' => 'Active'],
            ['name' => 'Server Room', 'location' => 'Floor 2', 'description' => 'Server and network equipment', 'status' => 'Active'],
            ['name' => 'Storage Room A', 'location' => 'Basement', 'description' => 'General storage area', 'status' => 'Active'],
            ['name' => 'Storage Room B', 'location' => 'Basement', 'description' => 'Archive storage', 'status' => 'Active'],
            ['name' => 'Pantry', 'location' => 'Floor 1', 'description' => 'Kitchen and break area', 'status' => 'Active'],
        ];

        foreach ($rooms as $room) {
            $randomDate = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            Room::create([
                'name' => $room['name'],
                'location' => $room['location'],
                'description' => $room['description'],
                'status' => $room['status'],
                'created_at' => $randomDate,
                'updated_at' => $randomDate,
            ]);
        }
    }
}
