<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
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
    // Halaman utama
    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
    Route::get('/inventory', fn() => Inertia::render('inventory'))->name('inventory');
    Route::get('/categories', fn() => Inertia::render('categories'))->name('categories');
    Route::get('/users', fn() => Inertia::render('users'))->name('user');
    Route::get('/activitylogs', fn() => Inertia::render('activitylogs'))->name('activity');


    // Profile Management
    // Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Inventory dan Category resource routes
    Route::resource('inventory', InventoryController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('users', UserController::class);
    Route::resource('activitylogs', ActivityLogController::class);

    // Role-based dashboards
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin-dashboard', fn() => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
    });

    Route::middleware('role:staff')->group(function () {
        Route::get('/staff-dashboard', fn() => Inertia::render('Staff/Dashboard'))->name('staff.dashboard');
    });

    Route::middleware('role:viewer')->group(function () {
        Route::get('/viewer-dashboard', fn() => Inertia::render('Viewer/Dashboard'))->name('viewer.dashboard');
    });
});

// Route tambahan (misal untuk pengaturan dan auth)
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
