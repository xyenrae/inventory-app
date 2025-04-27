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
        return $user->can('view users');
    }

    /**
     * View a specific user.
     */
    public function view(User $user, User $model)
    {
        return $user->can('view users');
    }

    /**
     * Create a new user.
     */
    public function create(User $user)
    {
        return $user->can('create users');
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, User $model)
    {
        return $user->can('edit users');
    }

    /**
     * Delete a user.
     */
    public function delete(User $user, User $model)
    {
        return $user->can('delete users') && $user->id !== $model->id;
    }

    /**
     * General permission to update *any* user.
     */
    public function edit(User $user)
    {
        return $user->can('edit users');
    }

    /**
     * General permission to delete *any* user.
     */
    public function forceDelete(User $user)
    {
        return $user->can('delete users');
    }
}
