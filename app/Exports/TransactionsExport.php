<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class TransactionsExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    ShouldAutoSize,
    WithTitle,
    WithEvents
{
    protected $transactions;

    public function __construct($transactions)
    {
        $this->transactions = $transactions;
    }

    public function collection()
    {
        return $this->transactions;
    }

    public function headings(): array
    {
        return [
            'Transaction ID',
            'Type',
            'Item',
            'Category',
            'Quantity',
            'From Room',
            'To Room',
            'Date',
            'User',
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->id,
            match ($transaction->type) {
                'in' => 'Stock In',
                'out' => 'Stock Out',
                'transfer' => 'Transfer',
                default => 'Unknown',
            },
            $transaction->item->name ?? 'Unknown Item',
            $transaction->item->category->name ?? 'Unknown Category',
            $transaction->quantity,
            $transaction->fromRoom ? $transaction->fromRoom->name . ' (' . $transaction->fromRoom->location . ')' : 'N/A',
            $transaction->toRoom ? $transaction->toRoom->name . ' (' . $transaction->toRoom->location . ')' : 'N/A',
            $transaction->transaction_date?->format('Y-m-d H:i') ?? 'N/A',
            $transaction->user?->name ?? 'Unknown User',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Transactions';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet;

                $sheet->getStyle('A1:I1')->applyFromArray([
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E2E8F0'],
                    ],
                ]);

                $lastRow = $sheet->getHighestRow();
                $sheet->setAutoFilter("A1:I1");

                $sheet->getStyle("A1:I{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);

                // Format berdasarkan kolom "Type" (B)
                for ($i = 2; $i <= $lastRow; $i++) {
                    $type = $sheet->getCell("B{$i}")->getValue();
                    $fillColor = match ($type) {
                        'Stock In' => 'DCFCE7',   // Light green
                        'Stock Out' => 'FEE2E2',  // Light red
                        'Transfer' => 'DBEAFE',   // Light blue
                        default => null,
                    };

                    if ($fillColor) {
                        $sheet->getStyle("B{$i}")->applyFromArray([
                            'fill' => [
                                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                                'startColor' => ['rgb' => $fillColor],
                            ],
                        ]);
                    }
                }
            },
        ];
    }
}
