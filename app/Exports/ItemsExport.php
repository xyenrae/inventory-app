<?php

namespace App\Exports;

use App\Models\Item;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ItemsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $items;

    public function __construct($items)
    {
        $this->items = $items;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->items;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Category',
            'Quantity',
            'Price',
            'Status',
            'Last Updated'
        ];
    }

    /**
     * @param Item $item
     * @return array
     */
    public function map($item): array
    {
        return [
            $item->id,
            $item->name,
            $item->category->name,
            $item->quantity,
            number_format($item->price, 2),
            $item->status,
            $item->updated_at->format('Y-m-d H:i:s')
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
