import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ActivityTrendChartProps {
    data: {
        date: string;
        count: number;
    }[];
}

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
    const formattedData = data.map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'MMM dd')
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={formattedData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                        }}
                        formatter={(value) => [`${value} activities`, 'Count']}
                        labelFormatter={(label) => label}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#6366F1"
                        fill="#EEF2FF"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}