import React from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { TransactionExcelExportButton, TransactionPdfExportButton } from '@/components/transaction-export-buttons';
import { Filters } from '@/types/transaction';

interface TransactionExportDropdownProps {
    filters: Filters;
}

const TransactionExportDropdown: React.FC<TransactionExportDropdownProps> = ({ filters }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 hover:cursor-pointer w-full md:w-fit !px-12 mr-4 mt-4">
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-2">
                <TransactionExcelExportButton filters={filters} />
                <TransactionPdfExportButton filters={filters} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default TransactionExportDropdown;