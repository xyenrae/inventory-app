<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Item;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;

class DashboardController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        // Get counts
        $userCount = User::count();
        $itemCount = Item::count();
        $categoryCount = Category::count();

        // Get low stock items
        $lowStockItems = Item::where('status', 'Low Stock')->count();
        $outOfStockItems = Item::where('status', 'Out of Stock')->count();

        // Get category distribution
        $categoryDistribution = Item::select('categories.name', DB::raw('count(*) as count'))
            ->join('categories', 'items.category_id', '=', 'categories.id')
            ->groupBy('categories.name')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        // Get recent activities
        $recentActivities = ActivityLog::with(['causer' => function ($query) {
            $query->withTrashed();
        }])
            ->latest()
            ->limit(5)
            ->get();

        // Get activity trends (last 7 days)
        $activityTrends = ActivityLog::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count
                ];
            });

        // Prepare data for inventory status chart
        $inventoryStatus = [
            ['name' => 'In Stock', 'value' => Item::where('status', 'In Stock')->count()],
            ['name' => 'Low Stock', 'value' => $lowStockItems],
            ['name' => 'Out of Stock', 'value' => $outOfStockItems],
        ];

        return Inertia::render('dashboard', [
            'stats' => [
                'users' => $userCount,
                'items' => $itemCount,
                'categories' => $categoryCount,
                'lowStockItems' => $lowStockItems,
                'outOfStockItems' => $outOfStockItems,
            ],
            'categoryDistribution' => $categoryDistribution,
            'recentActivities' => $recentActivities,
            'activityTrends' => $activityTrends,
            'inventoryStatus' => $inventoryStatus,
            'can' => [
                'view_users' => $request->user()->can('viewAny', User::class),
                'view_items' => $request->user()->can('viewAny', Item::class),
                'view_categories' => $request->user()->can('viewAny', Category::class),
                'view_activity_logs' => $request->user()->can('viewAny', ActivityLog::class),
            ],
        ]);
    }
}
