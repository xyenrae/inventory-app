// resources/js/pages/ActivityLogs.tsx
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Activity Logs',
    href: '/logs',
  },
];

// Mock data for activity logs
const initialLogs = [
  { id: 1, user: 'John Doe', action: 'Added Item', details: 'Added new item: Laptop - Dell XPS 15', timestamp: '2023-04-22 10:30:45' },
  { id: 2, user: 'Jane Smith', action: 'Updated Stock', details: 'Updated quantity for Printer Ink: 10 → 12', timestamp: '2023-04-22 09:15:22' },
  { id: 3, user: 'Admin', action: 'User Created', details: 'Created new user: Mike Johnson', timestamp: '2023-04-21 16:45:10' },
  { id: 4, user: 'John Doe', action: 'Category Created', details: 'Created new category: Kitchen Supplies', timestamp: '2023-04-21 14:22:30' },
  { id: 5, user: 'Mike Johnson', action: 'Item Deleted', details: 'Deleted item: Whiteboard (old)', timestamp: '2023-04-20 11:05:18' },
];

export default function ActivityLogs() {
  const [logs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activity Logs" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>System Activity Logs</CardTitle>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((action, idx) => (
                      <SelectItem key={idx} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          log.action === 'Added Item' || log.action === 'Category Created' || log.action === 'User Created'
                            ? 'bg-green-100 text-green-800'
                            : log.action === 'Updated Stock'
                            ? 'bg-blue-100 text-blue-800'
                            : log.action === 'Item Deleted'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
