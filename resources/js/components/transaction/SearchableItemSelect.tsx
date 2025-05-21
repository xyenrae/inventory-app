import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Item } from '@/types/transaction';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchableItemSelectProps {
    items: Item[];
    selectedValue: number | string;
    onValueChange: (value: number | string) => void;
    placeholder?: string;
}

export const SearchableItemSelect: React.FC<SearchableItemSelectProps> = ({
    items,
    selectedValue,
    onValueChange,
    placeholder = 'Search item...'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredItems = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(lowerSearch) ||
            item.category.toLowerCase().includes(lowerSearch)
        );

        return searchTerm ? filtered : [{ id: 'all', name: 'All Items', category: '' }, ...filtered];
    }, [searchTerm, items]);

    const displayValue = useMemo(() => {
        if (selectedValue === 'all') return 'All Items';
        const selectedItem = items.find(item => item.id === selectedValue);
        return selectedItem ? `${selectedItem.name} (${selectedItem.category})` : 'All Items';
    }, [selectedValue, items]);

    const handleSelect = useCallback((id: number | string) => {
        onValueChange(id);
        setSearchTerm('');
        setIsOpen(false);
        inputRef.current?.blur();
    }, [onValueChange]);

    const handleInputClick = useCallback(() => {
        if (!isOpen) {
            setSearchTerm('');
            setIsOpen(true);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative space-y-2">
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={isOpen ? searchTerm : displayValue}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={handleInputClick}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    readOnly={!isOpen}
                    className={`pr-8 ${!isOpen ? 'cursor-pointer' : ''}`}
                />

                {(isOpen && searchTerm) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 rounded-l-none"
                        onClick={() => {
                            setSearchTerm('');
                            handleSelect('all');
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-background shadow-lg">
                    {filteredItems.length > 0 ? (
                        <ul className="p-1 space-y-1">
                            {filteredItems.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => handleSelect(item.id)}
                                    className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors
                                        ${item.id === selectedValue
                                            ? 'bg-primary text-primary-foreground font-medium'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                        }`
                                    }
                                >
                                    {item.id === 'all'
                                        ? 'All Items'
                                        : `${item.name} (${item.category})`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No items found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};