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
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Item::class => ItemPolicy::class,
        Category::class => CategoryPolicy::class,
        User::class => UserPolicy::class,
        ActivityLog::class => ActivityPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}
