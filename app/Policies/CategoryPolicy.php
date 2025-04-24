<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view categories');
    }

    public function view(User $user, Category $category): bool
    {
        return $user->hasPermissionTo('view categories');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create categories');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasPermissionTo('edit categories');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasPermissionTo('delete categories');
    }
}
