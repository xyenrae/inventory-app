import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react';
import PaginationFooter from '@/components/pagination-footer';
import { Transaction } from '@/types/transaction';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Pagination, Filters } from '@/types/transaction';

interface TransactionsTableProps {
    transactions: Transaction[];
    pagination: Pagination;
    filters: Filters;
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
    perPage: number;
    isLoading: boolean;
    viewTransactionDetails: (transaction: Transaction) => void;
    formatDate: (dateString: string) => string;
    goToPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
    transactions,
    pagination,
    filters,
    perPage,
    isLoading,
    viewTransactionDetails,
    formatDate,
    goToPage,
    setPerPage
}) => {
    return (
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
                                        ) : transaction.type === 'out' ? (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                <ArrowUp className="mr-1 h-3 w-3" />
                                                Stock Out
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                <ArrowLeftRight className="mr-1 h-3 w-3" />
                                                Transfer
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{transaction.item.name}</div>
                                        <div className="text-xs text-muted-foreground">
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
                                    <TableCell>{transaction.user.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => viewTransactionDetails(transaction)}
                                            disabled={isLoading}
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
    );
};