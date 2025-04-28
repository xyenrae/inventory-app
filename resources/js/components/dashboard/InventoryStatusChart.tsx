import React, { useState, useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps, TooltipProps } from 'recharts';

interface InventoryStatusChartProps {
    data: {
        name: string;
        value: number;
        description?: string;
    }[];
    title?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg p-4 shadow-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold mb-1">{payload[0].name}</p>
                <p className="text-xs font-medium">{`${payload[0].value} items`}</p>
                {payload[0].payload.description && (
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">{payload[0].payload.description}</p>
                )}
            </div>
        );
    }
    return null;
};

export function InventoryStatusChart({ data, title = "Inventory Status" }: InventoryStatusChartProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [animatedData, setAnimatedData] = useState(data.map(item => ({ ...item, value: 0 })));

    const COLORS = {
        'In Stock': '#10B981', // Green
        'Low Stock': '#F59E0B', // Amber
        'Out of Stock': '#EF4444', // Red
        'Reserved': '#6366F1', // Indigo
        'On Order': '#8B5CF6', // Purple
        'default': '#6B7280', // Gray
    };

    const total = animatedData.reduce((sum, item) => sum + item.value, 0);

    const getColorForStatus = (status: string) => {
        return COLORS[status as keyof typeof COLORS] || COLORS.default;
    };

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setAnimatedData(data);
            setIsLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [data]);

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: PieLabelRenderProps) => {
        if (
            typeof cx !== 'number' ||
            typeof cy !== 'number' ||
            typeof midAngle !== 'number' ||
            typeof innerRadius !== 'number' ||
            typeof outerRadius !== 'number' ||
            typeof percent !== 'number'
        ) {
            return null;
        }

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                fill="#FFFFFF"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="bold"
                fontSize={12}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const renderLegendText = (value: string, entry: any) => {
        const { payload } = entry;
        const itemPercent = total > 0 ? ((payload.value / total) * 100).toFixed(1) : 0;

        return (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {`${value} (${itemPercent}%) - ${payload.value}`}
            </span>
        );
    };

    return (
        <div className="-mt-12 pb-4 transition duration-200 ease-in-out">
            <div className="h-72 relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50">
                        <div className="w-12 h-12 rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={animatedData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            label={renderCustomizedLabel}
                            paddingAngle={2}
                            animationDuration={1200}
                            animationBegin={0}
                            isAnimationActive={true}
                        >
                            {animatedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getColorForStatus(entry.name)}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-4 -mt-6">
                {data.map((item, index) => {
                    return (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getColorForStatus(item.name) }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {`${item.name} (${item.value} items)`}
                            </span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
