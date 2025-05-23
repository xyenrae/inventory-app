<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Landing page
Route::get('/', function () {
    return Inertia::render('auth/login', [
        'canResetPassword' => true,
        'status' => session('status'),
    ]);
})->name('home');

// Login page
Route::get('/login', function () {
    return Inertia::render('auth/login', [
        'canResetPassword' => true,
        'status' => session('status'),
    ]);
})->name('login');

// Register page
Route::get('/register', function () {
    return Inertia::render('auth/register');
})->name('register');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/inventory/export/excel', [InventoryController::class, 'exportExcel'])->name('inventory.export.excel');
    Route::get('/inventory/export/pdf', [InventoryController::class, 'exportPdf'])->name('inventory.export.pdf');

    Route::post('/transactions/stock-in', [TransactionController::class, 'stockIn'])->name('transactions.stockIn');
    Route::post('/transactions/stock-out', [TransactionController::class, 'stockOut'])->name('transactions.stockOut');
    Route::post('/transactions/transfer', [TransactionController::class, 'transfer'])->name('transactions.transfer');

    Route::get('/transactions/export/excel', [TransactionController::class, 'exportExcel'])
        ->name('transactions.export.excel');

    Route::get('/transactions/export/pdf', [TransactionController::class, 'exportPdf'])
        ->name('transactions.export.pdf');

    // Resourceful routes
    Route::resource('inventory', InventoryController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('transactions', TransactionController::class);
    Route::resource('rooms', RoomController::class);
    Route::resource('users', UserController::class);
    Route::resource('activitylogs', ActivityLogController::class);
});

// Tambahan
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
