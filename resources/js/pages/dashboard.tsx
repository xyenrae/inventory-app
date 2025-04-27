import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutGrid,
  Package,
  FolderOpen,
  AlertTriangle,
  Activity,
  Clock,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  AlertCircle
} from 'lucide-react';
import { toast } from "sonner";
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard';
import { RecentActivitiesList } from '@/components/dashboard/RecentActivitiesList';
import { ActivityTrendChart } from '@/components/dashboard/ActivityTrendChart';
import { InventoryStatusChart } from '@/components/dashboard/InventoryStatusChart';
import { CategoryDistributionChart } from '@/components/dashboard/CategoryDistributionChart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface DashboardProps {
  stats: {
    users: number;
    items: number;
    categories: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  categoryDistribution: {
    name: string;
    count: number;
  }[];
  recentActivities: {
    id: number;
    log_name: string;
    description: string;
    created_at: string;
    causer: {
      id: number;
      name: string;
    } | null;
  }[];
  activityTrends: {
    '7d': { date: string; count: number }[];
    '30d': { date: string; count: number }[];
    '90d': { date: string; count: number }[];
    'all': { date: string; count: number }[];
  };
  inventoryStatus: {
    name: string;
    value: number;
  }[];
  can: {
    view_users: boolean;
    view_items: boolean;
    view_categories: boolean;
    view_activity_logs: boolean;
  };
}


const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({ stats, categoryDistribution, recentActivities, activityTrends, inventoryStatus, can }: DashboardProps) {
  // Extract permission for cleaner code
  const canViewActivityLogs = can.view_activity_logs;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your inventory management dashboard.</p>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <DashboardMetricCard
            title="Total Items"
            value={stats.items}
            description="Inventory items"
            icon={<Package className="h-6 w-6 text-green-600" />}
            color="bg-green-50"
            href="/inventory"
          />
          <DashboardMetricCard
            title="Categories"
            value={stats.categories}
            description="Item categories"
            icon={<FolderOpen className="h-6 w-6 text-purple-600" />}
            color="bg-purple-50"
            href="/categories"
          />
          <DashboardMetricCard
            title="Low Stock"
            value={stats.lowStockItems}
            description="Items running low"
            icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
            color="bg-amber-50"
            href="/inventory?page=1&status=Low%20Stock"
          />
          <DashboardMetricCard
            title="Out of Stock"
            value={stats.outOfStockItems}
            description="Items to reorder"
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            color="bg-red-50"
            href="/inventory?page=1&status=Out%20of%20Stock"
          />
        </div>

        {/* Tabs for Charts and Activity */}
        <Tabs defaultValue={canViewActivityLogs ? "overview" : "inventory"} className="mb-6">
          {canViewActivityLogs && (
            <TabsList className="mb-4 p-1 rounded-lg">
              <TabsTrigger
                value="overview"
                className="transition-all cursor-pointer duration-200 hover:bg-white/90 dark:hover:bg-gray-700/90 data-[state=active]:shadow-sm"
              >
                <LayoutGrid className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                <span className="transition-colors duration-200 group-hover:text-primary">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="transition-all cursor-pointer duration-200 hover:bg-white/90 dark:hover:bg-gray-700/90 data-[state=active]:shadow-sm"
              >
                <PieChartIcon className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                <span className="transition-colors duration-200 group-hover:text-primary">Inventory</span>
              </TabsTrigger>
              {/* Only show Activity tab if user has permission */}
              <TabsTrigger
                value="activity"
                className="transition-all cursor-pointer duration-200 hover:bg-white/90 dark:hover:bg-gray-700/90 data-[state=active]:shadow-sm"
              >
                <Activity className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                <span className="transition-colors duration-200 group-hover:text-primary">Activity</span>
              </TabsTrigger>
            </TabsList>
          )}
          {canViewActivityLogs && (
            <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Only show Activity Trends if user has permission */}
                <Card>
                  <CardContent>
                    <ActivityTrendChart data={activityTrends} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChartIcon className="h-4 w-4 mr-2" />
                      Inventory Status
                    </CardTitle>
                    <CardDescription>Current stock levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InventoryStatusChart data={inventoryStatus} />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChartIcon className="h-4 w-4 mr-2" />
                      Top Categories
                    </CardTitle>
                    <CardDescription>Items by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CategoryDistributionChart data={categoryDistribution} />
                  </CardContent>
                </Card>

                {/* Recent Activities card for Overview tab */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Activities
                    </CardTitle>
                    <CardDescription>Latest system activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {canViewActivityLogs ? (
                      <RecentActivitiesList activities={recentActivities} />
                    ) : (
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-yellow-800">Access Restricted</h3>
                          <p className="text-yellow-700 text-sm">
                            You don't have permission to view activity logs. Please contact your administrator if you need access.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          <TabsContent value="inventory" className="animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                  <CardDescription>Current stock levels</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <InventoryStatusChart data={inventoryStatus} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Items by category</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <CategoryDistributionChart data={categoryDistribution} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Only render Activity tab content if user has permission */}
          {canViewActivityLogs && (
            <TabsContent value="activity" className="animate-in fade-in-50 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Trends</CardTitle>
                  <CardDescription>System activities over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ActivityTrendChart data={activityTrends} />
                </CardContent>
              </Card>

              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivitiesList activities={recentActivities} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}