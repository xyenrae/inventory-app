import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Package, Layers, Users, Activity, ArrowUpDown, HouseIcon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: ArrowUpDown,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: Layers,
  },
  {
    title: 'Rooms',
    href: '/rooms',
    icon: HouseIcon,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    visible: (auth) => auth?.role === 'admin',
  },
  {
    title: 'Activity Logs',
    href: '/activitylogs',
    icon: Activity,
    visible: (auth) => auth?.role === 'admin',
  },
];

export function AppSidebar() {
  const { auth } = usePage<SharedData>().props;

  // Filter menu items berdasarkan role
  const filteredNavItems = mainNavItems.filter(item => !item.visible || item.visible(auth));

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
