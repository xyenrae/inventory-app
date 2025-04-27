import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    BarProps
} from 'recharts';

interface CategoryDistributionChartProps {
    data: {
        name: string;
        count: number;
    }[];
}

// Tipe untuk CustomBar props (pakai Partial supaya fleksibel)
interface CustomBarProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
}

// Custom component for bar
const CustomBar = ({ x = 0, y = 0, width = 0, height = 0, fill = '#ffffff' }: CustomBarProps) => {
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={0} ry={0} />;
};

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        formatter={(value) => [`${value} items`, 'Count']}
                        contentStyle={{
                            backgroundColor: 'black',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                        }}
                    />
                    <Bar
                        dataKey="count"
                        fill="#fff"
                        radius={[0, 4, 4, 0]}
                        shape={<CustomBar />}
                        isAnimationActive={false}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
