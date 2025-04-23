<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Item;

class ItemPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view items');
    }

    public function view(User $user, Item $item)
    {
        return $user->hasPermissionTo('view items');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('create items');
    }

    public function update(User $user, Item $item)
    {
        return $user->hasPermissionTo('edit items');
    }

    public function delete(User $user, Item $item)
    {
        return $user->hasPermissionTo('delete items');
    }
}