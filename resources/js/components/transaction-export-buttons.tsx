import React from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, File } from "lucide-react";
import { useForm } from '@inertiajs/react';
import { Filters } from "@/types/transaction";
import { DropdownMenuItem } from './ui/dropdown-menu';

interface TransactionExportButtonProps {
    filters: Filters;
}

export const TransactionExcelExportButton: React.FC<TransactionExportButtonProps> = ({ filters }) => {
    const form = useForm({
        search: filters.search || '',
        type: filters.type || 'all',
        userType: filters.userType || 'all',
        item: filters.item || 'all',
        fromRoom: filters.fromRoom || 'all',
        toRoom: filters.toRoom || 'all',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
    });

    const handleExport = () => {
        // Build query parameters
        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters.userType && filters.userType !== 'all') params.append('userType', filters.userType);
        if (filters.item && filters.item !== 'all') params.append('item', filters.item.toString());
        if (filters.fromRoom && filters.fromRoom !== 'all') params.append('fromRoom', filters.fromRoom.toString());
        if (filters.toRoom && filters.toRoom !== 'all') params.append('toRoom', filters.toRoom.toString());
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        const queryString = params.toString();
        const url = queryString
            ? `${route('transactions.export.excel')}?${queryString}`
            : route('transactions.export.excel');

        window.location.href = url;
    };

    return (
        <DropdownMenuItem
            onClick={handleExport}
            disabled={form.processing}
            className="w-full h-full flex items-center gap-2 hover:cursor-pointer p-2"
        >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel</span>
        </DropdownMenuItem>
    );
};

export const TransactionPdfExportButton: React.FC<TransactionExportButtonProps> = ({ filters }) => {
    const form = useForm({
        search: filters.search || '',
        type: filters.type || 'all',
        userType: filters.userType || 'all',
        item: filters.item || 'all',
        fromRoom: filters.fromRoom || 'all',
        toRoom: filters.toRoom || 'all',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
    });

    const handleExport = () => {
        // Build query parameters
        const params = new URLSearchParams();

        if (filters.search) params.append('search', filters.search);
        if (filters.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters.userType && filters.userType !== 'all') params.append('userType', filters.userType);
        if (filters.item && filters.item !== 'all') params.append('item', filters.item.toString());
        if (filters.fromRoom && filters.fromRoom !== 'all') params.append('fromRoom', filters.fromRoom.toString());
        if (filters.toRoom && filters.toRoom !== 'all') params.append('toRoom', filters.toRoom.toString());
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        const queryString = params.toString();
        const url = queryString
            ? `${route('transactions.export.pdf')}?${queryString}`
            : route('transactions.export.pdf');

        window.location.href = url;
    };

    return (
        <DropdownMenuItem
            onClick={handleExport}
            disabled={form.processing}
            className="w-full h-full flex items-center justify-start gap-2 hover:cursor-pointer p-2"
        >
            <File className="h-4 w-4" />
            <span>PDF</span>
        </DropdownMenuItem>
    );
};