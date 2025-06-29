# Data Table System

This is a comprehensive data table system built on top of TanStack Table with shadcn/ui components. It provides advanced features like pagination, sorting, filtering, and column visibility controls.

## Quick Start

### 1. Define Your Data Type

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  isActive: boolean;
}
```

### 2. Create Column Definitions

```tsx
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    meta: {
      label: "Name",
      variant: "text",
      placeholder: "Search names...",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    meta: {
      variant: "text",
      placeholder: "Search emails...",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    meta: {
      variant: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
        { label: "Guest", value: "guest" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return formatDistance(date, new Date(), { addSuffix: true });
    },
    meta: {
      variant: "dateRange",
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
];
```

### 3. Setup the Data Table

```tsx
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";

export function UsersTable() {
  const { data: users = [] } = api.users.list.useQuery();

  const { table } = useDataTable({
    data: users,
    columns,
    pageCount: Math.ceil(users.length / 10),
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <Button onClick={openCreateDialog} size="sm">
          Add User
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
```

## Filter Variants

The data table supports various filter types through the `meta.variant` property:

### Text Filter

```tsx
meta: {
  variant: "text",
  placeholder: "Search...",
}
```

### Select Filter

```tsx
meta: {
  variant: "select",
  options: [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ],
}
```

### Multi-Select Filter

```tsx
meta: {
  variant: "multiSelect",
  options: [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Guest", value: "guest" },
  ],
}
```

### Date Range Filter

```tsx
meta: {
  variant: "dateRange",
  label: "Created Date",
}
```

### Number Filter

```tsx
meta: {
  variant: "number",
  placeholder: "Enter amount",
  unit: "USD", // Optional unit display
}
```

### Range Slider Filter

```tsx
meta: {
  variant: "range",
  range: [0, 100], // Min and max values
  unit: "%",
}
```

## Advanced Features

### Custom Cell Renderers

```tsx
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.getValue("status") as string;
    return (
      <Badge variant={status === "active" ? "success" : "secondary"}>
        {status}
      </Badge>
    );
  },
}
```

### Action Columns

```tsx
{
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const user = row.original;
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editUser(user)}
        >
          <PencilIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteUser(user.id)}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    );
  },
  enableSorting: false,
  enableColumnFilter: false,
}
```

### Row Selection

```tsx
const { table } = useDataTable({
  data: users,
  columns,
  enableRowSelection: true,
  // ... other options
});

// Access selected rows
const selectedRows = table.getFilteredSelectedRowModel().rows;
```

### Custom Toolbar Actions

```tsx
<DataTableToolbar table={table}>
  <div className="flex items-center gap-2">
    <Button onClick={exportData} variant="outline" size="sm">
      Export
    </Button>
    <Button onClick={importData} variant="outline" size="sm">
      Import
    </Button>
    <Button onClick={openCreateDialog} size="sm">
      Add User
    </Button>
  </div>
</DataTableToolbar>
```

## Configuration Options

### useDataTable Hook Options

```tsx
const { table } = useDataTable({
  data: users, // Your data array
  columns, // Column definitions
  pageCount: -1, // Total pages (-1 for client-side)
  initialState: {
    sorting: [{ id: "name", desc: false }],
    pagination: { pageIndex: 0, pageSize: 10 },
    columnVisibility: { id: false }, // Hide ID column
  },
  enableRowSelection: true, // Enable row selection
  enableAdvancedFilter: false, // Use simple filters
  debounceMs: 300, // Filter debounce delay
});
```

### Pagination Options

```tsx
// Client-side pagination (default)
pageCount: Math.ceil(data.length / pageSize);

// Server-side pagination
pageCount: totalPages; // from your API
```

## Styling and Customization

### Custom Column Widths

```tsx
{
  accessorKey: "id",
  header: "ID",
  size: 80, // Fixed width
  minSize: 50,
  maxSize: 100,
}
```

### Column Pinning

```tsx
const { table } = useDataTable({
  // ... other options
  initialState: {
    columnPinning: {
      left: ["select", "name"], // Pin to left
      right: ["actions"], // Pin to right
    },
  },
});
```

### Custom Styling

The data table uses CSS variables that can be customized:

```css
.data-table {
  --table-border-color: hsl(var(--border));
  --table-header-bg: hsl(var(--muted));
  --table-row-hover: hsl(var(--muted) / 0.5);
}
```

## Performance Tips

1. **Memoize columns**: Use `React.useMemo` for column definitions
2. **Debounce filters**: The system automatically debounces text filters
3. **Virtual scrolling**: For large datasets, consider implementing virtual scrolling
4. **Server-side operations**: For very large datasets, implement server-side pagination, sorting, and filtering

## Components Reference

- `DataTable`: Main table component
- `DataTableToolbar`: Toolbar with filters and actions
- `DataTablePagination`: Pagination controls
- `DataTableColumnHeader`: Sortable column headers
- `DataTableViewOptions`: Column visibility controls
- `DataTableFacetedFilter`: Multi-select filter component
- `DataTableDateFilter`: Date range filter component
- `DataTableSliderFilter`: Range slider filter component

## Examples

Check out these examples in the codebase:

- `src/app/(app)/contacts/page.tsx` - Contacts table with all features
- `src/app/[locale]/(app)/dashboard/transfer-table.tsx` - Transaction history table
- `src/app/[locale]/(app)/transfer/page.tsx` - Transfer management table
