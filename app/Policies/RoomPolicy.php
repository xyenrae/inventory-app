<?php

namespace App\Policies;

use App\Models\Room;
use App\Models\User;

class RoomPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view rooms');
    }

    public function view(User $user, Room $Room): bool
    {
        return $user->hasPermissionTo('view rooms');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create rooms');
    }

    public function update(User $user, Room $Room): bool
    {
        return $user->hasPermissionTo('edit rooms');
    }

    public function delete(User $user, Room $Room): bool
    {
        return $user->hasPermissionTo('delete rooms');
    }
}
