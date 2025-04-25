<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\ActivityLog;

use Illuminate\Routing\Controller;

class ActivityLogController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the activity logs.
     */
    public function index(Request $request)
    {

        $this->authorize('viewAny', ActivityLog::class);

        $validated = $request->validate([
            'perPage' => 'sometimes|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'log_name' => 'sometimes|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'causer_id' => 'sometimes|exists:users,id',
            'page' => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['perPage'] ?? 10;
        $search = $validated['search'] ?? '';
        $logName = $validated['log_name'] ?? 'all';
        $startDate = $validated['start_date'] ?? '';
        $endDate = $validated['end_date'] ?? '';
        $causerId = $validated['causer_id'] ?? 'all';

        $query = ActivityLog::with(['causer' => function ($query) {
            $query->withTrashed();
        }])->latest();

        // Search filter
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('properties', 'like', "%{$search}%");
            });
        }

        // Log name filter
        if ($logName !== 'all') {
            $query->where('log_name', $logName);
        }

        // Date range filter
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Causer filter
        if ($causerId !== 'all') {
            $query->where('causer_id', $causerId);
        }

        $activityLogs = $query->paginate($perPage);

        // Get unique log names for filter options
        $logNames = ActivityLog::distinct('log_name')->pluck('log_name');

        // Get users who have activity logs
        $users = User::whereHas('activities')->get(['id', 'name']);

        return Inertia::render('activitylogs', [
            'activity_logs' => $activityLogs->items(),
            'pagination' => [
                'current_page' => $activityLogs->currentPage(),
                'per_page' => $activityLogs->perPage(),
                'total' => $activityLogs->total(),
                'last_page' => $activityLogs->lastPage(),
                'from' => $activityLogs->firstItem() ?? 0,
                'to' => $activityLogs->lastItem() ?? 0,
                'links' => $activityLogs->linkCollection()->toArray()
            ],
            'filters' => [
                'search' => $search,
                'log_name' => $logName,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'causer_id' => $causerId,
                'perPage' => (int)$perPage
            ],
            'log_names' => $logNames,
            'users' => $users,
            'can' => [
                'view_activity_logs' => Gate::check('viewAny', ActivityLog::class),
            ],
        ]);
    }

    /**
     * Display the specified activity log.
     */
    public function show(ActivityLog $activity)
    {
        $this->authorize('view', $activity);

        $activity->load(['causer' => function ($query) {
            $query->withTrashed();
        }]);

        return response()->json([
            'log' => $activity,
            'properties' => $activity->properties,
            'causer' => $activity->causer
        ]);
    }
}
