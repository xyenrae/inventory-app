<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Item;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $items = Item::all();
        $users = User::with('roles')->get();
        $rooms = Room::all();

        if ($items->isEmpty() || $rooms->count() < 2) {
            $this->command->warn('Seeder dibatalkan: pastikan ada item dan minimal 2 room.');
            return;
        }

        // Filter hanya user dengan role admin atau staff
        $eligibleUsers = $users->filter(function ($user) {
            return $user->hasRole('admin') || $user->hasRole('staff');
        });

        if ($eligibleUsers->isEmpty()) {
            $this->command->warn('Seeder dibatalkan: tidak ada user dengan role admin atau staff.');
            return;
        }

        foreach (range(1, 10) as $i) {
            $item = $items->random();
            $user = $eligibleUsers->random();
            $type = collect(['in', 'out', 'transfer'])->random();
            $quantity = rand(1, 20);
            $fromRoom = $rooms->random();
            $toRoom = $rooms->where('id', '!=', $fromRoom->id)->random();

            $from_room_id = null;
            $to_room_id = null;

            if ($type === 'in') {
                $to_room_id = $toRoom->id;
            } elseif ($type === 'out') {
                $from_room_id = $fromRoom->id;
            } elseif ($type === 'transfer') {
                $from_room_id = $fromRoom->id;
                $to_room_id = $toRoom->id;
            }

            Transaction::create([
                'item_id' => $item->id,
                'user_id' => $user->id,
                'type' => $type,
                'quantity' => $quantity,
                'from_room_id' => $from_room_id,
                'to_room_id' => $to_room_id,
                'transaction_date' => Carbon::now()->subDays(rand(0, 30)),
            ]);
        }
    }
}
