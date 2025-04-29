// resources/js/Components/PaginationFooter.tsx
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import React from "react";
import { router } from "@inertiajs/react";

interface Pagination {
    total: number;
    from: number;
    to: number;
    current_page: number;
    last_page: number;
}

interface PaginationFooterProps {
    pagination: Pagination;
    perPage: number;
    perPageOptions: number[];
    filters: Record<string, any>;
    isLoading: boolean;
    goToPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
}

const PaginationFooter: React.FC<PaginationFooterProps> = ({
    pagination,
    perPage,
    perPageOptions,
    filters,
    isLoading,
    goToPage,
    setPerPage,
}) => {
    if (!pagination || pagination.total === 0) return null;

    const getPaginationRange = () => {
        const totalPageNumbers = 5;
        const totalPages = pagination.last_page;

        if (totalPages <= totalPageNumbers) {
            return [...Array(totalPages)].map((_, idx) => idx + 1);
        }

        const siblingCount = 1;
        const leftSiblingIndex = Math.max(pagination.current_page - siblingCount, 1);
        const rightSiblingIndex = Math.min(pagination.current_page + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        const pages: (number | -1)[] = [];

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = [...Array(leftItemCount)].map((_, idx) => idx + 1);
            pages.push(...leftRange, -1, totalPages);
        } else if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = [...Array(rightItemCount)].map((_, idx) => totalPages - rightItemCount + 1 + idx);
            pages.push(firstPageIndex, -1, ...rightRange);
        } else if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = [...Array(2 * siblingCount + 1)].map((_, idx) => leftSiblingIndex + idx);
            pages.push(firstPageIndex, -1, ...middleRange, -1, lastPageIndex);
        }

        return pages;
    };

    return (
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
            {/* Info Showing */}
            <div className="hidden sm:block text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing <span className="font-medium">{pagination.from}</span> to{" "}
                <span className="font-medium">{pagination.to}</span> of{" "}
                <span className="font-medium">{pagination.total}</span> items
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between sm:justify-center gap-2">
                {/* Per page select */}
                <div className="text-xs sm:hidden text-muted-foreground text-center">
                    Showing <span className="font-medium">{pagination.from}</span> to{" "}
                    <span className="font-medium">{pagination.to}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span> items
                </div>
                <div className="flex items-center ">
                    <Select
                        value={perPage?.toString() ?? "10"}
                        onValueChange={(value) => {
                            setPerPage(Number(value));
                            router.visit(route(route().current()!), {
                                data: {
                                    ...filters,
                                    perPage: Number(value),
                                    page: 1,
                                },
                            });
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={(perPage || 10).toString()} />
                        </SelectTrigger>
                        <SelectContent>
                            {perPageOptions.map((option) => (
                                <SelectItem key={option} value={option.toString()}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="ml-2 text-xs sm:text-sm text-muted-foreground">per page</span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center space-x-1 mx-auto sm:mx-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => goToPage(1)}
                                    disabled={pagination.current_page === 1 || isLoading}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                    <span className="sr-only">First page</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>First page</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => goToPage(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1 || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="sr-only">Previous page</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Previous page</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Page numbers (hidden on mobile) */}
                    <div className="hidden sm:flex items-center space-x-1">
                        {getPaginationRange().map((page, index) =>
                            page < 0 ? (
                                <span key={`ellipsis-${index}`} className="px-2">
                                    ...
                                </span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={pagination.current_page === page ? "default" : "outline"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => goToPage(page)}
                                    disabled={isLoading}
                                >
                                    {page}
                                </Button>
                            )
                        )}
                    </div>

                    {/* Mobile only: Page X of Y */}
                    <div className="sm:hidden px-4">
                        <span className="text-xs font-medium">
                            Page {pagination.current_page} / {pagination.last_page}
                        </span>
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => goToPage(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page || isLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="sr-only">Next page</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Next page</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => goToPage(pagination.last_page)}
                                    disabled={pagination.current_page === pagination.last_page || isLoading}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                    <span className="sr-only">Last page</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Last page</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </CardFooter>
    );
};

export default PaginationFooter;
