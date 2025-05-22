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
import { SearchableItemSelect } from './SearchableItemSelect';

interface TransactionFiltersProps {
    filters: Filters;
    search: string;
    transactionType: string;
    userType: string;
    selectedItem: number | string;
    selectedFromRoom: number | string;
    selectedToRoom: number | string;
    dateFrom: Date | null;
    dateTo: Date | null;
    isLoadingFilters: boolean;
    isLoadingResetFilters: boolean;
    setSearch: (value: string) => void;
    setTransactionType: (value: string) => void;
    setUserType: (value: string) => void;
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
    userType,
    selectedItem,
    selectedFromRoom,
    selectedToRoom,
    dateFrom,
    dateTo,
    isLoadingFilters,
    isLoadingResetFilters,
    setSearch,
    setTransactionType,
    setUserType,
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
                        <Label htmlFor="item-filter">Search</Label>

                        <SearchableItemSelect
                            items={items}
                            selectedValue={selectedItem}
                            onValueChange={setSelectedItem}
                        />
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
                        <Label htmlFor="user-type">User Type</Label>
                        <Select
                            value={userType}
                            onValueChange={setUserType}
                        >
                            <SelectTrigger id="user-type">
                                <SelectValue placeholder="Select User type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
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
                        <div className="flex items-center gap-2 w-full">
                            <span className="text-muted-foreground text-sm">from</span>
                            <div className="relative flex-1">
                                <CustomDatePicker
                                    date={dateFrom}
                                    setDate={setDateFrom}
                                    className="pl-10 h-10 w-full border rounded-md"
                                />
                            </div>
                            <span className="text-muted-foreground text-sm">to</span>
                            <div className="relative flex-1">
                                <CustomDatePicker
                                    date={dateTo}
                                    setDate={setDateTo}
                                    className="pl-10 h-10 w-full border rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                    <div className="flex gap-2">
                        <Button onClick={applyFilters} disabled={isLoadingFilters}>
                            {isLoadingFilters ? (
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
                        <Button variant="outline" onClick={resetFilters} disabled={isLoadingResetFilters}>
                            {isLoadingResetFilters ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Reset Filters...
                                </>
                            ) : (
                                <>
                                    Reset Filters
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};