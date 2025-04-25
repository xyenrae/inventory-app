<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ActivityLog;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view activity');
    }

    public function view(User $user, ActivityLog $activity): bool
    {
        return $user->hasPermissionTo('view activity');
    }
}
