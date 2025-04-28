<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Inventory Items</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>

<body>
    <h1>Inventory Items Report</h1>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Last Updated</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td>{{ $item->id }}</td>
                <td>{{ $item->name }}</td>
                <td>{{ $item->category->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td>{{ number_format($item->price, 2) }}</td>
                <td>{{ $item->status }}</td>
                <td>{{ $item->updated_at->format('Y-m-d H:i:s') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generated on: {{ $generatedAt }}
    </div>
</body>

</html>