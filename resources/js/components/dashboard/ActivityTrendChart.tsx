import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TooltipProps } from 'recharts';

interface ActivityData {
    date: string;
    count: number;
}

interface ActivityTrendChartProps {
    data: {
        '7d': ActivityData[];
        '30d': ActivityData[];
        '90d': ActivityData[];
        'all': ActivityData[];
    };
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg p-3 shadow-md bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs">{payload[0].value} activities</p>
            </div>
        );
    }

    return null;
};

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
    const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'All'>('7D');
    const [chartData, setChartData] = useState<ActivityData[]>([]);
    const [totalActivities, setTotalActivities] = useState(0);
    const [averageActivities, setAverageActivities] = useState(0);

    // Set the chart data based on the selected time range
    useEffect(() => {
        const rangeMap: Record<string, keyof typeof data> = {
            '7D': '7d',
            '30D': '30d',
            '90D': '90d',
            'All': 'all'
        };

        const selectedData = data[rangeMap[timeRange]] || [];

        const processedData = selectedData.map(item => ({
            ...item,
            formattedDate: format(parseISO(item.date), 'MMM dd')
        }));

        setChartData(processedData);

        // Calculate total and average
        const total = processedData.reduce((sum, item) => sum + item.count, 0);
        setTotalActivities(total);
        setAverageActivities(processedData.length > 0 ? total / processedData.length : 0);
    }, [timeRange, data]);

    return (
        <div className="rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div>

                </div>

                <div className="flex space-x-1">
                    <button
                        onClick={() => setTimeRange('7D')}
                        className={`px-3 py-1 rounded-md text-sm ${timeRange === '7D'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                    >
                        7D
                    </button>
                    <button
                        onClick={() => setTimeRange('30D')}
                        className={`px-3 py-1 rounded-md text-sm ${timeRange === '30D'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                    >
                        30D
                    </button>
                    <button
                        onClick={() => setTimeRange('90D')}
                        className={`px-3 py-1 rounded-md text-sm ${timeRange === '90D'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                    >
                        90D
                    </button>
                    <button
                        onClick={() => setTimeRange('All')}
                        className={`px-3 py-1 rounded-md text-sm ${timeRange === 'All'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                    >
                        All
                    </button>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 20,
                        }}

                    >
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(156, 163, 175, 0.2)"
                            className="stroke-gray-400 dark:stroke-gray-700"
                        />
                        <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval="preserveStartEnd"
                            minTickGap={10}
                            className="dark:text-gray-400"
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            tickMargin={0}
                            width={20}
                            className="dark:text-gray-400"
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorGradient)"
                            activeDot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: '#ffffff',
                                fill: '#3b82f6'
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div>
                    Total: <span className="font-medium text-gray-900 dark:text-white">{totalActivities} activities</span>
                </div>
                <div>
                    Average: <span className="font-medium text-gray-900 dark:text-white">{averageActivities.toFixed(1)} per day</span>
                </div>
            </div>
        </div>
    );
}