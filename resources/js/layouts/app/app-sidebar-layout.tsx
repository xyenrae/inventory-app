import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { Copyright } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
                <footer className="p-2 text-center items-center justify-center flex gap-1 text-xs text-muted-foreground">
                    <Copyright className="w-3 h-3" />
                    <span>{new Date().getFullYear()} xyenrae. All rights reserved.</span>
                </footer>
            </AppContent>
        </AppShell>
    );
}
