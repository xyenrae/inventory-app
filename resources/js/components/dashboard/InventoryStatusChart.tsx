import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, PieLabelRenderProps } from 'recharts';

interface InventoryStatusChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

export function InventoryStatusChart({ data }: InventoryStatusChartProps) {
    const COLORS = ['#4ADE80', '#FACC15', '#F43F5E'];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const getColorForStatus = (status: string) => {
        switch (status) {
            case 'In Stock':
                return '#4ADE80';
            case 'Low Stock':
                return '#FACC15';
            case 'Out of Stock':
                return '#F43F5E';
            default:
                return '#8884d8';
        }
    };

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        outerRadius,
        name,
        value,
    }: PieLabelRenderProps) => {
        if (
            typeof cx !== 'number' ||
            typeof cy !== 'number' ||
            typeof midAngle !== 'number' ||
            typeof outerRadius !== 'number' ||
            typeof value !== 'number' ||
            typeof name !== 'string'
        ) {
            return null;
        }

        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 30;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        const percent = total > 0 ? Math.round((value / total) * 100) : 0;

        return (
            <text
                x={x}
                y={y}
                fill={getColorForStatus(name)}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontWeight="500"
                fontSize="14"
            >
                {`${name}: ${percent}%`}
            </text>
        );
    };

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
                        label={renderCustomizedLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="transparent"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value} items`, 'Count']}
                        contentStyle={{
                            backgroundColor: 'white',
                            color: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                            border: 'none',
                            padding: '8px 12px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
