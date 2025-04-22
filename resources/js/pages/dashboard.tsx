// resources/js/pages/Dashboard.tsx
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Package, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

const Dashboard = () => {
  const stats = [
    { title: 'Total Items', value: '842', icon: Package, color: 'bg-blue-500' },
    { title: 'Low Stock Items', value: '12', icon: BarChart, color: 'bg-yellow-500' },
    { title: 'Categories', value: '24', icon: Calendar, color: 'bg-green-500' },
    { title: 'Users', value: '6', icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      
      <div className="flex flex-col gap-6 p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">New item added</p>
                    <p className="text-sm text-gray-500">Laptop - Dell XPS 15</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </li>
                <li className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Stock updated</p>
                    <p className="text-sm text-gray-500">Printer Paper - 10 units added</p>
                  </div>
                  <span className="text-sm text-gray-500">5 hours ago</span>
                </li>
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Category created</p>
                    <p className="text-sm text-gray-500">New category "Office Supplies"</p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Printer Ink (Black)</p>
                    <p className="text-sm text-gray-500">2 units left</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">Low</span>
                </li>
                <li className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">USB-C Cables</p>
                    <p className="text-sm text-gray-500">5 units left</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Warning</span>
                </li>
                <li className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">HDMI Adapters</p>
                    <p className="text-sm text-gray-500">3 units left</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">Low</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
