import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { Item, Filters, Pagination } from '@/types/inventory';
import ExportDropdown from '@/components/export-dropdown';
import PaginationFooter from '@/components/pagination-footer';

interface Props {
  items: Item[];
  pagination?: Pagination;
  filters: Filters;
  categories: { id: number; name: string }[];
  rooms: {
    id: number;
    name: string;
    location: string;
    display_name: string;
  }[];
  can?: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Inventory', href: '/inventory' },
];

const initialFormState = {
  name: '',
  category_id: 0,
  room_id: 0,
  quantity: 0,
  price: 0,
  status: 'In Stock' as string,
};
// Per page options
const perPageOptions = [10, 20, 50, 100];

// Format currency to IDR
const formatToIDR = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Status options for dropdowns
const statusOptions = [
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Low Stock', label: 'Low Stock' },
  { value: 'Out of Stock', label: 'Out of Stock' }
];

export default function Inventory({
  items = [],
  pagination = {
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    links: []
  }, filters = {
    search: '',
    category: 'all',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    perPage: 10
  },
  categories = [],
  rooms = [],
  can
}: Props) {
  const canCreateItems = can?.create || false;
  const canEditItems = can?.edit || false;
  const canDeleteItems = can?.delete || false;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [categoryFilter, setCategoryFilter] = useState(filters.category);
  const [roomFilter, setRoomFilter] = useState(filters.room || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status);
  const [minPriceFilter, setMinPriceFilter] = useState(filters.minPrice);
  const [maxPriceFilter, setMaxPriceFilter] = useState(filters.maxPrice);
  const [perPage, setPerPage] = useState(filters?.perPage || 10);


  const { data, setData, post, put, processing, errors, reset } = useForm({ ...initialFormState });
  const { delete: destroy } = useForm();

  // Apply filters with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Navigate to page
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.last_page) return;

    setIsLoading(true);

    router.get('/inventory', {
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter,
      minPrice: minPriceFilter,
      maxPrice: maxPriceFilter,
      perPage: perPage,
      page: page,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsLoading(false);
      }
    });
  };

  // Apply all filters
  const applyFilters = () => {
    setIsLoading(true);

    const params = {
      search: searchTerm,
      category: categoryFilter,
      room: roomFilter !== 'all' ? roomFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      minPrice: minPriceFilter || undefined,
      maxPrice: maxPriceFilter || undefined,
      perPage: perPage !== 10 ? perPage : undefined,
      page: 1,
    };

    router.visit('/inventory', {
      method: 'get',
      data: params,
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsLoading(false);
      }
    });
  };

  const resetFilters = () => {
    router.visit('/inventory', {
      method: 'get',
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsFilterOpen(false);
        setIsLoading(false);
      }
    });
  };

  const handleAddItem = () => {
    setData({
      ...data,
      category_id: Number(data.category_id),
      room_id: Number(data.room_id),
      quantity: Number(data.quantity),
      price: Number(data.price),
    });

    post('/inventory', {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        reset();
        toast.success('Item added successfully!');
      },
    });
  };


  const handleEditItem = (item: Item) => {
    setCurrentItem(item);
    setData({
      name: item.name,
      category_id: item.category_id,
      room_id: item.room_id,
      quantity: item.quantity,
      price: item.price,
      status: item.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewItem = (item: Item) => {
    setCurrentItem(item);
    setIsViewDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (!currentItem) return;

    setData({
      ...data,
      category_id: Number(data.category_id),
      room_id: Number(data.room_id),
      quantity: Number(data.quantity),
      price: Number(data.price),
    });

    put(`/inventory/${currentItem.id}`, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setCurrentItem(null);
        toast.success('Item updated successfully!');
      },
    });
  };

  const handleDeleteItem = (id: number) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete === null) return;

    destroy(`/inventory/${itemToDelete}`, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setItemToDelete(null);
        toast.success('Item deleted successfully!');
      },
    });
  };

  const openAddDialog = () => {
    reset();
    setData({ ...initialFormState });
    setIsAddDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentItem(null);
  };

  // Sync local state with props
  useEffect(() => {
    setSearchTerm(filters.search);
    setCategoryFilter(filters.category);
    setRoomFilter(filters.room || 'all');
    setStatusFilter(filters.status);
    setMinPriceFilter(filters.minPrice);
    setMaxPriceFilter(filters.maxPrice);
    setPerPage(filters.perPage);
  }, [filters]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Inventory Management" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <div className='md:flex'>
            <ExportDropdown filters={filters} />
            {canCreateItems && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center cursor-pointer mt-2 md:mt-0" onClick={openAddDialog}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Item</DialogTitle>
                          <DialogDescription>
                            Fill in the details to add a new inventory item.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Item Name</Label>
                            <Input
                              id="name"
                              value={data.name}
                              onChange={(e) => setData('name', e.target.value)}
                              placeholder="Enter item name"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={data.category_id === 0 ? '' : String(data.category_id)}
                              onValueChange={(value) => setData('category_id', parseInt(value))}
                            >
                              <SelectTrigger id="category" className='cursor-pointer'>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(category => (
                                  <SelectItem key={category.id} value={String(category.id)} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="room">Room</Label>
                            <Select
                              value={data.room_id === 0 ? '' : String(data.room_id)}
                              onValueChange={(value) => setData('room_id', parseInt(value))}
                            >
                              <SelectTrigger id="room" className='cursor-pointer'>
                                <SelectValue placeholder="Select room" />
                              </SelectTrigger>
                              <SelectContent>
                                {rooms.map(room => (
                                  <SelectItem key={room.id} value={String(room.id)}
                                    className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                                  >
                                    {room.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.room_id && <p className="text-sm text-red-500">{errors.room_id}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                min="0"
                                className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                                value={data.quantity === 0 ? "" : data.quantity}
                                placeholder="0"
                                onChange={(e) => setData('quantity', parseInt(e.target.value || '0'))}
                              />
                              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="price">Price (IDR)</Label>
                              <Input
                                id="price"
                                type="number"
                                min="0"
                                className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                                value={data.price === 0 ? "" : data.price}
                                onChange={(e) => setData('price', parseInt(e.target.value || '0'))}
                                placeholder="0"
                              />
                              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={data.status}
                              onValueChange={(value) => setData('status', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddItem} disabled={processing} className="cursor-pointer">
                            Add Item
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a new inventory item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}</div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle>All Items</CardTitle>

              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                {/* Search input */}
                <div className="relative w-full md:w-64">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>

                {/* Filter button with badge */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="relative hover:cursor-pointer">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                            {((categoryFilter && categoryFilter !== 'all') || (roomFilter && roomFilter !== 'all') || (statusFilter && statusFilter !== 'all') || minPriceFilter || maxPriceFilter) && (
                              <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-primary h-5 w-5 p-0 flex items-center justify-center">
                                <span className="text-xs">
                                  {[
                                    (categoryFilter && categoryFilter !== 'all') ? 1 : 0,
                                    (roomFilter && roomFilter !== 'all') ? 1 : 0,
                                    (statusFilter && statusFilter !== 'all') ? 1 : 0,
                                    minPriceFilter || maxPriceFilter ? 1 : 0
                                  ].reduce((a, b) => a + b, 0)}
                                </span>
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>

                        {/* Filter popover */}
                        <PopoverContent className="w-80">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Filters</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-8 px-2 text-xs cursor-pointer"
                              >
                                Reset filters
                              </Button>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-2">
                              <Label htmlFor="category-filter">Category</Label>
                              <Select
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                              >
                                <SelectTrigger id="category-filter">
                                  <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All categories</SelectItem>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="room-filter">Room</Label>
                              <Select
                                value={roomFilter}
                                onValueChange={setRoomFilter}
                              >
                                <SelectTrigger id="room-filter">
                                  <SelectValue placeholder="All rooms" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All rooms</SelectItem>
                                  {rooms.map((room) => (
                                    <SelectItem key={room.id} value={String(room.id)} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                                    >
                                      {room.display_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                              <Label htmlFor="status-filter">Status</Label>
                              <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                              >
                                <SelectTrigger id="status-filter">
                                  <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All statuses</SelectItem>
                                  {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-2">
                              <Label>Price Range (IDR)</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="Min"
                                    className="[&::-webkit-inner-spin-button]:appearance-none"
                                    value={minPriceFilter}
                                    onChange={(e) => setMinPriceFilter(e.target.value)}
                                  />
                                </div>
                                <div className="flex items-center">-</div>
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="Max"
                                    className="[&::-webkit-inner-spin-button]:appearance-none"
                                    value={maxPriceFilter}
                                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Apply Filters Button */}
                            <Button
                              className="w-full mt-4 hover:cursor-pointer"
                              onClick={() => {
                                applyFilters();
                                setIsFilterOpen(false);
                              }}
                            >
                              Apply Filters
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Filter inventory items</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="relative">
              {isLoading && (
                <div className="pointer-events-none opacity-50">
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{item.room.name}</span>
                            <span className="text-xs text-muted-foreground">{item.room.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatToIDR(item.price)}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${item.status === 'Low Stock'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : item.status === 'Out of Stock'
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            variant="outline"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="cursor-pointer"
                                    onClick={() => handleViewItem(item)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View item details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {canEditItems && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditItem(item)}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit this item</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {canDeleteItems && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete this item</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || minPriceFilter || maxPriceFilter) ? (
                          <>
                            <div className="flex flex-col items-center justify-center">
                              <Filter className="h-8 w-8 text-gray-400 mb-2" />
                              <p>No items match your current filters or search terms.</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                                className="mt-2 cursor-pointer"
                              >
                                Clear filters
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400 mb-2" />
                              <p>No items in inventory</p>
                              {canCreateItems && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={openAddDialog}
                                  className="mt-2 cursor-pointer"
                                >
                                  Add your first item
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination Footer */}
          <PaginationFooter
            pagination={pagination}
            perPage={perPage}
            perPageOptions={[10, 25, 50, 100]}
            filters={filters}
            isLoading={isLoading}
            goToPage={goToPage}
            setPerPage={setPerPage}
          />
        </Card>

        {/* View Item Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                Item Details
              </DialogTitle>
            </DialogHeader>
            {currentItem && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Item Name</p>
                    <p className="text-lg font-semibold">{currentItem.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-lg">{currentItem.category.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Room</p>
                    <div className="flex flex-col">
                      <p className="text-lg">{currentItem.room.name}</p>
                      <p className="text-sm text-muted-foreground">{currentItem.room.location}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                    <p className="text-2xl font-bold text-primary">{currentItem.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatToIDR(currentItem.price)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge
                    className={`text-sm w-fit ${currentItem.status === 'Low Stock'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : currentItem.status === 'Out of Stock'
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    variant="outline"
                  >
                    {currentItem.status}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created At</p>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <p className="font-medium">
                        {new Date(currentItem.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center text-muted-foreground gap-1">
                        <span className="hidden md:inline">|</span>
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(currentItem.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}{' '}
                          WIB
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <p className="font-medium">
                        {new Date(currentItem.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center text-muted-foreground gap-1">
                        <span className="hidden md:inline">|</span>
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(currentItem.updated_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}{' '}
                          WIB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)} className='cursor-pointer'>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        {canEditItems && (
          <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogDescription>
                  Update the details of the selected inventory item.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Item Name</Label>
                  <Input
                    id="edit-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={data.category_id.toString()}
                    onValueChange={(value) => setData('category_id', parseInt(value))}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={String(category.id)} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room">Room</Label>
                  <Select
                    value={data.room_id?.toString() || ''}
                    onValueChange={(value) => setData('room_id', parseInt(value))}
                  >
                    <SelectTrigger id="room">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map(room => (
                        <SelectItem key={room.id} value={String(room.id)} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                        >
                          {room.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.room_id && <p className="text-sm text-red-500">{errors.room_id}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-quantity">Quantity</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min="0"
                      className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                      value={data.quantity}
                      placeholder="0"
                      onChange={(e) => setData('quantity', parseInt(e.target.value || '0'))}
                    />
                    {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Price (IDR)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                      value={data.price}
                      placeholder="0"
                      onChange={(e) => setData('price', parseInt(e.target.value || '0'))}
                    />
                    {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={data.status}
                    onValueChange={(value) => setData('status', value)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateItem} disabled={processing} className="cursor-pointer">
                  Update Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item from your inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}