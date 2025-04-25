<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Grant all permissions to admin (optional).
     */
    public function before(User $user, string $ability)
    {
        if ($user->hasRole('admin')) {
            return true;
        }
    }

    /**
     * Display all users.
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view users');
    }

    /**
     * View a specific user.
     */
    public function view(User $user, User $model)
    {
        return $user->hasPermissionTo('view users');
    }

    /**
     * Create a new user.
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('create users');
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, User $model)
    {
        return $user->hasPermissionTo('edit users');
    }

    /**
     * Delete a user (not themselves).
     */
    public function delete(User $user, User $model)
    {
        return $user->hasPermissionTo('delete users') && $user->id !== $model->id;
    }
}
