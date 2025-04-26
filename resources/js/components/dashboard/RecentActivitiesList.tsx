import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    id: number;
    log_name: string;
    description: string;
    created_at: string;
    causer: {
        id: number;
        name: string;
    } | null;
}

interface RecentActivitiesListProps {
    activities: Activity[];
}

export function RecentActivitiesList({ activities }: RecentActivitiesListProps) {
    return (
        <div className="space-y-4">
            {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activities</p>
            ) : (
                activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                    {activity.log_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {activity.causer ? `by ${activity.causer.name}` : 'System'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}