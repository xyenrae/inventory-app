import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { User, UserCircle } from 'lucide-react';
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

interface UserRole {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: UserRole[];
}

interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface Filters {
  search: string;
  role: string;
  perPage: number;
}

interface Props {
  users: User[];
  roles: UserRole[];
  pagination?: Pagination;
  filters: Filters;
  can?: {
    view_users: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/users' },
];

const initialFormState: UserForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'staff',
};

// Per page options
const perPageOptions = [10, 20, 50, 100];

export default function Users({
  users = [],
  roles = [],
  pagination = {
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    links: []
  },
  filters = {
    search: '',
    role: 'all',
    perPage: 10
  },
  can
}: Props) {
  const canViewUsers = can?.view_users || false;
  const canCreateUsers = can?.create || false;
  const canEditUsers = can?.edit || false;
  const canDeleteUsers = can?.delete || false;

  // At the top of your component
  const { flash } = usePage().props as any;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [roleFilter, setRoleFilter] = useState(filters.role);
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

    router.get('/users', {
      search: searchTerm,
      role: roleFilter,
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
      role: roleFilter !== 'all' ? roleFilter : undefined,
      perPage: perPage !== 10 ? perPage : undefined,
      page: 1,
    };

    router.visit('/users', {
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
    setRoleFilter('all');
    setPerPage(10);

    router.visit('/users', {
      method: 'get',
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsFilterOpen(false);
        setIsLoading(false);
      }
    });
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value);
    setPerPage(newPerPage);

    router.visit('/users', {
      method: 'get',
      data: {
        search: searchTerm,
        role: roleFilter,
        perPage: newPerPage,
        page: 1, // Reset to first page when changing items per page
      },
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleAddUser = () => {
    post('/users', {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        reset();
        toast.success('User added successfully!');
      },
    });
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.roles[0]?.name || 'staff',
    });
    setIsEditDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setCurrentUser(user);
    setIsViewDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!currentUser) return;

    put(`/users/${currentUser.id}`, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setCurrentUser(null);
        toast.success('User updated successfully!');
      },
    });
  };

  const handleDeleteUser = (id: number) => {
    setUserToDelete(id);
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (userToDelete === null) return;

    destroy(`/users/${userToDelete}`, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setUserToDelete(null);
        // Success message is handled by the flash message
      },
      onError: (errors) => {
        // Standard validation errors
        setShowDeleteDialog(false);
        toast.error('Failed to delete user.');
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
    setCurrentUser(null);
  };

  // Generate pagination range
  const getPaginationRange = () => {
    if (!pagination) return [1];

    const currentPage = pagination.current_page;
    const lastPage = pagination.last_page;
    const delta = 2; // Number of pages to show before and after current page

    let range = [];

    // Always show first page
    range.push(1);

    // Calculate start and end of the range
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(lastPage - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      range.push(-1); // -1 represents ellipsis
    }

    // Add pages in the middle
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < lastPage - 1) {
      range.push(-2); // -2 represents ellipsis (using different value to avoid React key issues)
    }

    // Always show last page if it's not the first page
    if (lastPage > 1) {
      range.push(lastPage);
    }

    return range;
  };

  // Sync local state with props
  useEffect(() => {
    setSearchTerm(filters.search);
    setRoleFilter(filters.role);
    setPerPage(filters.perPage);
  }, [filters]);

  useEffect(() => {
    if (flash?.error) {
      toast.error(flash.error);
      // If the delete dialog is open, also show the error there
      if (showDeleteDialog) {
        setDeleteError(flash.error);
      }
    }

    if (flash?.success) {
      toast.success(flash.success);
    }
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="User Management" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          {canCreateUsers && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center cursor-pointer" onClick={openAddDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Fill in the details to add a new user to the system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter user's name"
                          />
                          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter user's email"
                          />
                          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter password"
                          />
                          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password_confirmation">Confirm Password</Label>
                          <Input
                            id="password_confirmation"
                            type={showPassword ? "text" : "password"}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="show-password"
                            className="mr-2"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                          />
                          <Label htmlFor="show-password" className="text-sm cursor-pointer">
                            Show password
                          </Label>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.name}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddUser} disabled={processing} className="cursor-pointer">
                          Add User
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new user</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Card>
          {canViewUsers
            ? <>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <CardTitle>All Users</CardTitle>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                    {/* Search input */}
                    <div className="relative w-full md:w-64">
                      <Input
                        placeholder="Search users..."
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
                                {roleFilter && roleFilter !== 'all' && (
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

                                {/* Role filter */}
                                <div className="space-y-2">
                                  <Label htmlFor="role-filter">Role</Label>
                                  <Select
                                    value={roleFilter}
                                    onValueChange={setRoleFilter}
                                  >
                                    <SelectTrigger id="role-filter">
                                      <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All roles</SelectItem>
                                      {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                          {role.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Apply button */}
                                <Button
                                  className="w-full mt-4"
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
                          <p>Filter users</p>
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map(role => (
                                  <Badge
                                    key={role.id}
                                    className={`${role.name === 'admin'
                                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                      : role.name === 'staff'
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                      }`}
                                    variant="outline"
                                  >
                                    {role.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">No role</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString('id-ID', {
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
                                        onClick={() => handleViewUser(user)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View user details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {canEditUsers && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => handleEditUser(user)}
                                          className="cursor-pointer"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit this user</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}

                                {canDeleteUsers && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="cursor-pointer"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete this user</p>
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
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            {(searchTerm || roleFilter !== 'all') ? (
                              <>
                                <div className="flex flex-col items-center justify-center">
                                  <Filter className="h-8 w-8 text-gray-400 mb-2" />
                                  <p>No users match your current filters or search terms.</p>
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
                                  <UserCircle className="h-8 w-8 text-gray-400 mb-2" />
                                  <p>No users available</p>
                                  {canCreateUsers && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={openAddDialog}
                                      className="mt-2 cursor-pointer"
                                    >
                                      Add your first user
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
              {pagination && pagination.total > 0 && (
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{pagination.from}</span> to{" "}
                    <span className="font-medium">{pagination.to}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span> users
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Select
                        value={perPage?.toString() ?? '10'}
                        onValueChange={handlePerPageChange}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={(perPage || 10).toString()} />
                        </SelectTrigger>
                        <SelectContent>
                          {perPageOptions.map(option => (
                            <SelectItem key={option} value={option.toString()}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="ml-2 text-sm text-muted-foreground">per page</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => goToPage(1)}
                              disabled={pagination.current_page === 1 || isLoading}
                            >
                              <ChevronsLeft className="h-4 w-4" />
                              <span className="sr-only">First page</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>First page</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => goToPage(pagination.current_page - 1)}
                              disabled={pagination.current_page === 1 || isLoading}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span className="sr-only">Previous page</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Previous page</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <div className="hidden sm:flex items-center space-x-1">
                        {getPaginationRange().map((page, index) => (
                          page < 0 ? (
                            <span key={`ellipsis-${index}`} className="px-2">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={pagination.current_page === page ? "default" : "outline"}
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => goToPage(page)}
                              disabled={isLoading}
                            >
                              {page}
                            </Button>
                          )
                        ))}
                      </div>

                      <div className="sm:hidden">
                        <span className="text-sm font-medium">
                          Page {pagination.current_page} of {pagination.last_page}
                        </span>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => goToPage(pagination.current_page + 1)}
                              disabled={pagination.current_page === pagination.last_page || isLoading}
                            >
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">Next page</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Next page</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => goToPage(pagination.last_page)}
                              disabled={pagination.current_page === pagination.last_page || isLoading}
                            >
                              <ChevronsRight className="h-4 w-4" />
                              <span className="sr-only">Last page</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Last page</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardFooter>
              )}
            </>

            : <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Access Restricted</h3>
                <p className="text-yellow-700 text-sm">
                  You don't have permission to view activity logs. Please contact your administrator if you need access.
                </p>
              </div>
            </div>
          }
        </Card>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                User Details
              </DialogTitle>
            </DialogHeader>
            {currentUser && (
              <div className="py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{currentUser.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{currentUser.email}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.roles && currentUser.roles.map(role => (
                      <Badge
                        key={role.id}
                        className={`${role.name === 'admin'
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          : role.name === 'staff'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        variant="outline"
                      >
                        {role.name}
                      </Badge>
                    ))
                    }
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Registered</p>
                      <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                        <p className="font-medium">
                          {new Date(currentUser.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <div className="flex items-center text-muted-foreground gap-1">
                          <span className="hidden md:inline">|</span>
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(currentUser.created_at).toLocaleTimeString('id-ID', {
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
                          {new Date(currentUser.updated_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <div className="flex items-center text-muted-foreground gap-1">
                          <span className="hidden md:inline">|</span>
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(currentUser.updated_at).toLocaleTimeString('id-ID', {
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
        {canEditUsers && (
          <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update the details of the selected user.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">Password (Leave blank to keep unchanged)</Label>
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Enter new password"
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password-confirmation">Confirm Password</Label>
                  <Input
                    id="edit-password-confirmation"
                    type={showPassword ? "text" : "password"}
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-show-password"
                    className="mr-2"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <Label htmlFor="edit-show-password" className="text-sm cursor-pointer">
                    Show password
                  </Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={data.role}
                    onValueChange={(value) => setData('role', value)}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateUser} disabled={processing} className="cursor-pointer">
                  Update User
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
                This action cannot be undone. This will permanently delete the user from your system.
                {deleteError && (
                  <p className="mt-2 text-red-600 font-medium">{deleteError}</p>
                )}
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