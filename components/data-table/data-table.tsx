import type { Row, Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { EmptyStateMessage } from "@/components/data-table/empty-state-message";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";

import { CircleDashedIcon } from "@phosphor-icons/react";
import { flexRender } from "@tanstack/react-table";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  loading?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  error?: Error | null;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function DataTable<TData>({
  table,
  actionBar,
  children,
  className,
  loading,
  onRowClick,
  error,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  ...props
}: DataTableProps<TData>) {
  // Handle error state
  if (error) {
    return (
      <div
        className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
        {...props}
      >
        {children}
        <EmptyStateMessage
          title={errorTitle || "Error"}
          description={
            errorDescription ||
            error.message ||
            "An error occurred while loading the data"
          }
          variant="error"
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div className="overflow-hidden rounded-md ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...getCommonPinningStyles({ column: header.column }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-64 mt-2 bg-gray-5 animate-pulse rounded-md"
                />
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={onRowClick ? "cursor-pointer" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column }),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-0"
                      style={{
                        height: `max(0px, calc(16rem - ${
                          table.getRowModel().rows.length * 3.5
                        }rem))`,
                      }}
                    />
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-64 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <CircleDashedIcon className="size-6 " />
                      <p className="text-sm mt-2">
                        {emptyTitle || "No results"}
                      </p>
                      {(emptyDescription || "No data available") && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {emptyDescription || "No data available"}
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
