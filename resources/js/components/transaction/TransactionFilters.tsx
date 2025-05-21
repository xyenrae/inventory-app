// TransactionFilters.tsx
import React from 'react';
import { Item, Room, Filters } from '@/types/transaction';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card';
import {
    Input
} from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Loader2 } from 'lucide-react';
import { CustomDatePicker } from '@/components/custom-date-picker';
import { format } from 'date-fns';
import { Label } from '../ui/label';

interface TransactionFiltersProps {
    filters: Filters;
    search: string;
    transactionType: string;
    selectedItem: number | string;
    selectedFromRoom: number | string;
    selectedToRoom: number | string;
    dateFrom: Date | null;
    dateTo: Date | null;
    isLoading: boolean;
    setSearch: (value: string) => void;
    setTransactionType: (value: string) => void;
    setSelectedItem: (value: number | string) => void;
    setSelectedFromRoom: (value: number | string) => void;
    setSelectedToRoom: (value: number | string) => void;
    setDateFrom: (date: Date | null) => void;
    setDateTo: (date: Date | null) => void;
    applyFilters: () => void;
    resetFilters: () => void;
    items: Item[];
    rooms: Room[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    filters,
    search,
    transactionType,
    selectedItem,
    selectedFromRoom,
    selectedToRoom,
    dateFrom,
    dateTo,
    isLoading,
    setSearch,
    setTransactionType,
    setSelectedItem,
    setSelectedFromRoom,
    setSelectedToRoom,
    setDateFrom,
    setDateTo,
    applyFilters,
    resetFilters,
    items,
    rooms
}) => {
    return (
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
                                placeholder="Search an items"
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
                                <SelectItem value="transfer">Transfer</SelectItem>
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
                    <div className="space-y-2 overflow-hidden">
                        <Label htmlFor="date-range">Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
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
                </div>
            </CardContent>
        </Card>
    );
};