import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

/** ========== User & Auth ========== */
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface Auth {
  user: User;
  role: 'admin' | 'staff' | 'viewer';
}

/** ========== Layout & Navigation ========== */
export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  [key: string]: any;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
  visible?: (auth: Auth) => boolean;  // Add the 'visible' property
}


export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** ========== Shared Inertia Props ========== */
export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  ziggy: Config & { location: string };
  sidebarOpen: boolean;
  [key: string]: unknown;
}

/** ========== Inventory & Management ========== */
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  status: string;
}

export interface Category {
  id: number;
  name: string;
  itemCount: number;
  description: string;
}

export interface ActivityLog {
  id: number;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}
