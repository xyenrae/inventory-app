<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $validated = $request->validate([
            'perPage' => 'sometimes|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'role' => 'sometimes|string',
            'page' => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['perPage'] ?? 10;
        $search = $validated['search'] ?? '';
        $role = $validated['role'] ?? 'all';

        $query = User::with('roles');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role !== 'all') {
            $query->whereHas('roles', fn($q) => $q->where('name', $role));
        }

        $users = $query->orderBy('updated_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('users', [
            'users' => $users->items(),
            'roles' => Role::all(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem() ?? 0,
                'to' => $users->lastItem() ?? 0,
                'links' => $users->linkCollection()->toArray(),
            ],
            'filters' => [
                'search' => $search,
                'role' => $role,
                'perPage' => (int)$perPage,
            ],
            'can' => [
                'create' => $request->user()->can('create', User::class),
                'edit' => $request->user()->can('update', User::class),
                'delete' => $request->user()->can('delete', User::class),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        $user->load('roles', 'permissions');

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|exists:roles,name',
        ];

        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8|confirmed';
        }

        $validated = $request->validate($rules);

        // Prevent current user from changing their own role
        if ($user->id === Auth::id() && !$user->hasRole($validated['role'])) {
            return redirect()->back()->with('error', 'You cannot change your own role.');
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $request->filled('password') ? Hash::make($validated['password']) : $user->password,
        ]);

        $user->syncRoles([$validated['role']]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        if (Auth::id() === $user->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->syncRoles([]);
        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
