// File: components/transaction/StockOutDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/custom-date-picker';
import { Loader2 } from 'lucide-react';
import { FormData } from '@/types/transaction';
import { router } from '@inertiajs/react';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface StockInDialogProps {
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


export const StockInDialog: React.FC<StockInDialogProps> = ({
    open,
    onOpenChange,
    items,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [stockInForm, setStockInForm] = useState<FormData>({
        item_id: null,
        type: 'in',
        quantity: '',
        from_room_id: null,
        to_room_id: null,
        transaction_date: new Date(),
        max_quantity: undefined,
        available_rooms: [],
    });

    const defaultFormData: FormData = {
        item_id: null,
        type: 'in',
        quantity: '',
        from_room_id: null,
        to_room_id: null,
        transaction_date: new Date(),
        max_quantity: undefined,
        available_rooms: [],
    };

    const resetForm = () => {
        setStockInForm({ ...defaultFormData });
    };

    const handleItemSelection = (itemName: string) => {
        const group = groupedItems.find(g => g.name === itemName);

        if (!group) return;

        const allRooms = group.variants
            .filter(item => item.current_room)
            .map(item => ({
                ...item.current_room!,
                current_quantity: item.current_quantity
            }));

        const uniqueRooms = Array.from(
            new Map(allRooms.map(room => [room.id, room])).values()
        );

        let autoSelectedRoom = null;
        if (uniqueRooms.length === 1) {
            autoSelectedRoom = uniqueRooms[0];
        }

        setStockInForm(prev => ({
            ...prev,
            item_name: itemName,
            item_id: group.variants[0].id,
            from_room_id: autoSelectedRoom?.id || null,
            max_quantity: autoSelectedRoom?.current_quantity ||
                group.variants.reduce((sum, item) => sum + item.current_quantity, 0),
            available_rooms: uniqueRooms,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockInForm.item_id || !stockInForm.from_room_id || !stockInForm.quantity || !stockInForm.transaction_date) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        router.post(route('transactions.stockIn'), {
            item_id: stockInForm.item_id,
            quantity: Number(stockInForm.quantity),
            to_room_id: stockInForm.from_room_id,
            transaction_date: stockInForm.transaction_date ? stockInForm.transaction_date.toISOString().split('T')[0] : '',
        }, {
            onSuccess: () => {
                toast.success('Stock-in transaction recorded successfully');
                onOpenChange(false);
                resetForm();
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to record stock-in transaction');
                onOpenChange(false);
                resetForm();
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const groupedItems = React.useMemo(() => {
        const map = new Map<string, Array<{
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
        }>>();

        items.forEach(item => {
            if (!map.has(item.name)) {
                map.set(item.name, []);
            }
            map.get(item.name)?.push(item);
        });

        return Array.from(map.entries()).map(([name, groupItems]) => ({
            name,
            category: groupItems[0].category,
            variants: groupItems,
        }));
    }, [items]);

    return (
        <Dialog open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    resetForm();
                }
                onOpenChange(isOpen);
            }}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Stock In</DialogTitle>
                    <DialogDescription>Record items leaving inventory</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Item Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-in-item">Item</Label>
                            <Select
                                value={stockInForm.item_name || ""}
                                onValueChange={(value) => handleItemSelection(value)
                                }                             >
                                <SelectTrigger id="stock-in-item" className="w-full">
                                    <SelectValue placeholder="Select an item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groupedItems.map(group => (
                                        <SelectItem
                                            key={group.name}
                                            value={group.name}
                                            className="flex flex-col items-start"
                                        >
                                            <div className="font-medium">{group.name}</div>
                                            <div className="text-sm text-muted-foreground">({group.category})
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Source Room */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-in-room">Destination Room</Label>

                            {stockInForm.available_rooms?.length === 1 ? (
                                // Tampilkan sebagai teks jika hanya 1 ruangan
                                <div className="flex items-center gap-2 p-2 rounded-md border-input border">
                                    <span className='text-sm ml-1'>{stockInForm.available_rooms[0].display_name}</span>

                                </div>
                            ) : (
                                <Select
                                    value={stockInForm.from_room_id?.toString() || ""}
                                    onValueChange={(value) => {
                                        const roomId = Number(value);
                                        const selectedRoom = stockInForm.available_rooms?.find(r => r.id === roomId);

                                        setStockInForm(prev => ({
                                            ...prev,
                                            from_room_id: roomId,
                                            max_quantity: selectedRoom?.current_quantity || 0
                                        }));
                                    }}
                                    disabled={!stockInForm.item_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pick a destination room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stockInForm.available_rooms?.map(room => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {stockInForm.item_id && stockInForm.available_rooms?.length === 0 ? (
                                <p className="text-xs text-yellow-500 mt-1">
                                    This item is not currently available in any room.                                </p>
                            ) : null}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-in-quantity">Quantity</Label>
                            {stockInForm.max_quantity !== undefined && stockInForm.item_id && (
                                <p className="text-xs text-muted-foreground">Stock available: {stockInForm.max_quantity}</p>
                            )}
                            <Input
                                id="stock-in-quantity"
                                type="number"
                                min={1}
                                value={stockInForm.quantity}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (!isNaN(value) && value >= 1) {
                                        setStockInForm(prev => ({ ...prev, quantity: value }));
                                    } else if (e.target.value === '') {
                                        setStockInForm(prev => ({ ...prev, quantity: '' }));
                                    }
                                }}
                                disabled={!stockInForm.from_room_id}
                                placeholder={!stockInForm.from_room_id ? "Please choose an item and a room first" : "Enter quantity"}
                            />
                        </div>

                        {/* Transaction Date */}
                        <div className="space-y-2">
                            <Label htmlFor="stock-in-date">Transaction Date</Label>
                            <CustomDatePicker
                                date={stockInForm.transaction_date}
                                setDate={(date) => setStockInForm((prev) => ({ ...prev, transaction_date: date }))}
                                className="w-full"
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
                                <>Record Stock In</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};