import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowLeftRight,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Transaction, Room, Item, Filters, Pagination } from '@/types/transaction';
import { StockOutDialog } from '@/components/transaction/StockOutDialog';
import { StockInDialog } from '@/components/transaction/StockInDialog';
import { TransferDialog } from '@/components/transaction/TransferDialog';
import { TransactionFilters } from '@/components/transaction/TransactionFilters';
import { TransactionsTable } from '@/components/transaction/TransactionTable';
import { TransactionDetails } from '@/components/transaction/TransactionDetails';

interface PageProps {
    transactions: Transaction[];
    pagination: Pagination;
    filters: Filters;
    items: Item[];
    rooms: Room[];
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
    [key: string]: unknown;
}

export default function Transactions() {
    const { transactions, pagination, filters, items, rooms, can } = usePage<PageProps>().props;

    // State for filters
    const [search, setSearch] = useState<string>(filters.search || '');
    const [transactionType, setTransactionType] = useState<string>(filters.type || 'all');
    const [userType, setUserType] = useState<string>(filters.type || 'all');
    const [selectedItem, setSelectedItem] = useState<number | string>(filters.item || 'all');
    const [selectedFromRoom, setSelectedFromRoom] = useState<number | string>(filters.fromRoom || 'all');
    const [selectedToRoom, setSelectedToRoom] = useState<number | string>(filters.toRoom || 'all');
    const [dateFrom, setDateFrom] = useState<Date | null>(filters.dateFrom ? new Date(filters.dateFrom) : null);
    const [dateTo, setDateTo] = useState<Date | null>(filters.dateTo ? new Date(filters.dateTo) : null);
    const [perPage, setPerPage] = useState<number>(filters.perPage || 10);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(false);
    const [isLoadingResetFilters, setIsLoadingResetFilters] = useState<boolean>(false);

    // State for transaction forms
    const [openStockInDialog, setOpenStockInDialog] = useState<boolean>(false);
    const [openStockOutDialog, setOpenStockOutDialog] = useState<boolean>(false);
    const [openTransferDialog, setOpenTransferDialog] = useState<boolean>(false);
    const [openDetailsSheet, setOpenDetailsSheet] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Apply filters
    const applyFilters = () => {
        setIsLoadingFilters(true);

        const params = {
            search,
            type: transactionType !== 'all' ? transactionType : undefined,
            userType: userType !== 'all' ? userType : undefined,
            item: selectedItem !== 'all' ? selectedItem : undefined,
            fromRoom: selectedFromRoom !== 'all' ? selectedFromRoom : undefined,
            toRoom: selectedToRoom !== 'all' ? selectedToRoom : undefined,
            dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
            dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
            perPage: perPage.toString(),
        };

        router.get(route('transactions.index'), params, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsLoadingFilters(false),
        });
    };

    // Reset filters
    const resetFilters = () => {
        setIsLoadingResetFilters(true);

        setSearch('');
        setTransactionType('all');
        setUserType('all');
        setSelectedItem('all');
        setSelectedFromRoom('all');
        setSelectedToRoom('all');
        setDateFrom(null);
        setDateTo(null);
        setPerPage(10);

        router.get(route('transactions.index'), {
            perPage: 10,
            page: 1
        }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsLoadingResetFilters(false),
        });
    };

    // View transaction details
    const viewTransactionDetails = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setOpenDetailsSheet(true);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    // Pagination navigation
    const goToPage = (page: number) => {
        setIsLoading(true);
        router.get(
            route('transactions.index'),
            {
                search,
                type: transactionType !== 'all' ? transactionType : undefined,
                userType: userType !== 'all' ? userType : undefined,
                item: selectedItem !== 'all' ? selectedItem : undefined,
                fromRoom: selectedFromRoom !== 'all' ? selectedFromRoom : undefined,
                toRoom: selectedToRoom !== 'all' ? selectedToRoom : undefined,
                dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
                dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
                perPage,
                page
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Transactions', href: '/transactions' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Management" />

            <div className="space-y-4 p-4">
                <div className="md:flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Inventory Transactions</h1>
                        <p className="text-muted-foreground">Manage your transactions and inventory movements</p>
                    </div>

                    {can.create && (
                        <div className="grid grid-cols-3 md:flex gap-2 mt-6 md:mt-0">
                            <div>
                                <Button
                                    onClick={() => setOpenStockInDialog(true)}
                                    variant="outline"
                                    className="gap-2 w-full"
                                >
                                    <ArrowDown className="w-4 h-4" /> Stock In
                                </Button>
                                <StockInDialog
                                    open={openStockInDialog}
                                    onOpenChange={setOpenStockInDialog}
                                    items={items}
                                    can={can}
                                />
                            </div>

                            <div>
                                <Button
                                    onClick={() => setOpenStockOutDialog(true)}
                                    variant="outline"
                                    className="gap-2 w-full"
                                >
                                    <ArrowUp className="w-4 h-4" /> Stock Out
                                </Button>

                                <StockOutDialog
                                    open={openStockOutDialog}
                                    onOpenChange={setOpenStockOutDialog}
                                    items={items}
                                    can={can}
                                />
                            </div>

                            <div>
                                <Button
                                    onClick={() => setOpenTransferDialog(true)}
                                    variant="outline"
                                    className="gap-2 w-full"
                                >
                                    <ArrowLeftRight className="w-4 h-4" /> Transfer
                                </Button>

                                <TransferDialog
                                    open={openTransferDialog}
                                    onOpenChange={setOpenTransferDialog}
                                    items={items}
                                    can={can}
                                    rooms={rooms}
                                />
                            </div>

                        </div>
                    )}
                </div>

                {/* Filters */}
                <TransactionFilters
                    filters={filters}
                    search={search}
                    transactionType={transactionType}
                    userType={userType}
                    selectedItem={selectedItem}
                    selectedFromRoom={selectedFromRoom}
                    selectedToRoom={selectedToRoom}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    isLoadingFilters={isLoadingFilters}
                    isLoadingResetFilters={isLoadingResetFilters}
                    setSearch={setSearch}
                    setTransactionType={setTransactionType}
                    setUserType={setUserType}
                    setSelectedItem={setSelectedItem}
                    setSelectedFromRoom={setSelectedFromRoom}
                    setSelectedToRoom={setSelectedToRoom}
                    setDateFrom={setDateFrom}
                    setDateTo={setDateTo}
                    applyFilters={applyFilters}
                    resetFilters={resetFilters}
                    items={items}
                    rooms={rooms}
                />

                {/* Transactions Table */}
                <TransactionsTable
                    transactions={transactions}
                    pagination={pagination}
                    filters={filters}
                    can={can}
                    perPage={perPage}
                    isLoading={isLoading}
                    viewTransactionDetails={viewTransactionDetails}
                    formatDate={formatDate}
                    goToPage={goToPage}
                    setPerPage={setPerPage}
                />

                {/* Transactions Details */}
                <TransactionDetails
                    open={openDetailsSheet}
                    onOpenChange={setOpenDetailsSheet}
                    transaction={selectedTransaction}
                    formatDate={formatDate}
                />
            </div>
        </AppLayout>
    );
}