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
    title?: string;
}

export function RecentActivitiesList({ activities, title = "Recent Activities" }: RecentActivitiesListProps) {
    // Function to get badge color based on log_name
    const getBadgeColor = (logName: string) => {
        const logNameLower = logName.toLowerCase();

        if (logNameLower.includes('create') || logNameLower.includes('add')) {
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
        } else if (logNameLower.includes('delete') || logNameLower.includes('remove')) {
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        } else if (logNameLower.includes('update') || logNameLower.includes('edit')) {
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        } else if (logNameLower.includes('login') || logNameLower.includes('auth')) {
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        }

        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md transition duration-200">
            <div className="space-y-3">
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <p className="text-sm">No recent activities</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 rounded-lg bg-gray-50 dark:bg-gray-850"
                        >
                            {/* Activity Icon - adjust based on log_name */}
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                {activity.log_name.toLowerCase().includes('create') && (
                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                )}
                                {activity.log_name.toLowerCase().includes('update') && (
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                )}
                                {activity.log_name.toLowerCase().includes('delete') && (
                                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                )}
                                {/* Default icon for other actions */}
                                {!activity.log_name.toLowerCase().includes('create') &&
                                    !activity.log_name.toLowerCase().includes('update') &&
                                    !activity.log_name.toLowerCase().includes('delete') && (
                                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    )}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                                    {activity.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${getBadgeColor(activity.log_name)}`}>
                                        {activity.log_name}
                                    </span>

                                    <span className="text-xs flex items-center text-gray-500 dark:text-gray-400">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        {activity.causer ? activity.causer.name : 'System'}
                                    </span>

                                    <span className="text-xs flex items-center text-gray-500 dark:text-gray-400">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}