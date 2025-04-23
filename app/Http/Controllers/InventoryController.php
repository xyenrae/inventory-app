<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class InventoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        // Hanya middleware auth, permission dikelola lewat policy
        $this->middleware('auth');
    }

    /**
     * Display a listing of the items.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Item::class);

        $validated = $request->validate([
            'perPage' => 'sometimes|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'category' => 'sometimes|string',
            'status' => 'sometimes|string',
            'minPrice' => 'sometimes|numeric|min:0',
            'maxPrice' => 'sometimes|numeric|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['perPage'] ?? 10;
        $search = $validated['search'] ?? '';
        $category = $validated['category'] ?? 'all';
        $status = $validated['status'] ?? 'all';
        $minPrice = $validated['minPrice'] ?? null;
        $maxPrice = $validated['maxPrice'] ?? null;

        $query = Item::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category !== 'all') {
            $query->where('category', $category);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if (!is_null($minPrice)) {
            $query->where('price', '>=', (float) $minPrice);
        }

        if (!is_null($maxPrice)) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        $items = $query->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('inventory', [
            'items' => $items->items(), // Access the items array
            'pagination' => [
                'current_page' => $items->currentPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'last_page' => $items->lastPage(),
                'from' => $items->firstItem() ?? 0,
                'to' => $items->lastItem() ?? 0,
                'links' => $items->linkCollection()->toArray()
            ],
            'filters' => $request->only(['search', 'category', 'status', 'minPrice', 'maxPrice', 'perPage']),
            'categories' => Item::distinct()->pluck('category'),
            'can' => [
                'create' => $request->user()->can('create', Item::class),
                'edit' => Gate::forUser($request->user())->check('update', new Item()),
                'delete' => Gate::forUser($request->user())->check('delete', new Item()),
            ],
        ]);
    }

    /**
     * Show the form for creating a new item.
     */
    public function create()
    {
        $this->authorize('create', Item::class);

        return Inertia::render('Inventory/Create');
    }

    /**
     * Store a newly created item in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Item::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:In Stock,Low Stock,Out of Stock',
        ]);

        Item::create($validated);

        return redirect()->route('inventory.index')
            ->with('success', 'Item created successfully');
    }

    /**
     * Display the specified item.
     */
    public function show(Item $item)
    {
        $this->authorize('view', $item);

        return response()->json($item);
    }

    /**
     * Show the form for editing the specified item.
     */
    public function edit(Item $item)
    {
        $this->authorize('update', $item);

        return Inertia::render('Inventory/Edit', [
            'item' => $item
        ]);
    }

    /**
     * Update the specified item in storage.
     */
    public function update(Request $request, Item $item)
    {
        $this->authorize('update', $item);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:In Stock,Low Stock,Out of Stock',
        ]);

        $item->update($validated);

        return redirect()->back()
            ->with('success', 'Item updated successfully');
    }

    /**
     * Remove the specified item from storage.
     */
    public function destroy(Item $item)
    {
        $this->authorize('delete', $item);

        $item->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Item deleted successfully');
    }
}
