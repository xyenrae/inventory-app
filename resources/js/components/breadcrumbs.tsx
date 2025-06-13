import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerClose,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Fragment } from 'react';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;

    const roleInfo = {
        admin: {
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            title: "Administrator",
            description: "Full access to all system features",
            capabilities: [
                "View dashboard",
                "Export items",
                "Manage transactions",
                "Create, read, update, and delete items (CRUD for items)",
                "Create, read, update, and delete categories (CRUD for categories)",
                "Create, read, update, and delete rooms (CRUD for rooms)",
                "Create, read, update, and delete users (CRUD for users)",
                "View activity logs",
            ]
        },
        staff: {
            color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            title: "Staff Member",
            description: "Standard operational access",
            capabilities: [
                "View dashboard",
                "Export items",
                "Manage transactions",
                "Create, read, update items (CRU for items)",
                "Create, read, update categories (CRU for categories)",
                "Create, read, update rooms (CRU for rooms)",
            ]
        },
        viewer: {
            color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
            title: "Viewer",
            description: "Read-only access",
            capabilities: [
                "View dashboard",
                "Export items",
                "Read items",
                "Read categories",
                "Read rooms",
            ]
        }
    };

    const currentRole = auth?.role ? roleInfo[auth.role] || {
        color: "bg-gray-100 text-gray-800",
        title: auth.role.charAt(0).toUpperCase() + auth.role.slice(1),
        description: "Custom role with specific permissions",
        capabilities: ["Custom set of permissions"]
    } : null;

    return (
        <div className="flex justify-between w-full items-center">
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href}>{item.title}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
            <div>
                {currentRole && (
                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-3 hover:cursor-pointer">
                                <Badge className={`${currentRole.color} text-xs font-medium py-1`}>
                                    {currentRole.title}
                                </Badge>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="mx-auto w-full max-w-sm">
                                <DrawerHeader>
                                    <DrawerTitle className="text-center">Your Access Level</DrawerTitle>
                                    <DrawerDescription className="text-center">
                                        <Badge className={`${currentRole.color} text-sm mb-2 mt-1`}>
                                            {currentRole.title}
                                        </Badge>
                                        <p className="mt-2">{currentRole.description}</p>
                                    </DrawerDescription>
                                </DrawerHeader>
                                <div className="p-4 pb-0">
                                    <h4 className="text-sm font-medium mb-2">What you can do:</h4>
                                    <ul className="space-y-2">
                                        {currentRole.capabilities.map((capability, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary"></div>
                                                <span className="text-sm">{capability}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <DrawerFooter>
                                    <DrawerClose asChild>
                                        <Button variant="outline">Close</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </div>
                        </DrawerContent>
                    </Drawer>
                )}
            </div>
        </div>


    );
}