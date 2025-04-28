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
        $this->createPermissions();
        $this->createRolesWithPermissions();
        $this->createUsers();
    }

    protected function createPermissions(): void
    {
        $permissions = [
            // Items
            'view items',
            'create items',
            'edit items',
            'delete items',

            // Categories
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',

            // Users
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Activity Logs
            'view activity',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }

    protected function createRolesWithPermissions(): void
    {
        // Admin gets all permissions
        $adminPermissions = Permission::all();
        Role::firstOrCreate(['name' => 'admin'])
            ->syncPermissions($adminPermissions);

        // Staff: CRUD for items & categories, but no access to users
        $staffPermissions = [
            // Items
            'view items',
            'create items',
            'edit items',

            // Categories
            'view categories',
            'create categories',
            'edit categories',
        ];
        Role::firstOrCreate(['name' => 'staff'])
            ->syncPermissions($staffPermissions);

        // Viewer: read-only access to items
        $viewerPermissions = [
            'view items',
            'view categories',
        ];
        Role::firstOrCreate(['name' => 'viewer'])
            ->syncPermissions($viewerPermissions);
    }

    protected function createUsers(): void
    {
        $this->createUser('Admin User', 'admin@example.com', 'admin');
        $this->createUser('Staff User', 'staff@example.com', 'staff');
        $this->createUser('Viewer User', 'viewer@example.com', 'viewer');
    }

    protected function createUser(string $name, string $email, string $role): void
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
            ]
        );

        $user->syncRoles([$role]);
    }
}
