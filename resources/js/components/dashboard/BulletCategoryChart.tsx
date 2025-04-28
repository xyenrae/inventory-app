import React, { useState, useEffect } from 'react';

interface CategoryData {
    name: string;
    count: number;
    percentage?: string;
}

interface BulletCategoryChartProps {
    data: CategoryData[];
    title?: string;
    animated?: boolean;
    className?: string;
}

const BulletCategoryChart = ({
    data,
    title = "Category Distribution",
    animated = true,
    className = "",
}: BulletCategoryChartProps) => {
    const [chartData, setChartData] = useState<CategoryData[]>([]);
    const [maxCount, setMaxCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!data || data.length === 0) {
            setChartData([]);
            setIsLoading(false);
            return;
        }

        const total = data.reduce((sum, item) => sum + item.count, 0);
        const highest = Math.max(...data.map(item => item.count));
        setMaxCount(highest);

        // Process data and calculate percentages
        const processedData = data
            .map(item => ({
                name: item.name,
                count: item.count,
                percentage: ((item.count / total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6); // Take top 6 categories

        if (animated) {
            setIsLoading(true);
            setChartData([]);

            setTimeout(() => {
                setChartData(processedData);
                setIsLoading(false);
            }, 300);
        } else {
            setChartData(processedData);
            setIsLoading(false);
        }
    }, [data, animated]);

    // Color generator
    const getColor = (index: number) => {
        return `hsl(${210 + index * 15}, 80%, ${65 - index * 5}%)`;
    };

    // Show placeholder when no data
    if (!data || data.length === 0) {
        return (
            <div className={`w-full h-64 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
                <p className="text-gray-500 dark:text-gray-400">No category data available</p>
            </div>
        );
    }

    return (
        <div>
            <div className="relative">
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chartData.map((item, index) => (
                            <div key={index} className="relative">
                                <div className="flex justify-between mb-1 items-center">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                                        {item.name}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {item.count.toLocaleString()} ({item.percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${(item.count / maxCount) * 100}%`,
                                            backgroundColor: getColor(index),
                                            transition: animated ? 'width 1s ease-out' : 'none'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulletCategoryChart;