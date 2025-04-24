import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Package, Folder } from 'lucide-react';
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

interface Category {
  id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
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
  status: string;
  perPage: number;
}

interface Props {
  categories: Category[];
  pagination?: Pagination;
  filters: Filters;
  can?: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface CategoryForm {
  name: string;
  description: string;
  status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Categories', href: '/categories' },
];

const initialFormState: CategoryForm = {
  name: '',
  description: '',
  status: 'Active',
};

// Per page options
const perPageOptions = [10, 20, 50, 100];

// Status options for dropdowns
const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

export default function Categories({
  categories = [],
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
  const canCreateCategories = can?.create || false;
  const canEditCategories = can?.edit || false;
  const canDeleteCategories = can?.delete || false;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
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

    router.get('/categories', {
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

    router.visit('/categories', {
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

    router.visit('/categories', {
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

    router.visit('/categories', {
      method: 'get',
      data: {
        search: searchTerm,
        status: statusFilter,
        perPage: newPerPage,
        page: 1, // Reset to first page when changing items per page
      },
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleAddCategory = () => {
    post('/categories', {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        reset();
        toast.success('Category added successfully!');
      },
    });
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setData({
      name: category.name,
      description: category.description || '',
      status: category.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsViewDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!currentCategory) return;

    put(`/categories/${currentCategory.id}`, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setCurrentCategory(null);
        toast.success('Category updated successfully!');
      },
    });
  };

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete === null) return;

    destroy(`/categories/${categoryToDelete}`, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
        toast.success('Category deleted successfully!');
      },
      onError: (errors) => {
        if (errors.error) {
          setDeleteError(errors.error);
        } else {
          setShowDeleteDialog(false);
          toast.error('Failed to delete category.');
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
    setCurrentCategory(null);
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
    setStatusFilter(filters.status);
    setPerPage(filters.perPage);
  }, [filters]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Category Management" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Category Management</h1>
          {canCreateCategories && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center cursor-pointer" onClick={openAddDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                          Fill in the details to add a new category for your inventory items.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Category Name</Label>
                          <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter category name"
                          />
                          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setData('description', e.target.value)
                            }
                            placeholder="Enter category description"
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
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddCategory} disabled={processing} className="cursor-pointer">
                          Add Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new category</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Categories</CardTitle>
              <div className="flex space-x-2">
                <div className="relative w-64">
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="cursor-pointer">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                            {statusFilter && statusFilter !== 'all' && (
                              <Badge className="ml-2 bg-primary h-5 w-5 p-0 flex items-center justify-center">
                                <span className="text-xs">1</span>
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>
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

                            <div className="space-y-2">
                              <Label htmlFor="status-filter">Status</Label>
                              <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                  setStatusFilter(value);
                                }}
                              >
                                <SelectTrigger id="status-filter">
                                  <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All statuses</SelectItem>
                                  {statusOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Button
                              className="w-full cursor-pointer mt-4"
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
                      <p>Filter categories</p>
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
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          {category.description ?
                            (category.description.length > 50 ?
                              `${category.description.substring(0, 50)}...` :
                              category.description) :
                            <span className="text-gray-400 italic">No description</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${category.status === 'Active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            variant="outline"
                          >
                            {category.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(category.created_at).toLocaleDateString('id-ID', {
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
                                    onClick={() => handleViewCategory(category)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View category details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {canEditCategories && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditCategory(category)}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit this category</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {canDeleteCategories && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleDeleteCategory(category.id)}
                                      className="cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete this category</p>
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
                        {(searchTerm || statusFilter !== 'all') ? (
                          <>
                            <div className="flex flex-col items-center justify-center">
                              <Filter className="h-8 w-8 text-gray-400 mb-2" />
                              <p>No categories match your current filters or search terms.</p>
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
                              <Folder className="h-8 w-8 text-gray-400 mb-2" />
                              <p>No categories available</p>
                              {canCreateCategories && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={openAddDialog}
                                  className="mt-2 cursor-pointer"
                                >
                                  Add your first category
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
                <span className="font-medium">{pagination.total}</span> categories
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
        </Card>

        {/* View Category Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Folder className="h-6 w-6" />
                Category Details
              </DialogTitle>
            </DialogHeader>
            {currentCategory && (
              <div className="py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category Name</p>
                  <p className="text-lg font-semibold">{currentCategory.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  {currentCategory.description ? (
                    <p className="text-base">{currentCategory.description}</p>
                  ) : (
                    <p className="text-base italic text-muted-foreground">No description provided</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge
                    className={`text-sm w-fit ${currentCategory.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    variant="outline"
                  >
                    {currentCategory.status}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created At</p>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <p className="font-medium">
                        {new Date(currentCategory.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center text-muted-foreground gap-1">
                        <span className="hidden md:inline">|</span>
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(currentCategory.created_at).toLocaleTimeString('id-ID', {
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
                        {new Date(currentCategory.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center text-muted-foreground gap-1">
                        <span className="hidden md:inline">|</span>
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(currentCategory.updated_at).toLocaleTimeString('id-ID', {
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
        {canEditCategories && (
          <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the details of the selected category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Category Name</Label>
                  <Input
                    id="edit-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateCategory} disabled={processing} className="cursor-pointer">
                  Update Category
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
                This action cannot be undone. This will permanently delete the category from your system.
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