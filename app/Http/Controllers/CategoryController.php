<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the categories.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        $validated = $request->validate([
            'perPage' => 'sometimes|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => 'sometimes|string',
            'page' => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['perPage'] ?? 10;
        $search = $validated['search'] ?? '';
        $status = $validated['status'] ?? 'all';

        $query = Category::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $categories = $query->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('categories', [
            'categories' => $categories->items(),
            'pagination' => [
                'current_page' => $categories->currentPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
                'last_page' => $categories->lastPage(),
                'from' => $categories->firstItem() ?? 0,
                'to' => $categories->lastItem() ?? 0,
                'links' => $categories->linkCollection()->toArray()
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'perPage' => (int)$perPage
            ],
            'can' => [
                'create' => $request->user()->can('create', Category::class),
                'edit' => Gate::forUser($request->user())->check('update', new Category()),
                'delete' => Gate::forUser($request->user())->check('delete', new Category()),
            ],
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        $this->authorize('create', Category::class);

        return Inertia::render('categories');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Category::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|string|in:Active,Inactive',
        ]);

        Category::create($validated);

        return redirect()->back()
            ->with('success', 'Category created successfully');
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        $this->authorize('view', $category);

        return response()->json($category);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category)
    {
        $this->authorize('update', $category);

        return Inertia::render('categories', [
            'category' => $category
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
            'status' => 'required|string|in:Active,Inactive',
        ]);

        $category->update($validated);

        return redirect()->back()
            ->with('success', 'Category updated successfully');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        // Check if category is in use
        $itemCount = $category->items()->count();
        if ($itemCount > 0) {
            return back()->with('error', "Cannot delete category. It's associated with {$itemCount} items.");
        }

        $category->delete();

        return redirect()->back()
            ->with('success', 'Category deleted successfully');
    }

    /**
     * Get all categories (for dropdowns).
     */
    public function getAll()
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::where('status', 'Active')->get(['id', 'name']);

        return response()->json($categories);
    }
}
