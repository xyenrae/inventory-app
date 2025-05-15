<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class RoomController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the rooms.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Room::class);

        $validated = $request->validate([
            'perPage' => 'sometimes|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => 'sometimes|string',
            'page' => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['perPage'] ?? 10;
        $search = $validated['search'] ?? '';
        $status = $validated['status'] ?? 'all';

        $query = Room::query()->withCount('items');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $rooms = $query->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('rooms', [
            'rooms' => $rooms->items(),
            'pagination' => [
                'current_page' => $rooms->currentPage(),
                'per_page' => $rooms->perPage(),
                'total' => $rooms->total(),
                'last_page' => $rooms->lastPage(),
                'from' => $rooms->firstItem() ?? 0,
                'to' => $rooms->lastItem() ?? 0,
                'links' => $rooms->linkCollection()->toArray()
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'perPage' => (int)$perPage
            ],
            'can' => [
                'create' => $request->user()->can('create', Room::class),
                'edit' => Gate::forUser($request->user())->check('update', new Room()),
                'delete' => Gate::forUser($request->user())->check('delete', new Room()),
            ],
        ]);
    }

    /**
     * Show the form for creating a new room.
     */
    public function create()
    {
        $this->authorize('create', Room::class);

        return Inertia::render('rooms');
    }

    /**
     * Store a newly created room in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Room::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:rooms',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|string|in:active,inactive',
        ]);

        Room::create($validated);

        return redirect()->back()
            ->with('success', 'Room created successfully');
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room)
    {
        $this->authorize('view', $room);

        return response()->json($room);
    }

    /**
     * Show the form for editing the specified room.
     */
    public function edit(Room $room)
    {
        $this->authorize('update', $room);

        return Inertia::render('rooms', [
            'room' => $room
        ]);
    }

    /**
     * Update the specified room in storage.
     */
    public function update(Request $request, Room $room)
    {
        $this->authorize('update', $room);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:rooms,name,' . $room->id,
            'location' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|string|in:active,inactive',
        ]);

        $room->update($validated);

        return redirect()->back()
            ->with('success', 'Room updated successfully');
    }

    /**
     * Remove the specified room from storage.
     */
    public function destroy(Room $room)
    {
        $this->authorize('delete', $room);

        // Check if room is in use
        $itemCount = $room->items()->count();
        if ($itemCount > 0) {
            return back()->with('error', "Cannot delete room. It's associated with {$itemCount} items.");
        }

        $room->delete();

        return redirect()->back()
            ->with('success', 'Room deleted successfully');
    }

    /**
     * Get all active rooms (for dropdowns).
     */
    public function getActiveRooms()
    {
        $this->authorize('viewAny', Room::class);

        $rooms = Room::where('status', 'active')
            ->get(['id', 'name', 'location'])
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'location' => $room->location,
                    'display_name' => $room->name . ' (' . $room->location . ')'
                ];
            });

        return response()->json($rooms);
    }
}
