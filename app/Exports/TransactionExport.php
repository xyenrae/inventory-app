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

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle, WithEvents
{
    protected $transactions;

    public function __construct($transactions)
    {
        $this->transactions = $transactions;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->transactions;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Transaction ID',
            'Reference Number',
            'Type',
            'Item',
            'Category',
            'Quantity',
            'From Room',
            'To Room',
            'Date',
            'User',
            'Notes'
        ];
    }

    /**
     * @param mixed $transaction
     * @return array
     */
    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->reference_number ?? 'N/A',
            $transaction->type === 'in' ? 'Stock In' : 'Stock Out',
            $transaction->item->name ?? 'Unknown Item',
            $transaction->item->category->name ?? 'Unknown Category',
            $transaction->quantity,
            $transaction->fromRoom ? $transaction->fromRoom->name . ' (' . $transaction->fromRoom->location . ')' : 'N/A',
            $transaction->toRoom ? $transaction->toRoom->name . ' (' . $transaction->toRoom->location . ')' : 'N/A',
            $transaction->transaction_date->format('Y-m-d H:i'),
            $transaction->user ? $transaction->user->name : 'Unknown User',
            $transaction->notes ?? ''
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold
            1 => ['font' => ['bold' => true]],
        ];
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Transactions';
    }

    /**
     * @return array
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $event->sheet->getStyle('A1:K1')->applyFromArray([
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => 'E2E8F0',
                        ],
                    ],
                ]);

                // Auto filter
                $lastColumn = 'K';
                $lastRow = $event->sheet->getHighestRow();
                $event->sheet->setAutoFilter("A1:{$lastColumn}1");

                // Format the cells
                $event->sheet->getStyle('A1:K' . $lastRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);

                // Conditional formatting for Stock In/Out
                $event->sheet->getStyle('C2:C' . $lastRow)->applyFromArray([
                    'font' => [
                        'color' => ['rgb' => '000000'],
                    ],
                ]);

                // Loop through each row to set background color based on transaction type
                for ($i = 2; $i <= $lastRow; $i++) {
                    $type = $event->sheet->getCell('C' . $i)->getValue();

                    if ($type == 'Stock In') {
                        $event->sheet->getStyle('C' . $i)->applyFromArray([
                            'fill' => [
                                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                                'startColor' => [
                                    'rgb' => 'DCFCE7', // Light green for stock in
                                ],
                            ],
                        ]);
                    } elseif ($type == 'Stock Out') {
                        $event->sheet->getStyle('C' . $i)->applyFromArray([
                            'fill' => [
                                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                                'startColor' => [
                                    'rgb' => 'FEE2E2', // Light red for stock out
                                ],
                            ],
                        ]);
                    }
                }
            },
        ];
    }
}
