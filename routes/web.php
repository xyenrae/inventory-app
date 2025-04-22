<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/inventory', function () {
        return Inertia::render('inventory');
    })->name('inventory');

    Route::get('/categories', function () {
        return Inertia::render('categories');
    })->name('categories');

    Route::get('/users', function () {
        return Inertia::render('users');
    })->name('users');

    Route::get('/logs', function () {
        return Inertia::render('activitylogs');
    })->name('logs');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
