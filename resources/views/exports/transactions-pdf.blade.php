<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Transactions Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 24px;
        }

        .header p {
            margin: 5px 0;
            color: #666;
        }

        .filters {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .filters h3 {
            margin: 0 0 10px 0;
            color: #4F46E5;
        }

        .filter-item {
            display: inline-block;
            margin-right: 20px;
            margin-bottom: 5px;
        }

        .filter-label {
            font-weight: bold;
            color: #333;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #4F46E5;
            color: white;
            font-weight: bold;
            text-align: center;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .transaction-type {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .type-stock-in {
            background-color: #d4edda;
            color: #155724;
        }

        .type-stock-out {
            background-color: #f8d7da;
            color: #721c24;
        }

        .type-transfer {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }

        .summary {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .summary h3 {
            margin: 0 0 10px 0;
            color: #1976d2;
        }

        .summary-item {
            display: inline-block;
            margin-right: 30px;
            margin-bottom: 5px;
        }

        .summary-number {
            font-weight: bold;
            font-size: 16px;
            color: #1976d2;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Transactions Report</h1>
        <p>Generated on {{ $generatedAt  }}</p>
        <p>Total Records: {{ $transactions->count() }}</p>
    </div>

    <!-- Applied Filters -->
    @if(array_filter($filters))
    <div class="filters">
        <h3>Applied Filters:</h3>
        @if($filters['search'])
        <div class="filter-item">
            <span class="filter-label">Search:</span> {{ $filters['search'] }}
        </div>
        @endif
        @if($filters['type'] && $filters['type'] !== 'all')
        <div class="filter-item">
            <span class="filter-label">Transaction Type:</span> {{ ucfirst($filters['type']) }}
        </div>
        @endif
        @if($filters['userType'] && $filters['userType'] !== 'all')
        <div class="filter-item">
            <span class="filter-label">User Type:</span> {{ ucfirst($filters['userType']) }}
        </div>
        @endif
        @if($filters['dateFrom'])
        <div class="filter-item">
            <span class="filter-label">Date From:</span> {{ \Carbon\Carbon::parse($filters['dateFrom'])->format('d/m/Y') }}
        </div>
        @endif
        @if($filters['dateTo'])
        <div class="filter-item">
            <span class="filter-label">Date To:</span> {{ \Carbon\Carbon::parse($filters['dateTo'])->format('d/m/Y') }}
        </div>
        @endif
    </div>
    @endif

    <!-- Summary -->
    <div class="summary">
        <h3>Summary:</h3>
        <div class="summary-item">
            <div>Total Transactions</div>
            <div class="summary-number">{{ $transactions->count() }}</div>
        </div>
        <div class="summary-item">
            <div>Stock In</div>
            <div class="summary-number">{{ $transactions->where('type', 'in')->count() }}</div>
        </div>
        <div class="summary-item">
            <div>Stock Out</div>
            <div class="summary-number">{{ $transactions->where('type', 'out')->count() }}</div>
        </div>
        <div class="summary-item">
            <div>Transfer</div>
            <div class="summary-number">{{ $transactions->where('type', 'transfer')->count() }}</div>
        </div>
    </div>

    <!-- Transactions Table -->
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 12%;">Reference</th>
                <th style="width: 8%;">Type</th>
                <th style="width: 15%;">Item</th>
                <th style="width: 8%;">Qty</th>
                <th style="width: 10%;">From Room</th>
                <th style="width: 10%;">To Room</th>
                <th style="width: 12%;">User</th>
                <th style="width: 15%;">Notes</th>
                <th style="width: 12%;">Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $index => $transaction)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $transaction->reference_number ?? '-' }}</td>
                <td class="text-center">
                    <span class="transaction-type type-{{ str_replace('_', '-', $transaction->type) }}">
                        {{ ucfirst(str_replace('_', ' ', $transaction->type)) }}
                    </span>
                </td>
                <td>
                    <strong>{{ $transaction->item->name ?? '-' }}</strong><br>
                    <small>{{ $transaction->item->code ?? '-' }}</small>
                </td>
                <td class="text-center">
                    {{ $transaction->quantity }} {{ $transaction->item->unit ?? '' }}
                </td>
                <td>{{ $transaction->fromRoom->name ?? '-' }}</td>
                <td>{{ $transaction->toRoom->name ?? '-' }}</td>
                <td>
                    <strong>{{ $transaction->user->name ?? '-' }}</strong><br>
                    <small>{{ $transaction->user->email ?? '-' }}</small>
                </td>
                <td>{{ $transaction->notes ?? '-' }}</td>
                <td class="text-center">{{ $transaction->created_at->format('d/m/Y H:i') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" class="text-center">No transactions found</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the Inventory Management System</p>
        <p>Generated on {{ $generatedAt }}</p>
    </div>
</body>

</html>