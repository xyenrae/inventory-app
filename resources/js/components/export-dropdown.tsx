import React from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ExcelExportButton, PdfExportButton } from '@/components/export-buttons';
import { Filters } from '@/types/inventory';

interface ExportDropdownProps {
    filters: Filters;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ filters }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 hover:cursor-pointer w-full mr-4">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-2">
                <ExcelExportButton filters={filters} />
                <PdfExportButton filters={filters} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ExportDropdown;
