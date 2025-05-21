import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Search,
    Filter,
    ArrowDownUp,
    ArrowDown,
    ArrowUp,
    FileDown,
    Plus,
    ArrowLeftRight,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { CustomDatePicker } from '@/components/custom-date-picker';
import PaginationFooter from '@/components/pagination-footer';
import { BreadcrumbItem } from '@/types';
import { Transaction, Room, Item, Filters, Pagination, FormData } from '@/types/transaction';
import { StockOutDialog } from '@/components/transaction/StockOutDialog';
import { StockInDialog } from '@/components/transaction/StockInDialog';

interface PageProps {
    transactions: Transaction;
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
    const [selectedItemGroup, setSelectedItemGroup] = useState<{
        name: string;
        variants: Array<{
            id: number;
            current_room: { id: number; display_name: string };
            current_quantity: number;
        }>;
    } | null>(null);

    // State for filters
    const [search, setSearch] = useState<string>(filters.search || '');
    const [transactionType, setTransactionType] = useState<string>(filters.type || 'all');
    const [selectedItem, setSelectedItem] = useState<number | string>(filters.item || 'all');
    const [selectedFromRoom, setSelectedFromRoom] = useState<number | string>(filters.fromRoom || 'all');
    const [selectedToRoom, setSelectedToRoom] = useState<number | string>(filters.toRoom || 'all');
    const [dateFrom, setDateFrom] = useState<Date | null>(filters.dateFrom ? new Date(filters.dateFrom) : null);
    const [dateTo, setDateTo] = useState<Date | null>(filters.dateTo ? new Date(filters.dateTo) : null);
    const [perPage, setPerPage] = useState<number>(filters.perPage || 10);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // State for transaction forms
    const [openStockInDialog, setOpenStockInDialog] = useState<boolean>(false);
    const [openStockOutDialog, setOpenStockOutDialog] = useState<boolean>(false);
    const [openTransferDialog, setOpenTransferDialog] = useState<boolean>(false);
    const [openDetailsSheet, setOpenDetailsSheet] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Default form data
    const defaultFormData: FormData = {
        item_id: null,
        type: 'in',
        quantity: '',
        from_room_id: null,
        to_room_id: null,
        reference_number: '',
        notes: '',
        transaction_date: new Date(),
        max_quantity: undefined,
        available_rooms: [],
    };

    // Form data for different transaction types
    const [stockInForm, setStockInForm] = useState<FormData>({ ...defaultFormData, type: 'in' });
    const [stockOutForm, setStockOutForm] = useState<FormData>({ ...defaultFormData, type: 'out', available_rooms: [] });
    const [transferForm, setTransferForm] = useState<FormData>({ ...defaultFormData, type: 'out' });

    // Apply filters
    const applyFilters = () => {
        setIsLoading(true);

        router.get(
            route('transactions.index'),
            {
                search,
                type: transactionType,
                item: selectedItem,
                fromRoom: selectedFromRoom,
                toRoom: selectedToRoom,
                dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
                dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : '',
                perPage,
                page: 1 // Reset to first page when filters change
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    // Reset filters
    const resetFilters = () => {
        setSearch('');
        setTransactionType('all');
        setSelectedItem('all');
        setSelectedFromRoom('all');
        setSelectedToRoom('all');
        setDateFrom(null);
        setDateTo(null);
        setPerPage(10);

        // Apply reset filters
        router.get(
            route('transactions.index'),
            {
                search: '',
                type: 'all',
                item: 'all',
                fromRoom: 'all',
                toRoom: 'all',
                dateFrom: '',
                dateTo: '',
                perPage: 10,
                page: 1
            },
            {
                preserveState: true
            }
        );
    };

    // Export functions
    const exportToExcel = () => {
        const params = new URLSearchParams({
            search: search || '',
            type: transactionType || 'all',
            item: selectedItem?.toString() || 'all',
            fromRoom: selectedFromRoom?.toString() || 'all',
            toRoom: selectedToRoom?.toString() || 'all',
            dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
            dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : '',
        });

        window.location.href = `${route('transactions.exportExcel')}?${params.toString()}`;
    };

    const exportToPdf = () => {
        const params = new URLSearchParams({
            search: search || '',
            type: transactionType || 'all',
            item: selectedItem?.toString() || 'all',
            fromRoom: selectedFromRoom?.toString() || 'all',
            toRoom: selectedToRoom?.toString() || 'all',
            dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
            dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : '',
        });

        window.location.href = `${route('transactions.exportPdf')}?${params.toString()}`;
    };

    // Submit handlers
    const handleStockInSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!stockInForm.item_id || !stockInForm.to_room_id || !stockInForm.quantity || !stockInForm.transaction_date) {
            toast.error("Please fill in all required fields");

            return;
        }

        setIsLoading(true);

        router.post(route('transactions.stockIn'), {
            item_id: stockInForm.item_id,
            quantity: Number(stockInForm.quantity),
            to_room_id: stockInForm.to_room_id,
            reference_number: stockInForm.reference_number,
            notes: stockInForm.notes,
            transaction_date: stockInForm.transaction_date ? format(stockInForm.transaction_date, 'yyyy-MM-dd') : '',
        }, {
            onSuccess: () => {
                setOpenStockInDialog(false);
                setStockInForm({ ...defaultFormData, type: 'in' });
                toast.success('Stock-in transaction recorded successfully');

            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Failed to record stock-in transaction");

            },
            onFinish: () => setIsLoading(false)
        });
    };

    const handleStockOutSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!stockOutForm.item_id || !stockOutForm.from_room_id || !stockOutForm.quantity || !stockOutForm.transaction_date) {
            toast.error("Please fill in all required fields");

            return;
        }

