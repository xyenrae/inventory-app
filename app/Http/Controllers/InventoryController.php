<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;
use Illuminate\Routing\Controller;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ItemsExport;
use Barryvdh\DomPDF\Facade\Pdf;


class InventoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
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
            'category' => 'sometimes|exists:categories,id',
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

        $query = Item::query()->with('category');

        // Filter out items with inactive categories
        $query->whereHas('category', function ($q) {
            $q->where('status', 'active');
        });

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->where('status', 'active');
                    });
            });
        }

        if ($category !== 'all') {
            $query->where('category_id', $category);
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
            'items' => $items->items(),
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
            'categories' => Category::where('status', 'active')->get()->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name
            ]),
            'can' => [
                'create' => $request->user()->can('create', Item::class),
                'edit' => Gate::forUser($request->user())->check('update', new Item()),
                'delete' => Gate::forUser($request->user())->check('delete', new Item()),
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Item::class);

        return Inertia::render('inventory', [
            'categories' => Category::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Item::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:In Stock,Low Stock,Out of Stock',
        ]);

        Item::create($validated);

        return redirect()->back()
            ->with('success', 'Item created successfully');
    }

    public function show(Item $inventory)
    {
        $this->authorize('view', $inventory);

        return response()->json($inventory->load('category'));
    }

    public function edit(Item $inventory)
    {
        $this->authorize('update', $inventory);

        return Inertia::render('inventory', [
            'item' => $inventory->load('category'),
            'categories' => Category::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Item $inventory)
    {
        $this->authorize('update', $inventory);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'required|string|in:In Stock,Low Stock,Out of Stock',
        ]);

        $inventory->update($validated);

        return redirect()->back()
            ->with('success', 'Item updated successfully');
    }

    public function destroy(Item $inventory)
    {
        $this->authorize('delete', $inventory);

        $inventory->delete();

        return redirect()->back()
            ->with('success', 'Item deleted successfully');
    }

    /**
     * Export items to Excel
     */
    public function exportExcel(Request $request)
    {
        $this->authorize('viewAny', Item::class);

        $validated = $this->validateExportRequest($request);
        $items = $this->getFilteredItems($validated);

        return Excel::download(new ItemsExport($items), 'inventory_items.xlsx');
    }

    /**
     * Export items to PDF
     */
    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Item::class);

        $validated = $this->validateExportRequest($request);
        $items = $this->getFilteredItems($validated);

        $pdf = PDF::loadView('exports.items-pdf', [
            'items' => $items,
            'generatedAt' => now()->format('F d, Y H:i:s'),
        ]);

        return $pdf->download('inventory_items.pdf');
    }

    /**
     * Validate export request parameters
     */
    private function validateExportRequest(Request $request)
    {
        return $request->validate([
            'search' => 'nullable|string|max:255',
            'category' => 'nullable|string',
            'status' => 'nullable|string',
            'minPrice' => 'nullable|string',
            'maxPrice' => 'nullable|string',
            'perPage' => 'nullable|integer|min:1|max:100',
        ]);
    }

    /**
     * Get filtered items based on request parameters
     */
    private function getFilteredItems($validated)
    {
        $search = $validated['search'] ?? '';
        $category = $validated['category'] ?? 'all';
        $status = $validated['status'] ?? 'all';
        $minPrice = $validated['minPrice'] ?? null;
        $maxPrice = $validated['maxPrice'] ?? null;

        $query = Item::query()->with('category');

        // Filter out items with inactive categories
        $query->whereHas('category', function ($q) {
            $q->where('status', 'active');
        });

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->where('status', 'active');
                    });
            });
        }

        if ($category !== 'all' && is_numeric($category)) {
            $query->where('category_id', $category);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if (!empty($minPrice)) {
            $query->where('price', '>=', (float) $minPrice);
        }

        if (!empty($maxPrice)) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        return $query->orderBy('updated_at', 'desc')->get();
    }
}
