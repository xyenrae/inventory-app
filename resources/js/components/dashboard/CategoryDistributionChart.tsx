import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CategoryDistributionChartProps {
    data: {
        name: string;
        count: number;
    }[];
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />
                    <Tooltip
                        formatter={(value) => [`${value} items`, 'Count']}
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                        }}
                    />
                    <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}