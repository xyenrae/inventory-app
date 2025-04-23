<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Buat permissions
        $permissions = [
            'view items',
            'create items',
            'edit items',
            'delete items',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Role Admin
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo($permissions);

        // Role Staff
        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $staffRole->givePermissionTo(['view items', 'create items', 'edit items']);

        // Role Viewer
        $viewerRole = Role::firstOrCreate(['name' => 'viewer']);
        $viewerRole->givePermissionTo('view items');

        // Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole($adminRole);

        // Staff User
        $staff = User::firstOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('password'),
            ]
        );
        $staff->assignRole($staffRole);

        // Viewer User
        $viewer = User::firstOrCreate(
            ['email' => 'viewer@example.com'],
            [
                'name' => 'Viewer User',
                'password' => Hash::make('password'),
            ]
        );
        $viewer->assignRole($viewerRole);
    }
}
