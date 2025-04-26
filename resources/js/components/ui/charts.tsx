// file: components/ui/charts.tsx
import React, { ReactNode } from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface ChartProps {
    data: any[];
    height?: number;
    children?: ReactNode;
}

export function LineChart({ data, height = 300, children }: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 20,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none',
                    }}
                />
                {children || <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}

export function BarChart({ data, height = 300, children }: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 20,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none',
                    }}
                />
                {children || <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}

export function PieChart({ data, height = 300 }: ChartProps) {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart
                margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 20,
                }}
            >
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
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: 'none',
                    }}
                />
                <Legend />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}