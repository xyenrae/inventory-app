import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface InventoryStatusChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

export function InventoryStatusChart({ data }: InventoryStatusChartProps) {
    const COLORS = ['#4ADE80', '#FACC15', '#F43F5E'];

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value} items`, 'Count']}
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}