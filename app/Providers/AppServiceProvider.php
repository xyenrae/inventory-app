<?php

namespace App\Providers;

use App\Models\Item;
use App\Policies\ItemPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Item::class => ItemPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}