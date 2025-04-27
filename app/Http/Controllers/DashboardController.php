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
use Carbon\Carbon;

class DashboardController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        return Inertia::render('dashboard', [
            'stats' => $this->getStats(),
            'categoryDistribution' => $this->getCategoryDistribution(),
            'recentActivities' => $this->getRecentActivities(),
            'activityTrends' => $this->getActivityTrends(),
            'inventoryStatus' => $this->getInventoryStatus(),
            'can' => $this->getPermissions($request),
        ]);
    }

    private function getStats(): array
    {
        $userCount = User::count();
        $itemCount = Item::count();
        $categoryCount = Category::count();
        $lowStockItems = Item::where('status', 'Low Stock')->count();
        $outOfStockItems = Item::where('status', 'Out of Stock')->count();

        return [
            'users' => $userCount,
            'items' => $itemCount,
            'categories' => $categoryCount,
            'lowStockItems' => $lowStockItems,
            'outOfStockItems' => $outOfStockItems,
        ];
    }

    private function getCategoryDistribution()
    {
        return Item::select('categories.name', DB::raw('count(*) as count'))
            ->join('categories', 'items.category_id', '=', 'categories.id')
            ->groupBy('categories.name')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'count' => (int) $item->count,
                ];
            })
            ->values();
    }

    private function getRecentActivities()
    {
        return ActivityLog::with(['causer' => function ($query) {
            $query->withTrashed();
        }])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'log_name' => $activity->log_name,
                    'description' => $activity->description,
                    'created_at' => $activity->created_at->toDateTimeString(),
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                    ] : null,
                ];
            })
            ->values();
    }

    private function getActivityTrends(): array
    {
        $dates = [];
        for ($i = 0; $i < 90; $i++) {
            $dates[Carbon::now()->subDays($i)->format('Y-m-d')] = 0;
        }

        $activities = ActivityLog::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(90))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date')
            ->map(function ($item) {
                return $item->count;
            })
            ->toArray();

        $mergedData = array_merge($dates, $activities);
        ksort($mergedData);

        $last7Days = array_slice($mergedData, -7, 7, true);
        $last30Days = array_slice($mergedData, -30, 30, true);
        $last90Days = $mergedData;

        $formatData = function ($data) {
            return array_map(function ($date, $count) {
                return [
                    'date' => $date,
                    'count' => $count,
                ];
            }, array_keys($data), array_values($data));
        };

        return [
            '7d' => $formatData($last7Days),
            '30d' => $formatData($last30Days),
            '90d' => $formatData($last90Days),
            'all' => $formatData($mergedData),
        ];
    }

    private function getInventoryStatus(): array
    {
        $lowStockItems = Item::where('status', 'Low Stock')->count();
        $outOfStockItems = Item::where('status', 'Out of Stock')->count();
        $inStockItems = Item::where('status', 'In Stock')->count();

        return [
            ['name' => 'In Stock', 'value' => $inStockItems],
            ['name' => 'Low Stock', 'value' => $lowStockItems],
            ['name' => 'Out of Stock', 'value' => $outOfStockItems],
        ];
    }

    private function getPermissions(Request $request): array
    {
        return [
            'view_users' => $request->user()->can('viewAny', User::class),
            'view_items' => $request->user()->can('viewAny', Item::class),
            'view_categories' => $request->user()->can('viewAny', Category::class),
            'view_activity_logs' => $request->user()->can('viewAny', ActivityLog::class),
        ];
    }
}
