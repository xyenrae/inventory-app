<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Transaction;

class TransactionPolicy
{
    /**
     * Determine whether the user can view any transactions.
     */
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('view transactions');
    }

    /**
     * Determine whether the user can view the transaction.
     */
    public function view(User $user, Transaction $transaction)
    {
        return $user->hasPermissionTo('view transactions');
    }

    /**
     * Determine whether the user can create transactions.
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('create transactions');
    }

    /**
     * Determine whether the user can update the transaction.
     */
    public function update(User $user, Transaction $transaction)
    {
        return $user->hasPermissionTo('edit transactions');
    }

    /**
     * Determine whether the user can delete the transaction.
     */
    public function delete(User $user, Transaction $transaction)
    {
        return $user->hasPermissionTo('delete transactions');
    }

    /**
     * Determine whether the user can restore the transaction.
     */
    public function restore(User $user, Transaction $transaction)
    {
        return $user->hasPermissionTo('edit transactions');
    }

    /**
     * Determine whether the user can permanently delete the transaction.
     */
    public function forceDelete(User $user, Transaction $transaction)
    {
        return $user->hasPermissionTo('delete transactions');
    }
}
