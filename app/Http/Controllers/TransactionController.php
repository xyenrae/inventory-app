<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Room;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TransactionsExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Routing\Controller;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display a listing of the transactions.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Transaction::class);

        $validated = $request->validate([
            'perPage' => 'sometimes|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'type' => 'sometimes|string|in:in,out,transfer,all',
            'userType' => 'sometimes|string|in:all,admin,staff',
            'item' => 'sometimes|exists:items,id',
            'fromRoom' => 'sometimes|exists:rooms,id',
            'toRoom' => 'sometimes|exists:rooms,id',
            'dateFrom' => 'nullable|date',
            'dateTo' => 'nullable|date',
            'page' => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['perPage'] ?? 10;
        $search = $validated['search'] ?? '';
        $type = $validated['type'] ?? 'all';
        $userType = $validated['userType'] ?? 'all';
        $item = $validated['item'] ?? 'all';
        $fromRoom = $validated['fromRoom'] ?? 'all';
        $toRoom = $validated['toRoom'] ?? 'all';
        $dateFrom = $validated['dateFrom'] ?? null;
        $dateTo = $validated['dateTo'] ?? null;

        $query = Transaction::query()
            ->with(['item', 'item.category', 'fromRoom', 'toRoom', 'user']);

        if (!empty($search)) {
            $query->whereHas('item', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($type !== 'all') {
            if ($type === 'transfer') {
                $query->where('type', 'transfer')
                    ->whereNotNull('from_room_id')
                    ->whereNotNull('to_room_id');
            } else {
                $query->where('type', $type);
            }
        }

        if ($userType !== 'all') {
            $query->whereHas('user.roles', function ($q) use ($userType) {
                $q->where('name', $userType);
            });
        }

        if ($item !== 'all') {
            $query->where('item_id', $item);
        }

        if ($fromRoom !== 'all') {
            $query->where('from_room_id', $fromRoom);
        }

        if ($toRoom !== 'all') {
            $query->where('to_room_id', $toRoom);
        }

        if ($dateFrom) {
            $query->whereDate('transaction_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('transaction_date', '<=', $dateTo);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('transactions', [
            'transactions' => $transactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'item' => [
                        'id' => $transaction->item->id,
                        'name' => $transaction->item->name,
                        'category' => $transaction->item->category ? [
                            'id' => $transaction->item->category->id,
                            'name' => $transaction->item->category->name,
                        ] : null,
                    ],
                    'quantity' => $transaction->quantity,
                    'fromRoom' => $transaction->fromRoom ? [
                        'id' => $transaction->fromRoom->id,
                        'name' => $transaction->fromRoom->name,
                        'location' => $transaction->fromRoom->location,
                    ] : null,
                    'toRoom' => $transaction->toRoom ? [
                        'id' => $transaction->toRoom->id,
                        'name' => $transaction->toRoom->name,
                        'location' => $transaction->toRoom->location,
                    ] : null,
                    'transaction_date' => $transaction->transaction_date,
                    'user' => [
                        'id' => $transaction->user->id,
                        'name' => $transaction->user->name,
                    ]
                ];
            }),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'last_page' => $transactions->lastPage(),
                'from' => $transactions->firstItem() ?? 0,
                'to' => $transactions->lastItem() ?? 0,
                'links' => $transactions->linkCollection()->toArray()
            ],
            'filters' => [
                'search' => $search,
                'type' => $type,
                'userType' => $userType,
                'item' => $item,
                'fromRoom' => $fromRoom,
                'toRoom' => $toRoom,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'perPage' => $perPage,
            ],
            'items' => Item::with(['category', 'room'])
                ->whereHas('category', function ($q) {
                    $q->where('status', 'active');
                })
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category ? $item->category->name : 'Unknown',
                    'current_quantity' => $item->quantity,
                    'current_room' => $item->room ? [
                        'id' => $item->room->id,
                        'name' => $item->room->name,
                        'location' => $item->room->location,
                        'display_name' => $item->room->name . ' (' . $item->room->location . ')',
                        'current_quantity' => $item->quantity,
                    ] : null,
                ]),

            'rooms' => Room::where('status', 'active')->get()->map(fn($room) => [
                'id' => $room->id,
                'name' => $room->name,
                'location' => $room->location,
                'display_name' => $room->name . ' (' . $room->location . ')'
            ]),
            'can' => [
                'create' => $request->user()->can('create', Transaction::class),
                'edit' => Gate::forUser($request->user())->check('update', new Transaction()),
                'delete' => Gate::forUser($request->user())->check('delete', new Transaction()),
            ],
        ]);
    }

    /**
     * Show the form for creating a new transaction.
     */
    public function create()
    {
        $this->authorize('create', Transaction::class);

        return Inertia::render('transactions/create', [
            'items' => Item::whereHas('category', function ($q) {
                $q->where('status', 'active');
            })->get()->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category ? $item->category->name : 'Unknown',
                'current_quantity' => $item->quantity,
                'current_room' => $item->room ? [
                    'id' => $item->room->id,
                    'name' => $item->room->name,
                    'location' => $item->room->location
                ] : null
            ]),
            'rooms' => Room::where('status', 'active')->get()->map(fn($room) => [
                'id' => $room->id,
                'name' => $room->name,
                'location' => $room->location,
                'display_name' => $room->name . ' (' . $room->location . ')'
            ]),
        ]);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'type' => 'required|string|in:in,out',
            'quantity' => 'required|integer|min:1',
            'from_room_id' => 'nullable|exists:rooms,id',
            'to_room_id' => 'nullable|exists:rooms,id',
            'transaction_date' => 'required|date',
        ]);

        // Additional validation based on transaction type
        $item = Item::findOrFail($validated['item_id']);

        if ($validated['type'] === 'out' && $validated['quantity'] > $item->quantity) {
            return redirect()->back()
                ->withErrors(['quantity' => 'Insufficient quantity available for this item.'])
                ->withInput();
        }

        if ($validated['type'] === 'out' && empty($validated['from_room_id'])) {
            $validated['from_room_id'] = $item->room_id;
        }

        // Wrap database operations in a transaction
        DB::beginTransaction();
        try {
            // Create the transaction record
            $transaction = new Transaction($validated);
            $transaction->user_id = Auth::id();
            $transaction->save();

            // Update the item quantity
            if ($validated['type'] === 'in') {
                $item->quantity += $validated['quantity'];

                // If to_room_id is provided, update the item's room
                if (!empty($validated['to_room_id'])) {
                    $item->room_id = $validated['to_room_id'];
                }
            } else { // 'out'
                $item->quantity -= $validated['quantity'];

                // Update item status based on new quantity
                if ($item->quantity <= 0) {
                    $item->status = 'Out of Stock';
                } elseif ($item->quantity <= 5) { // Assume 5 is the threshold for low stock
                    $item->status = 'Low Stock';
                }
            }

            $item->save();

            DB::commit();

            return redirect()->route('transactions.index')
                ->with('success', 'Transaction recorded successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to record transaction: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);

        return response()->json($transaction->load(['item', 'item.category', 'fromRoom', 'toRoom', 'user']));
    }

    /**
     * Show the form for editing the specified transaction.
     */
    public function edit(Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        return Inertia::render('transactions/edit', [
            'transaction' => $transaction->load(['item', 'fromRoom', 'toRoom']),
            'items' => Item::whereHas('category', function ($q) {
                $q->where('status', 'active');
            })->get()->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category ? $item->category->name : 'Unknown',
                'current_quantity' => $item->quantity,
                'current_room' => $item->room ? [
                    'id' => $item->room->id,
                    'name' => $item->room->name,
                    'location' => $item->room->location
                ] : null
            ]),
            'rooms' => Room::where('status', 'active')->get()->map(fn($room) => [
                'id' => $room->id,
                'name' => $room->name,
                'location' => $room->location,
                'display_name' => $room->name . ' (' . $room->location . ')'
            ]),
        ]);
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        $validated = $request->validate([
            'transaction_date' => 'required|date',
        ]);

        // We only allow updating metadata, not the core transaction details
        // that would affect inventory quantities
        $transaction->update($validated);

        return redirect()->back()
            ->with('success', 'Transaction updated successfully');
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);

        // For data integrity, we soft delete transactions instead of hard deleting
        $transaction->delete();

        return redirect()->back()
            ->with('success', 'Transaction deleted successfully');
    }

    /**
     * Export transactions to Excel
     */
    public function exportExcel(Request $request)
    {
        $this->authorize('viewAny', Transaction::class);

        $validated = $this->validateExportRequest($request);
        $transactions = $this->getFilteredTransactions($validated);

        return Excel::download(new TransactionsExport($transactions), 'transactions.xlsx');
    }

    /**
     * Export transactions to PDF
     */
    public function exportPdf(Request $request)
    {
        $this->authorize('viewAny', Transaction::class);

        $validated = $this->validateExportRequest($request);
        $transactions = $this->getFilteredTransactions($validated);

        $pdf = PDF::loadView('exports.transactions-pdf', [
            'transactions' => $transactions,
            'generatedAt' => now()->format('F d, Y H:i:s'),
        ]);

        return $pdf->download('transactions.pdf');
    }

    /**
     * Process a stock-in transaction (item entering inventory).
     */
    public function stockIn(Request $request)
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'to_room_id' => 'required|exists:rooms,id',
            'transaction_date' => 'required|date',
        ]);

        // Prepare transaction data
        $transactionData = [
            'item_id' => $validated['item_id'],
            'type' => 'in',
            'quantity' => $validated['quantity'],
            'to_room_id' => $validated['to_room_id'],
            'transaction_date' => $validated['transaction_date'],
            'user_id' => Auth::id(),
        ];

        // Process within a database transaction
        DB::beginTransaction();
        try {
            // Create transaction record
            $transaction = Transaction::create($transactionData);

            // Update item quantity and location
            $item = Item::findOrFail($validated['item_id']);
            $item->quantity += $validated['quantity'];
            $item->room_id = $validated['to_room_id'];

            // Update status based on new quantity
            if ($item->quantity > 5) {
                $item->status = 'In Stock';
            } elseif ($item->quantity > 0) {
                $item->status = 'Low Stock';
            }

            $item->save();

            DB::commit();

            return redirect()->route('transactions.index')
                ->with('success', 'Stock-in transaction recorded successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to process stock-in: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Process a stock-out transaction (item leaving inventory).
     */
    public function stockOut(Request $request)
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'from_room_id' => 'required|exists:rooms,id',
            'transaction_date' => 'required|date',
        ]);

        // Get the item
        $item = Item::findOrFail($validated['item_id']);

        // Check if item is in the specified room
        if ($item->room_id != $validated['from_room_id']) {
            return redirect()->back()
                ->withErrors(['from_room_id' => 'The item is not currently in the selected room.'])
                ->withInput();
        }

        // Check if sufficient quantity exists
        if ($item->quantity < $validated['quantity']) {
            return redirect()->back()
                ->withErrors(['quantity' => 'Insufficient quantity available for this item.'])
                ->withInput();
        }

        // Prepare transaction data
        $transactionData = [
            'item_id' => $validated['item_id'],
            'type' => 'out',
            'quantity' => $validated['quantity'],
            'from_room_id' => $validated['from_room_id'],
            'transaction_date' => $validated['transaction_date'],
            'user_id' => Auth::id(),
        ];

        // Process within a database transaction
        DB::beginTransaction();
        try {
            // Create transaction record
            $transaction = Transaction::create($transactionData);

            // Update item quantity
            $item->quantity -= $validated['quantity'];

            // Update status based on new quantity
            if ($item->quantity <= 0) {
                $item->status = 'Out of Stock';
            } elseif ($item->quantity <= 5) {
                $item->status = 'Low Stock';
            }

            $item->save();

            DB::commit();

            return redirect()->route('transactions.index')
                ->with('success', 'Stock-out transaction recorded successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to process stock-out: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Process an item transfer between rooms.
     */
    public function transfer(Request $request)
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'from_room_id' => 'required|exists:rooms,id',
            'to_room_id' => 'required|exists:rooms,id|different:from_room_id',
            'transaction_date' => 'required|date',
        ]);

        // Get the item
        $item = Item::findOrFail($validated['item_id']);

        // Check if item is in the specified source room
        if ($item->room_id != $validated['from_room_id']) {
            return redirect()->back()
                ->withErrors(['from_room_id' => 'The item is not currently in the selected room.'])
                ->withInput();
        }

        // Check if sufficient quantity exists for transfer
        if ($item->quantity < $validated['quantity']) {
            return redirect()->back()
                ->withErrors(['quantity' => 'Insufficient quantity available for transfer.'])
                ->withInput();
        }

        // Prepare transaction data
        $transactionData = [
            'item_id' => $validated['item_id'],
            'type' => 'out', // Transfer is recorded as an 'out' transaction
            'quantity' => $validated['quantity'],
            'from_room_id' => $validated['from_room_id'],
            'to_room_id' => $validated['to_room_id'],
            'transaction_date' => $validated['transaction_date'],
            'user_id' => Auth::id(),
        ];

        // Process within a database transaction
        DB::beginTransaction();
        try {
            // Create outgoing transaction record
            $transaction = Transaction::create($transactionData);

            // If transferring all items, update the room
            if ($item->quantity == $validated['quantity']) {
                $item->room_id = $validated['to_room_id'];
            }
            // If transferring partial items, we'd need a more complex solution to track split inventory
            // For now, just transfer all items to the new room
            else {
                $item->room_id = $validated['to_room_id'];
            }

            $item->save();

            DB::commit();

            return redirect()->route('transactions.index')
                ->with('success', 'Item transfer processed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to process transfer: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Validate export request parameters
     */
    private function validateExportRequest(Request $request)
    {
        return $request->validate([
            'search' => 'nullable|string|max:255',
            'type' => 'sometimes|string|in:in,out,transfer,all',
            'item' => 'sometimes|exists:items,id',
            'fromRoom' => 'sometimes|exists:rooms,id',
            'toRoom' => 'sometimes|exists:rooms,id',
            'dateFrom' => 'nullable|date',
            'dateTo' => 'nullable|date',
        ]);
    }

    /**
     * Get filtered transactions based on request parameters
     */
    private function getFilteredTransactions($validated)
    {
        $search = $validated['search'] ?? '';
        $type = $validated['type'] ?? 'all';
        $item = $validated['item'] ?? 'all';
        $fromRoom = $validated['fromRoom'] ?? 'all';
        $toRoom = $validated['toRoom'] ?? 'all';
        $dateFrom = $validated['dateFrom'] ?? null;
        $dateTo = $validated['dateTo'] ?? null;

        $query = Transaction::with(['item', 'item.category', 'fromRoom', 'toRoom', 'user']);

        if (!empty($search)) {
            $query->whereHas('item', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        if ($item !== 'all') {
            $query->where('item_id', $item);
        }

        if ($fromRoom !== 'all') {
            $query->where('from_room_id', $fromRoom);
        }

        if ($toRoom !== 'all') {
            $query->where('to_room_id', $toRoom);
        }

        if ($dateFrom) {
            $query->whereDate('transaction_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('transaction_date', '<=', $dateTo);
        }

        return $query->orderBy('transaction_date', 'desc')->get();
    }
}
