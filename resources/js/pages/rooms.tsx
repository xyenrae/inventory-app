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
import { MapPin } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Pagination, Filters } from '@/types/category';
import PaginationFooter from '@/components/pagination-footer';

// Room type definition
interface Room {
    id: number;
    name: string;
    location: string;
    description: string | null;
    status: string;
    items_count: number;
    created_at: string;
    updated_at: string;
}

// Room form definition
interface RoomForm {
    name: string;
    location: string;
    description: string;
    status: string;
}

interface Props {
    rooms: Room[];
    pagination?: Pagination;
    filters: Filters;
    can?: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rooms', href: '/rooms' },
];

const initialFormState: RoomForm = {
    name: '',
    location: '',
    description: '',
    status: 'active',
};

// Per page options
const perPageOptions = [10, 20, 50, 100];

// Status options for dropdowns
const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
];

export default function Rooms({
    rooms = [],
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
        status: 'all',
        perPage: 10
    },
    can
}: Props) {
    const canCreateRooms = can?.create || false;
    const canEditRooms = can?.edit || false;
    const canDeleteRooms = can?.delete || false;

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Local state for filters
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);
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

        router.get('/rooms', {
            search: searchTerm,
            status: statusFilter,
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
            status: statusFilter !== 'all' ? statusFilter : undefined,
            perPage: perPage !== 10 ? perPage : undefined,
            page: 1,
        };

        router.visit('/rooms', {
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
        setSearchTerm('');
        setStatusFilter('all');
        setPerPage(10);

        router.visit('/rooms', {
            method: 'get',
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsFilterOpen(false);
                setIsLoading(false);
            }
        });
    };

    const handleAddRoom = () => {
        post('/rooms', {
            onSuccess: () => {
                setIsAddDialogOpen(false);
                reset();
                toast.success('Room added successfully!');
            },
        });
    };

    const handleEditRoom = (room: Room) => {
        setCurrentRoom(room);
        setData({
            name: room.name,
            location: room.location,
            description: room.description || '',
            status: room.status,
        });
        setIsEditDialogOpen(true);
    };

    const handleViewRoom = (room: Room) => {
        setCurrentRoom(room);
        setIsViewDialogOpen(true);
    };

    const handleUpdateRoom = () => {
        if (!currentRoom) return;

        put(`/rooms/${currentRoom.id}`, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setCurrentRoom(null);
                toast.success('Room updated successfully!');
            },
        });
    };

    const handleDeleteRoom = (id: number) => {
        setRoomToDelete(id);
        setDeleteError(null);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (roomToDelete === null) return;

        destroy(`/rooms/${roomToDelete}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setRoomToDelete(null);
                toast.success('Room deleted successfully!');
            },
            onError: (errors) => {
                if (errors.error) {
                    setDeleteError(errors.error);
                } else {
                    setShowDeleteDialog(false);
                    toast.error('Failed to delete room.');
                }
            }
        });
    };

    const openAddDialog = () => {
        reset();
        setData({ ...initialFormState });
        setIsAddDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setCurrentRoom(null);
    };

    // Sync local state with props
    useEffect(() => {
        setSearchTerm(filters.search);
        setStatusFilter(filters.status);
        setPerPage(filters.perPage);
    }, [filters]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Room Management" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Room Management</h1>
                        <p className="text-muted-foreground">Manage your rooms and storage locations</p>
                    </div>
                    {canCreateRooms && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="flex items-center cursor-pointer" onClick={openAddDialog}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Room
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Add New Room</DialogTitle>
                                                <DialogDescription>
                                                    Fill in the details to add a new room for your inventory management.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">Room Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        placeholder="Enter room name"
                                                    />
                                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="location">Location</Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        onChange={(e) => setData('location', e.target.value)}
                                                        placeholder="Enter room location"
                                                    />
                                                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="description">Description (Optional)</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={data.description}
                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                            setData('description', e.target.value)
                                                        }
                                                        placeholder="Enter room description"
                                                        rows={3}
                                                    />
                                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
                                                <Button onClick={handleAddRoom} disabled={processing} className="cursor-pointer">
                                                    Add Room
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Add a new room</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <CardTitle>All Rooms</CardTitle>

                            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                                {/* Search input */}
                                <div className="relative w-full md:w-64">
                                    <Input
                                        placeholder="Search rooms..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                </div>

                                {/* Filter button */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="relative">
                                                        <Filter className="h-4 w-4 mr-2" />
                                                        Filter
                                                        {statusFilter && statusFilter !== 'all' && (
                                                            <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-primary h-5 w-5 p-0 flex items-center justify-center">
                                                                <span className="text-xs">1</span>
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
                                                                className="h-8 px-2 text-xs"
                                                            >
                                                                Reset filters
                                                            </Button>
                                                        </div>

                                                        {/* Status filter */}
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

                                                        {/* Apply button */}
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
                                            <p>Filter rooms</p>
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
                                        <TableHead>Room Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rooms.length > 0 ? (
                                        rooms.map((room) => (
                                            <TableRow key={room.id}>
                                                <TableCell className="font-medium">{room.name}</TableCell>
                                                <TableCell>{room.location}</TableCell>
                                                <TableCell>
                                                    {room.description ?
                                                        (room.description.length > 50 ?
                                                            `${room.description.substring(0, 50)}...` :
                                                            room.description) :
                                                        <span className="text-gray-400 italic">No description</span>
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${room.status === 'Active'
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                            }`}
                                                        variant="outline"
                                                    >
                                                        {room.status === 'Active' ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{room.items_count}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(room.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
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
                                                                        onClick={() => handleViewRoom(room)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>View room details</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {canEditRooms && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => handleEditRoom(room)}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Edit this room</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}

                                                        {canDeleteRooms && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => handleDeleteRoom(room.id)}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Delete this room</p>
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
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                {(searchTerm || statusFilter !== 'all') ? (
                                                    <>
                                                        <div className="flex flex-col items-center justify-center">
                                                            <Filter className="h-8 w-8 text-gray-400 mb-2" />
                                                            <p>No rooms match your current filters or search terms.</p>
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
                                                            <MapPin className="h-8 w-8 text-gray-400 mb-2" />
                                                            <p>No rooms available</p>
                                                            {canCreateRooms && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={openAddDialog}
                                                                    className="mt-2 cursor-pointer"
                                                                >
                                                                    Add your first room
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

                {/* View Room Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MapPin className="h-6 w-6" />
                                Room Details
                            </DialogTitle>
                        </DialogHeader>
                        {currentRoom && (
                            <div className="py-4 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Room Name</p>
                                    <p className="text-lg font-semibold">{currentRoom.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                                    <p className="text-base">{currentRoom.location}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    {currentRoom.description ? (
                                        <p className="text-base">{currentRoom.description}</p>
                                    ) : (
                                        <p className="text-base italic text-muted-foreground">No description provided</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge
                                        className={`text-sm w-fit ${currentRoom.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-200'
                                            }`}
                                        variant="outline"
                                    >
                                        {currentRoom.status === 'active' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Items Count</p>
                                    <Badge variant="secondary" className="text-sm">
                                        {currentRoom.items_count} item(s)
                                    </Badge>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Created At</p>
                                        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                                            <p className="font-medium">
                                                {new Date(currentRoom.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                            <div className="flex items-center text-muted-foreground gap-1">
                                                <span className="hidden md:inline">|</span>
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {new Date(currentRoom.created_at).toLocaleTimeString('id-ID', {
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
                                                {new Date(currentRoom.updated_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                            <div className="flex items-center text-muted-foreground gap-1">
                                                <span className="hidden md:inline">|</span>
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {new Date(currentRoom.updated_at).toLocaleTimeString('id-ID', {
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
                {canEditRooms && (
                    <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Room</DialogTitle>
                                <DialogDescription>
                                    Update the details of the selected room.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Room Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input
                                        id="edit-location"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                    />
                                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-description">Description (Optional)</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={data.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setData('description', e.target.value)
                                        }
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
                                <Button onClick={handleUpdateRoom} disabled={processing} className="cursor-pointer">
                                    Update Room
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
                                This action cannot be undone. This will permanently delete the room from your system.
                                {deleteError && (
                                    <p className="mt-2 text-red-600 font-medium">{deleteError}</p>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 focus:ring-red-600 cursor-pointer"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </AppLayout>
    );
}