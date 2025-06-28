import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showRowAmountSelector?: boolean;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  showRowAmountSelector = false,
  ...props
}: DataTablePaginationProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getRowCount();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-2 py-3",
        className,
      )}
      {...props}
    >
      {/* number of results */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {totalRows} {totalRows === 1 ? "result" : "results"}
        </span>
      </div>

      {/* Selection info - only show if rows are selected */}
      {selectedRows > 0 && (
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <div className="size-1.5 rounded-full bg-primary" />
            {selectedRows} selected
          </div>
        </div>
      )}

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Page size selector */}
        {showRowAmountSelector && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(value: string) =>
                table.setPageSize(Number(value))
              }
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" align="center">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page info */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{currentPage}</span>
          <span>of</span>
          <span className="font-medium text-foreground">
            {totalPages === 0 ? 1 : totalPages}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
