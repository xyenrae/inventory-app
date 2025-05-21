// File: components/StockOutDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomDatePicker } from '@/components/custom-date-picker';
import { ArrowUp, Loader2 } from 'lucide-react';
import { FormData } from '@/types/transaction';
import { router } from '@inertiajs/react';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface StockOutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: Array<{
        id: number;
        name: string;
        category: string;
        current_room: {
            id: number;
            name: string;
            location: string;
            display_name: string;
        } | null;
        current_quantity: number;
    }>;
    can: { create: boolean };
}

export const StockOutDialog: React.FC<StockOutDialogProps> = ({
    open,
    onOpenChange,
    items,
    can
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [stockOutForm, setStockOutForm] = useState<FormData>({
        item_id: null,
        type: 'out',
        quantity: '',
        from_room_id: null,
        to_room_id: null,
        reference_number: '',
        notes: '',
        transaction_date: new Date(),
        max_quantity: undefined,
        available_rooms: [],
    });

    const handleItemSelection = (itemId: number) => {
        const selectedItem = items.find(item => item.id === itemId);
        if (!selectedItem) return;

        const availableRooms = selectedItem.current_room
            ? [selectedItem.current_room]
            : [];

        setStockOutForm(prev => ({
            ...prev,
            item_id: itemId,
            from_room_id: null,
            max_quantity: selectedItem.current_quantity || 0,
            available_rooms: availableRooms,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockOutForm.item_id || !stockOutForm.from_room_id || !stockOutForm.quantity || !stockOutForm.transaction_date) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        router.post(route('transactions.stockOut'), {
            item_id: stockOutForm.item_id,
            quantity: Number(stockOutForm.quantity),
            from_room_id: stockOutForm.from_room_id,
            reference_number: stockOutForm.reference_number,
            notes: stockOutForm.notes,
            transaction_date: stockOutForm.transaction_date ? stockOutForm.transaction_date.toISOString().split('T')[0] : '',
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setStockOutForm({
                    item_id: null,
                    type: 'out',
                    quantity: '',
                    from_room_id: null,
                    to_room_id: null,
                    reference_number: '',
                    notes: '',
                    transaction_date: new Date(),
                    max_quantity: undefined,
                    available_rooms: [],
                });
                toast.success('Stock-out transaction recorded successfully');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to record stock-out transaction');
            },
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Stock Out</DialogTitle>
                    <DialogDescription>Record items leaving inventory</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Item Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-out-item">Item</Label>
                            <Select
                                value={stockOutForm.item_id?.toString() || ""}
                                onValueChange={(value) => handleItemSelection(Number(value))}
                            >
                                <SelectTrigger id="stock-out-item" className="w-full">
                                    <SelectValue placeholder="Select an item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map((item) => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.category} | {item.current_room?.display_name || 'No Room'} | Qty: {item.current_quantity}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-out-quantity">Quantity</Label>
                            {stockOutForm.max_quantity !== undefined && stockOutForm.item_id && (
                                <p className="text-xs text-muted-foreground">Max available: {stockOutForm.max_quantity}</p>
                            )}
                            <Input
                                id="stock-out-quantity"
                                type="number"
                                min={1}
                                value={stockOutForm.quantity}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (!isNaN(value) && value >= 1 && value <= (stockOutForm.max_quantity ?? Infinity)) {
                                        setStockOutForm(prev => ({ ...prev, quantity: value }));
                                    } else if (e.target.value === '') {
                                        setStockOutForm(prev => ({ ...prev, quantity: '' }));
                                    }
                                }}
                                disabled={!stockOutForm.item_id}
                                placeholder={!stockOutForm.item_id ? "Select an item first" : "Enter quantity"}
                                className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>

                        {/* Source Room */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-out-room">Source Room</Label>
                            <Select
                                value={stockOutForm.from_room_id?.toString() || ""}
                                onValueChange={(value) => setStockOutForm(prev => ({ ...prev, from_room_id: Number(value) }))}
                                disabled={!stockOutForm.item_id}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih ruangan sumber" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stockOutForm.available_rooms?.map(room => (
                                        <SelectItem key={room.id} value={room.id.toString()}>
                                            {room.display_name} ({room.location})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Transaction Date */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-out-date">Transaction Date</Label>
                            <CustomDatePicker
                                date={stockOutForm.transaction_date}
                                setDate={(date) => setStockOutForm((prev) => ({ ...prev, transaction_date: date }))}
                                className="w-full"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-out-notes">Notes</Label>
                            <Textarea
                                id="stock-out-notes"
                                value={stockOutForm.notes}
                                onChange={(e) => setStockOutForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes (optional)"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                                </>
                            ) : (
                                <>Record Stock Out</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};