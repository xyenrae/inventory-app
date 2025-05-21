import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface TransactionDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction | null;
    formatDate: (dateString: string) => string;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
    open,
    onOpenChange,
    transaction,
    formatDate,
}) => {
    if (!transaction) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px]">
                <SheetHeader>
                    <SheetTitle>Transaction Details</SheetTitle>
                    <SheetDescription>
                        View detailed information about this transaction
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Transaction Type</h3>
                            <p className="mt-1">
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
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Transaction Date</h3>
                            <p className="mt-1 font-medium">{formatDate(transaction.transaction_date)}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                            <p className="mt-1">{transaction.user.name}</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Item Details</h3>
                        <div className="bg-muted rounded-md p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium">Item Name</h4>
                                    <p>{transaction.item.name}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium">Category</h4>
                                    <p>{transaction.item.category?.name || 'No Category'}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium">Quantity</h4>
                                    <p>{transaction.quantity}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium">Current Stock</h4>
                                    <p>{transaction.item.quantity}</p>
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
                                    {transaction.fromRoom
                                        ? `${transaction.fromRoom.name} (${transaction.fromRoom.location})`
                                        : '-'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium">To Room</h4>
                                <p>
                                    {transaction.toRoom
                                        ? `${transaction.toRoom.name} (${transaction.toRoom.location})`
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>



                    <SheetFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
};