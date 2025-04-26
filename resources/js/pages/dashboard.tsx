import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutGrid,
  Users,
  Package,
  FolderOpen,
  AlertTriangle,
  Activity,
  Clock,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
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
    date: string;
    count: number;
  }[];
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
            title="Total Users"
            value={stats.users}
            description="Registered users"
            icon={<Users className="h-6 w-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <DashboardMetricCard
            title="Total Items"
            value={stats.items}
            description="Inventory items"
            icon={<Package className="h-6 w-6 text-green-600" />}
            color="bg-green-50"
          />
          <DashboardMetricCard
            title="Categories"
            value={stats.categories}
            description="Item categories"
            icon={<FolderOpen className="h-6 w-6 text-purple-600" />}
            color="bg-purple-50"
          />
          <DashboardMetricCard
            title="Low Stock Alert"
            value={stats.lowStockItems + stats.outOfStockItems}
            description={`${stats.outOfStockItems} out of stock`}
            icon={<AlertTriangle className="h-6 w-6 text-orange-600" />}
            color="bg-orange-50"
          />
        </div>

        {/* Tabs for Charts and Activity */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="mb-4 p-1  rounded-lg">
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
            <TabsTrigger
              value="activity"
              className="transition-all cursor-pointer duration-200 hover:bg-white/90 dark:hover:bg-gray-700/90 data-[state=active]:shadow-sm"
            >
              <Activity className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
              <span className="transition-colors duration-200 group-hover:text-primary">Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChartIcon className="h-4 w-4 mr-2" />
                    Activity Trends
                  </CardTitle>
                  <CardDescription>User activities over the past 7 days</CardDescription>
                </CardHeader>
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

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent Activities
                  </CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivitiesList activities={recentActivities} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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

            {stats.lowStockItems + stats.outOfStockItems > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have {stats.lowStockItems} items with low stock and {stats.outOfStockItems} items out of stock.
                  <a href="/inventory" className="font-medium underline ml-1">Check inventory</a>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

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

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivitiesList activities={recentActivities} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}