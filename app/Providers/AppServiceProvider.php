<?php

namespace App\Providers;

use App\Models\Item;
use App\Policies\ItemPolicy;
use App\Models\Category;
use App\Policies\CategoryPolicy;
use App\Models\User;
use App\Policies\UserPolicy;
use App\Models\ActivityLog;
use App\Policies\ActivityPolicy;
use App\Models\Room;
use App\Policies\RoomPolicy;
use App\Models\Transaction;
use App\Policies\TransactionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        Item::class => ItemPolicy::class,
        Category::class => CategoryPolicy::class,
        Room::class => RoomPolicy::class,
        User::class => UserPolicy::class,
        Transaction::class => TransactionPolicy::class,
        ActivityLog::class => ActivityPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}
