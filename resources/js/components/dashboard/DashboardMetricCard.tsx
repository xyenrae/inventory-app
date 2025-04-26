// file: components/dashboard/DashboardMetricCard.tsx
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardMetricCardProps {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
    color: string;
}

export function DashboardMetricCard({ title, value, description, icon, color }: DashboardMetricCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h3 className="text-2xl font-bold mt-1">{value.toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className={`p-2 rounded-full ${color}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}