        setIsLoading(true);

        router.post(route('transactions.stockOut'), {
            item_id: stockOutForm.item_id,
            quantity: Number(stockOutForm.quantity),
            from_room_id: stockOutForm.from_room_id,
            reference_number: stockOutForm.reference_number,
            notes: stockOutForm.notes,
            transaction_date: stockOutForm.transaction_date ? format(stockOutForm.transaction_date, 'yyyy-MM-dd') : '',
        }, {
            onSuccess: () => {
                setOpenStockOutDialog(false);
                setStockOutForm({ ...defaultFormData, type: 'out' });
                toast.success('Stock-out transaction recorded successfully');

            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Failed to record stock-out transaction");

            },
            onFinish: () => setIsLoading(false)
        });
    };

    const handleTransferSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!transferForm.item_id || !transferForm.from_room_id || !transferForm.to_room_id ||
            !transferForm.quantity || !transferForm.transaction_date ||
            transferForm.from_room_id === transferForm.to_room_id) {
            toast.error("Please fill in all required fields. Source and destination rooms must be different.");

            return;
        }

        setIsLoading(true);

        router.post(route('transactions.transfer'), {
            item_id: transferForm.item_id,
            quantity: Number(transferForm.quantity),
            from_room_id: transferForm.from_room_id,
            to_room_id: transferForm.to_room_id,
            reference_number: transferForm.reference_number,
            notes: transferForm.notes,
            transaction_date: transferForm.transaction_date ? format(transferForm.transaction_date, 'yyyy-MM-dd') : '',
        }, {
            onSuccess: () => {
                setOpenTransferDialog(false);
                setTransferForm({ ...defaultFormData, type: 'out' });
                toast.success('Item transfer processed successfully');
            },
            onError: (errors) => {
                console.error(errors);
                toast.success('Failed to process transfer');
            },
            onFinish: () => setIsLoading(false)
        });
    };

    // Handle item selection in forms
    const handleItemSelection = (itemId: number, formType: 'stockIn' | 'stockOut' | 'transfer') => {
        const selectedItem = items.find(item => item.id === itemId);

        if (!selectedItem) return;

        if (selectedItem) {
            if (formType === 'stockIn') {
                setStockInForm(prev => ({
                    ...prev,
                    item_id: itemId
                }));
            } else if (formType === 'stockOut') {
                const availableRooms = selectedItem.current_room
                    ? [selectedItem.current_room]
                    : rooms;

                setStockOutForm(prev => ({
                    ...prev,
                    item_id: itemId,
                    from_room_id: null,
                    max_quantity: selectedItem?.current_quantity || 0,
                    available_rooms: availableRooms,
                }));
            } else if (formType === 'transfer') {
                setTransferForm(prev => ({
                    ...prev,
                    item_id: itemId,
                    from_room_id: selectedItem.current_room?.id || null
                }));
            }
        }
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
                type: transactionType,
                item: selectedItem,
                fromRoom: selectedFromRoom,
                toRoom: selectedToRoom,
                dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
                dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : '',
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
            <Head title="Room Management" />

            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventory Transactions</h1>
                        <p className="text-muted-foreground">Manage and track item movements</p>
                    </div>

                    {can.create && (
                        <div className="flex gap-2">
                            <div>
                                <Button
                                    onClick={() => setOpenStockInDialog(true)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <ArrowDown className="w-4 h-4" /> Stock In
                                </Button>
                                <StockInDialog
                                    open={openStockInDialog}
                                    onOpenChange={setOpenStockInDialog}
                                    items={items}
                                    rooms={rooms}
                                    can={can}
                                />
                            </div>

                            <div>
                                <Button
                                    onClick={() => setOpenStockOutDialog(true)}
                                    variant="outline"
                                    className="gap-2"
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

                            <Dialog open={openTransferDialog} onOpenChange={setOpenTransferDialog}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2" variant="secondary">
                                        <ArrowLeftRight className="w-4 h-4" />
                                        Transfer
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Transfer Items</DialogTitle>
                                        <DialogDescription>
                                            Move items between rooms
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleTransferSubmit} className="space-y-4 py-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="transfer-item">Item</Label>
                                                <Select
                                                    value={transferForm.item_id?.toString() || ""}
                                                    onValueChange={(value) => handleItemSelection(Number(value), 'transfer')}
                                                >
                                                    <SelectTrigger id="transfer-item" className="w-full">
                                                        <SelectValue placeholder="Select an item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {items.map((item) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                                {item.name} ({item.category}) -
                                                                {item.current_quantity !== undefined ? ` Available: ${item.current_quantity}` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transfer-quantity">Quantity</Label>
                                                <Input
                                                    id="transfer-quantity"
                                                    type="number"
                                                    min={1}
                                                    value={transferForm.quantity}
                                                    onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: e.target.value }))}
                                                    placeholder="Enter quantity"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transfer-from-room">From Room</Label>
                                                <Select
                                                    value={transferForm.from_room_id?.toString() || ""}
                                                    onValueChange={(value) => setTransferForm(prev => ({ ...prev, from_room_id: Number(value) }))}
                                                >
                                                    <SelectTrigger id="transfer-from-room" className="w-full">
                                                        <SelectValue placeholder="Select source room" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {rooms.map((room) => (
                                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                                {room.display_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transfer-to-room">To Room</Label>
                                                <Select
                                                    value={transferForm.to_room_id?.toString() || ""}
                                                    onValueChange={(value) => setTransferForm(prev => ({ ...prev, to_room_id: Number(value) }))}
                                                >
                                                    <SelectTrigger id="transfer-to-room" className="w-full">
                                                        <SelectValue placeholder="Select destination room" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {rooms.map((room) => (
                                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                                {room.display_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transfer-reference">Reference Number</Label>
                                                <Input
                                                    id="transfer-reference"
                                                    value={transferForm.reference_number}
                                                    onChange={(e) => setTransferForm(prev => ({ ...prev, reference_number: e.target.value }))}
                                                    placeholder="Optional reference number"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transfer-date">Transaction Date</Label>
                                                <CustomDatePicker
                                                    date={transferForm.transaction_date}
                                                    setDate={(date) => setTransferForm(prev => ({ ...prev, transaction_date: date }))}
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transfer-notes">Notes</Label>
                                                <Textarea
                                                    id="transfer-notes"
                                                    value={transferForm.notes}
                                                    onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                                                    placeholder="Additional notes (optional)"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setOpenTransferDialog(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processing
                                                    </>
                                                ) : (
                                                    <>Process Transfer</>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter and search transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by reference, item, or notes"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transaction-type">Transaction Type</Label>
                                <Select
                                    value={transactionType}
                                    onValueChange={setTransactionType}
                                >
                                    <SelectTrigger id="transaction-type">
                                        <SelectValue placeholder="Select transaction type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="in">Stock In</SelectItem>
                                        <SelectItem value="out">Stock Out</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="item-filter">Item</Label>
                                <Select
                                    value={selectedItem.toString()}
                                    onValueChange={setSelectedItem}
                                >
                                    <SelectTrigger id="item-filter">
                                        <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Items</SelectItem>
                                        {items.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name} ({item.category})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="from-room-filter">From Room</Label>
                                <Select
                                    value={selectedFromRoom.toString()}
                                    onValueChange={setSelectedFromRoom}
                                >
                                    <SelectTrigger id="from-room-filter">
                                        <SelectValue placeholder="Select source room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Rooms</SelectItem>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="to-room-filter">To Room</Label>
                                <Select
                                    value={selectedToRoom.toString()}
                                    onValueChange={setSelectedToRoom}
                                >
                                    <SelectTrigger id="to-room-filter">
                                        <SelectValue placeholder="Select destination room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Rooms</SelectItem>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date-range">Date Range</Label>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-10"
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'From'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CustomDatePicker
                                                date={dateFrom}
                                                setDate={setDateFrom}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal h-10"
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {dateTo ? format(dateTo, 'MMM d, yyyy') : 'To'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CustomDatePicker
                                                date={dateTo}
                                                setDate={setDateTo}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="flex gap-2">
                                <Button onClick={applyFilters} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Filtering...
                                        </>
                                    ) : (
                                        <>
                                            <Filter className="mr-2 h-4 w-4" />
                                            Apply Filters
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={resetFilters} disabled={isLoading}>
                                    Reset Filters
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={exportToExcel} className="gap-2">
                                    <FileDown className="h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button variant="outline" onClick={exportToPdf} className="gap-2">
                                    <FileDown className="h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            {pagination.total} transaction{pagination.total !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                                            <TableCell>
                                                {transaction.type === 'in' ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        <ArrowDown className="mr-1 h-3 w-3" />
                                                        Stock In
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                        <ArrowUp className="mr-1 h-3 w-3" />
                                                        Stock Out
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{transaction.item.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {/* {transaction.item.category?.name || 'No Category'} */}
                                                    {transaction.item.category?.name || 'No Category'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{transaction.quantity}</TableCell>
                                            <TableCell>
                                                {transaction.fromRoom ? (
                                                    <div>
                                                        <div className="font-medium">{transaction.fromRoom.name}</div>
                                                        <div className="text-xs text-muted-foreground">{transaction.fromRoom.location}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.toRoom ? (
                                                    <div>
                                                        <div className="font-medium">{transaction.toRoom.name}</div>
                                                        <div className="text-xs text-muted-foreground">{transaction.toRoom.location}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.reference_number || <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>{transaction.user.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => viewTransactionDetails(transaction)}
                                                >
                                                    <Search className="h-4 w-4" />
                                                    <span className="sr-only">View details</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="per-page">Show</Label>
                            <Select
                                value={perPage.toString()}
                                onValueChange={(value) => {
                                    setPerPage(Number(value));
                                    // Apply the new per page value
                                    router.get(
                                        route('transactions.index'),
                                        {
                                            search,
                                            type: transactionType,
                                            item: selectedItem,
                                            fromRoom: selectedFromRoom,
                                            toRoom: selectedToRoom,
                                            dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '',
                                            dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : '',
                                            perPage: value,
                                            page: 1 // Reset to first page when changing per page
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <SelectTrigger id="per-page" className="w-[70px]">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">
                                Showing {pagination.from}-{pagination.to} of {pagination.total}
                            </span>
                        </div>

                        <PaginationFooter
                            pagination={pagination}
                            perPage={perPage}
                            perPageOptions={[10, 25, 50, 100]}
                            filters={filters}
                            isLoading={isLoading}
                            goToPage={goToPage}
                            setPerPage={setPerPage}
                        />
                    </CardFooter>
                </Card>

                {/* Transaction Details Sheet */}
                <Sheet open={openDetailsSheet} onOpenChange={setOpenDetailsSheet}>
                    <SheetContent className="sm:max-w-[600px]">
                        <SheetHeader>
                            <SheetTitle>Transaction Details</SheetTitle>
                            <SheetDescription>
                                View detailed information about this transaction
                            </SheetDescription>
                        </SheetHeader>

                        {selectedTransaction && (
                            <div className="space-y-6 py-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Transaction Type</h3>
                                        <p className="mt-1">
                                            {selectedTransaction.type === 'in' ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    <ArrowDown className="mr-1 h-3 w-3" />
                                                    Stock In
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                    <ArrowUp className="mr-1 h-3 w-3" />
                                                    Stock Out
                                                </Badge>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Transaction Date</h3>
                                        <p className="mt-1 font-medium">{formatDate(selectedTransaction.transaction_date)}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Reference Number</h3>
                                        <p className="mt-1">{selectedTransaction.reference_number || '-'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                                        <p className="mt-1">{selectedTransaction.user.name}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Item Details</h3>
                                    <div className="bg-muted rounded-md p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-sm font-medium">Item Name</h4>
                                                <p>{selectedTransaction.item.name}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">Category</h4>
                                                <p>{selectedTransaction.item.category?.name || 'No Category'}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">Quantity</h4>
                                                <p>{selectedTransaction.quantity}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium">Current Stock</h4>
                                                <p>{selectedTransaction.item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium">From Room</h4>
                                            <p>
                                                {selectedTransaction.fromRoom
                                                    ? `${selectedTransaction.fromRoom.name} (${selectedTransaction.fromRoom.location})`
                                                    : '-'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium">To Room</h4>
                                            <p>
                                                {selectedTransaction.toRoom
                                                    ? `${selectedTransaction.toRoom.name} (${selectedTransaction.toRoom.location})`
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedTransaction.notes && (
                                    <>
                                        <Separator />

                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                                            <p className="text-sm whitespace-pre-wrap">{selectedTransaction.notes}</p>
                                        </div>
                                    </>
                                )}

                                <SheetFooter>
                                    <Button variant="outline" onClick={() => setOpenDetailsSheet(false)}>
                                        Close
                                    </Button>
                                </SheetFooter>
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </AppLayout>
    );
}