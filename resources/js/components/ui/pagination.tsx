import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
    itemLabel?: string;
    className?: string;
}

export function Pagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50],
    itemLabel = 'entries',
    className = '',
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Calculate smart window of page numbers
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pages = getPageNumbers();

    return (
        <div
            className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gov-border bg-gov-surface px-4 py-3 text-xs ${className}`}
            aria-label="Table Pagination"
        >
            {/* Left: Range and Item Count */}
            <div className="flex items-center gap-3 text-gov-muted">
                <p>
                    Showing <span className="font-mono font-semibold text-gov-text tabular-nums">{startItem}</span> to{' '}
                    <span className="font-mono font-semibold text-gov-text tabular-nums">{endItem}</span> of{' '}
                    <span className="font-mono font-semibold text-gov-text tabular-nums">{totalItems}</span> {itemLabel}
                </p>

                {onPageSizeChange && (
                    <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-gov-border">
                        <span className="text-[11px] text-gov-muted">Per page:</span>
                        <div className="inline-flex rounded-md border border-gov-border bg-gov-canvas p-0.5">
                            {pageSizeOptions.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => onPageSizeChange(opt)}
                                    className={`px-2 py-0.5 rounded-sm font-mono text-[11px] tabular-nums transition-colors cursor-pointer ${
                                        pageSize === opt
                                            ? 'bg-gov-surface font-semibold text-gov-text shadow-xs border border-gov-border'
                                            : 'text-gov-muted hover:text-gov-text'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Page Navigation Controls */}
            <div className="flex items-center gap-1 self-end sm:self-auto">
                {/* First Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage <= 1}
                    aria-label="Go to first page"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gov-border bg-gov-surface text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Previous Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label="Go to previous page"
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-gov-border bg-gov-surface px-2.5 text-xs text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                    {pages.map((p, idx) =>
                        p === '...' ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="inline-flex h-8 w-8 items-center justify-center text-gov-muted font-mono"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={`page-${p}`}
                                type="button"
                                onClick={() => onPageChange(p as number)}
                                aria-label={`Page ${p}`}
                                aria-current={currentPage === p ? 'page' : undefined}
                                className={`inline-flex h-8 min-w-[32px] px-2 items-center justify-center rounded-md font-mono text-xs tabular-nums transition-colors cursor-pointer ${
                                    currentPage === p
                                        ? 'border border-gov-interactive bg-gov-interactive font-semibold text-white shadow-xs'
                                        : 'border border-gov-border bg-gov-surface text-gov-text hover:bg-gov-surface-hover'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                {/* Next Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    aria-label="Go to next page"
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-gov-border bg-gov-surface px-2.5 text-xs text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>

                {/* Last Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    aria-label="Go to last page"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gov-border bg-gov-surface text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

/**
 * Reusable React hook to manage pagination state over client-side lists and tables.
 */
export function usePagination<T>(items: T[], initialPageSize = 10) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(initialPageSize);

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Reset page if items shrink out of bounds
    React.useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalItems, totalPages, currentPage]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    return {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize: handlePageSizeChange,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        paginatedItems,
    };
}

