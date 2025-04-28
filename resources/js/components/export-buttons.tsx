import React from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, File } from "lucide-react";
import { useForm } from '@inertiajs/react';
import { Filters } from "@/types/inventory";
import { DropdownMenuItem } from './ui/dropdown-menu';

interface ExportButtonProps {
    filters: Filters;
}

export const ExcelExportButton: React.FC<ExportButtonProps> = ({ filters }) => {
    const form = useForm({
        search: filters.search || '',
        category: filters.category || 'all',
        status: filters.status || 'all',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
    });

    const handleExport = () => {
        window.location.href = route('inventory.export.excel');
    };

    return (
        <DropdownMenuItem onClick={handleExport} disabled={form.processing} className="w-full h-full flex items-center gap-2 hover:cursor-pointer p-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel</span>
        </DropdownMenuItem>

    );
};

export const PdfExportButton: React.FC<ExportButtonProps> = ({ filters }) => {
    const form = useForm({
        search: filters.search || '',
        category: filters.category || 'all',
        status: filters.status || 'all',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
    });

    const handleExport = () => {
        window.location.href = route('inventory.export.pdf');
    };

    return (
        <DropdownMenuItem onClick={handleExport} disabled={form.processing} className="w-full h-full flex items-center justify-start gap-2 hover:cursor-pointer p-2">
            <File className="h-4 w-4" />
            <span>PDF</span>
        </DropdownMenuItem>

    );
};