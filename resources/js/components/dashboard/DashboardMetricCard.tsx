import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface DashboardMetricCardProps {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
    color: string;
    href: string;
}

export function DashboardMetricCard({ title, value, description, icon, color, href }: DashboardMetricCardProps) {
    return (
        <Link href={href}>
            <Card className="transition-all duration-200 hover:shadow-md group hover:border-white/20">
                <CardContent>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>
                            <h3 className="text-2xl font-bold mt-1">{value.toLocaleString()}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                            <div className="flex items-center mt-3 text-xs font-medium text-primary transition-opacity duration-200">
                                <span>View details</span>
                                <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${color} transition-transform duration-200 shadow-sm`}>
                            {icon}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link >
    );
}