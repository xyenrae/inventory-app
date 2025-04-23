<?php

use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard dan halaman utama
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');
    Route::get('/categories', fn () => Inertia::render('categories'))->name('categories');
    Route::get('/users', fn () => Inertia::render('users'))->name('users');
    Route::get('/logs', fn () => Inertia::render('activitylogs'))->name('logs');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Inventory routes using policy
    Route::middleware(['auth'])->group(function () {
        Route::resource('inventory', InventoryController::class)->except(['show']);
        
        // Route show tetap tersedia untuk akses terpisah, misal dari API atau view detail
        Route::get('inventory/{item}', [InventoryController::class, 'show'])
            ->name('inventory.show')
            ->middleware('can:view,item');
    });

    // Role-based dashboards
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin-dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
    });

    Route::middleware('role:staff')->group(function () {
        Route::get('/staff-dashboard', fn () => Inertia::render('Staff/Dashboard'))->name('staff.dashboard');
    });

    Route::middleware('role:viewer')->group(function () {
        Route::get('/viewer-dashboard', fn () => Inertia::render('Viewer/Dashboard'))->name('viewer.dashboard');
    });
});

// Route tambahan
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
