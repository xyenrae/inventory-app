<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Dashboard (manual route, bukan resource)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Resource untuk inventory, category, users, activitylogs
    Route::resource('inventory', InventoryController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('users', UserController::class);
    Route::resource('activitylogs', ActivityLogController::class);
});

// Route tambahan
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
