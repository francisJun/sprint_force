import React from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

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
    itemLabel,
    className = "",
}: PaginationProps) {
    const { isGerman } = useTranslation();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const localizedItemLabel = itemLabel
        ? isGerman
            ? itemLabel === "entries" ? "Einträge"
            : itemLabel === "timesheet logs" ? "Buchungseinträge"
            : itemLabel === "absences" ? "Abwesenheiten"
            : itemLabel === "orders" ? "Bestellungen"
            : itemLabel === "purchase orders" ? "Rahmenbestellungen"
            : itemLabel === "invoices" ? "Rechnungen"
            : itemLabel
            : itemLabel
        : isGerman ? "Einträge" : "entries";

    // Calculate smart window of page numbers
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, "...", totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [
                1,
                "...",
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    };

    const pages = getPageNumbers();

    return (
        <div
            className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gov-border bg-gov-surface px-3 sm:px-4 py-3 text-xs ${className}`}
            aria-label="Table Pagination"
        >
            {/* Left: Range and Item Count */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 text-gov-muted">
                <p className="text-xs">
                    {isGerman ? "Zeige" : "Showing"}{" "}
                    <span className="font-mono font-semibold text-gov-text tabular-nums">
                        {startItem}
                    </span>{" "}
                    {isGerman ? "bis" : "to"}{" "}
                    <span className="font-mono font-semibold text-gov-text tabular-nums">
                        {endItem}
                    </span>{" "}
                    {isGerman ? "von" : "of"}{" "}
                    <span className="font-mono font-semibold text-gov-text tabular-nums">
                        {totalItems}
                    </span>{" "}
                    {localizedItemLabel}
                </p>

                {onPageSizeChange && (
                    <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-gov-border">
                        <span className="text-[11px] text-gov-muted">
                            {isGerman ? "Pro Seite:" : "Per page:"}
                        </span>
                        <div className="inline-flex rounded-md border border-gov-border bg-gov-canvas p-0.5">
                            {pageSizeOptions.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => onPageSizeChange(opt)}
                                    className={`px-2 py-0.5 rounded-sm font-mono text-[11px] tabular-nums transition-colors cursor-pointer ${
                                        pageSize === opt
                                            ? "bg-gov-surface font-semibold text-gov-text shadow-xs border border-gov-border"
                                            : "text-gov-muted hover:text-gov-text"
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
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1 w-full sm:w-auto">
                {/* First Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage <= 1}
                    aria-label={isGerman ? "Zur ersten Seite" : "Go to first page"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gov-border bg-gov-surface text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer shrink-0"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Previous Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label={isGerman ? "Zur vorherigen Seite" : "Go to previous page"}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-gov-border bg-gov-surface px-2 sm:px-2.5 text-xs text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer shrink-0"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{isGerman ? "Zurück" : "Prev"}</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                    {pages.map((p, idx) =>
                        p === "..." ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="hidden sm:inline-flex h-8 w-8 items-center justify-center text-gov-muted font-mono"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={`page-${p}`}
                                type="button"
                                onClick={() => onPageChange(p as number)}
                                aria-label={isGerman ? `Seite ${p}` : `Page ${p}`}
                                aria-current={
                                    currentPage === p ? "page" : undefined
                                }
                                className={`h-8 min-w-8 px-2 items-center justify-center rounded-md font-mono text-xs tabular-nums transition-colors cursor-pointer shrink-0 ${
                                    currentPage === p
                                        ? "inline-flex border border-gov-interactive bg-gov-interactive font-semibold text-white shadow-xs"
                                        : Math.abs((p as number) - currentPage) <= 1
                                        ? "inline-flex border border-gov-border bg-gov-surface text-gov-text hover:bg-gov-surface-hover"
                                        : "hidden sm:inline-flex border border-gov-border bg-gov-surface text-gov-text hover:bg-gov-surface-hover"
                                }`}
                            >
                                {p}
                            </button>
                        ),
                    )}
                </div>

                {/* Next Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    aria-label={isGerman ? "Zur nächsten Seite" : "Go to next page"}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-gov-border bg-gov-surface px-2 sm:px-2.5 text-xs text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer shrink-0"
                >
                    <span className="hidden sm:inline">{isGerman ? "Weiter" : "Next"}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>

                {/* Last Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    aria-label={isGerman ? "Zur letzten Seite" : "Go to last page"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gov-border bg-gov-surface text-gov-text transition-colors hover:bg-gov-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-gov-surface cursor-pointer shrink-0"
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
