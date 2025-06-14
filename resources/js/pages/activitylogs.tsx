import { useState, useEffect, SetStateAction } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Filter, Eye, Clock, User, Package, Folder, AlertCircle, HardDrive } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { ActivityLogDialog } from '@/components/activity-log-dialog';
import { ActivityLog, Filters, Pagination } from '@/types/activitylog';
import PaginationFooter from '@/components/pagination-footer';


interface Props {
  activity_logs: ActivityLog[];
  pagination?: Pagination;
  filters: Filters;
  log_names: string[];
  users: Array<{ id: number; name: string }>;
  can?: {
    view_activity_logs: boolean;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Activity Logs', href: '/activitylogs' },
];

// Per page options
const perPageOptions = [10, 20, 50, 100];

export default function ActivityLogs({
  activity_logs = [],
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
    log_name: 'all',
    start_date: '',
    end_date: '',
    causer_id: 'all',
    perPage: 10
  },
  log_names = [],
  users = [],
  can
}: Props) {
  const canViewActivityLogs = can?.view_activity_logs || false;

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<ActivityLog | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // Local state for filters
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [logNameFilter, setLogNameFilter] = useState(filters.log_name);
  const [startDateFilter, setStartDateFilter] = useState(filters.start_date);
  const [endDateFilter, setEndDateFilter] = useState(filters.end_date);
  const [causerFilter, setCauserFilter] = useState(filters.causer_id);
  const [perPage, setPerPage] = useState(filters?.perPage || 10);

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

    // Construct parameters consistently with applyFilters
    const params = {
      search: searchTerm || undefined,
      log_name: logNameFilter !== 'all' ? logNameFilter : undefined,
      start_date: startDateFilter || undefined,
      end_date: endDateFilter || undefined,
      causer_id: causerFilter !== 'all' ? causerFilter : undefined,
      perPage: perPage !== 10 ? perPage : undefined,
      page: page,
    };

    router.visit('/activitylogs', {
      method: 'get',
      data: params,
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
      onFinish: () => {
        setIsLoading(false);
      },
    });
  };

  // Apply all filters
  const applyFilters = () => {
    setIsLoading(true);

    const params = {
      search: searchTerm || undefined,
      log_name: logNameFilter !== 'all' ? logNameFilter : undefined,
      start_date: startDateFilter || undefined,
      end_date: endDateFilter || undefined,
      causer_id: causerFilter !== 'all' ? causerFilter : undefined,
      perPage: perPage !== 10 ? perPage : undefined,
      page: 1,
    };

    router.visit('/activitylogs', {
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
    setLogNameFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
    setCauserFilter('all');
    setPerPage(10);

    router.visit('/activitylogs', {
      method: 'get',
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setIsFilterOpen(false);
        setIsLoading(false);
      }
    });
  };

  const handleViewLog = (log: SetStateAction<ActivityLog | null>) => {
    setCurrentLog(log);
    setViewDialogOpen(true);
  };

  // Get Icon based on log_name
  const getLogIcon = (logName: string) => {
    switch (logName.toLowerCase()) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'category':
        return <Folder className="h-4 w-4" />;
      case 'item':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Get badge color based on description
  const getDescriptionBadgeColor = (description: string) => {
    if (description.includes('created')) {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (description.includes('updated')) {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    } else if (description.includes('deleted')) {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (description.includes('login')) {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    } else {
      return 'bg-gray-200 text-gray-800 hover:bg-gray-200';
    }
  };

  // Format browser info from user agent
  const formatBrowserInfo = (userAgent: string | undefined) => {
    if (!userAgent) return 'Unknown';

    // Basic browser detection
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Edg')) {
      return 'Edge';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      return 'Internet Explorer';
    } else {
      return 'Other';
    }
  };

  // Format date time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (logNameFilter !== 'all') count++;
    if (startDateFilter) count++;
    if (endDateFilter) count++;
    if (causerFilter !== 'all') count++;
    return count;
  };

  // Sync local state with props
  useEffect(() => {
    setSearchTerm(filters.search);
    setLogNameFilter(filters.log_name);
    setStartDateFilter(filters.start_date);
    setEndDateFilter(filters.end_date);
    setCauserFilter(filters.causer_id);
    setPerPage(filters.perPage);
  }, [filters]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activity Logs" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground">Track changes and actions performed across the system</p>
          </div>
        </div>

        <Card>
          {canViewActivityLogs
            ? <>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <CardTitle>System Activity History</CardTitle>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                    {/* Search input */}
                    <div className="relative w-full md:w-64">
                      <Input
                        placeholder="Search activity logs..."
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
                                {countActiveFilters() > 0 && (
                                  <Badge className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-primary h-5 w-5 p-0 flex items-center justify-center">
                                    <span className="text-xs">{countActiveFilters()}</span>
                                  </Badge>
                                )}
                              </Button>
                            </PopoverTrigger>

                            {/* Filter Popover Content */}
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                {/* Header Filter */}
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

                                {/* Log Type */}
                                <div className="space-y-2">
                                  <Label htmlFor="log-name-filter">Log Type</Label>
                                  <Select value={logNameFilter} onValueChange={setLogNameFilter}>
                                    <SelectTrigger id="log-name-filter">
                                      <SelectValue placeholder="All logs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All logs</SelectItem>
                                      {log_names.map((logName) => (
                                        <SelectItem key={logName} value={logName} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                                        >
                                          {logName.charAt(0).toUpperCase() + logName.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* User Filter */}
                                <div className="space-y-2">
                                  <Label htmlFor="user-filter">User</Label>
                                  <Select value={causerFilter} onValueChange={setCauserFilter}>
                                    <SelectTrigger id="user-filter">
                                      <SelectValue placeholder="All users" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All users</SelectItem>
                                      {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()} className='cursor-pointer px-4 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors duration-150'
                                        >
                                          {user.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Input
                                      id="start-date"
                                      type="date"
                                      value={startDateFilter}
                                      onChange={(e) => setStartDateFilter(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                      id="end-date"
                                      type="date"
                                      value={endDateFilter}
                                      onChange={(e) => setEndDateFilter(e.target.value)}
                                    />
                                  </div>
                                </div>

                                {/* Apply Filters */}
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
                          <p>Filter activity logs</p>
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
                        <TableHead>Activity</TableHead>
                        <TableHead>Log Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activity_logs.length > 0 ? (
                        activity_logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge
                                className={`${getDescriptionBadgeColor(log.description)}`}
                                variant="outline"
                              >
                                {log.description}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getLogIcon(log.log_name)}
                                <span>{log.log_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.causer ? (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{log.causer.name}</span>
                                </div>
                              ) : (
                                <div className='flex items-center gap-2'>
                                  <HardDrive className='h-4 w-4 text-gray-500' />
                                  <span className="text-gray-500 italic">System</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{formatDateTime(log.created_at)}</span>
                              </div>
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
                                        onClick={() => handleViewLog(log)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View log details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {searchTerm || logNameFilter !== 'all' || startDateFilter || endDateFilter || causerFilter !== 'all' ? (
                              <>
                                <div className="flex flex-col items-center justify-center">
                                  <Filter className="h-8 w-8 text-gray-400 mb-2" />
                                  <p>No activity logs match your current filters or search terms.</p>
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
                                  <HardDrive className="h-8 w-8 text-gray-400 mb-2" />
                                  <p>No activity logs available</p>
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



        {/* View Log Details Dialog */}
        <ActivityLogDialog
          isOpen={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          currentLog={currentLog}
        />
      </div>
    </AppLayout>
  );
}