<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $randomDate = Carbon::now()->subDays(rand(0, 6))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            ActivityLog::create([
                'log_name' => 'item',
                'description' => 'Updated item',
                'subject_id' => 1,
                'subject_type' => \App\Models\Item::class,
                'causer_id' => 1,
                'causer_type' => \App\Models\User::class,
                'created_at' => $randomDate,
                'updated_at' => $randomDate,
            ]);
        }
    }
}
