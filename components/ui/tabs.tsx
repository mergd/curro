"use client";

import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { SpinnerGapIcon } from "@phosphor-icons/react/dist/ssr";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { VariantProps } from "class-variance-authority";
import * as React from "react";

interface TabItem {
  value: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: {
    count?: number;
    variant?: VariantProps<typeof badgeVariants>["variant"];
    loading?: boolean;
  };
}

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  items,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  items: TabItem[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [selectedValue, setSelectedValue] = React.useState(
    defaultValue || items[0]?.value || "",
  );

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
  };

  const selectedItem = items.find((item) => item.value === selectedValue);

  return (
    <div className="border-b border-gray-6 w-full px-3">
      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <Select value={selectedValue} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center">
                {selectedItem?.icon && (
                  <span className="mr-2">{selectedItem.icon}</span>
                )}
                {selectedItem?.label}
                {selectedItem?.badge && (
                  <div className="ml-2">
                    {selectedItem.badge.loading ? (
                      <SpinnerGapIcon className="size-3 animate-spin text-muted-foreground" />
                    ) : (
                      selectedItem.badge.count !== undefined && (
                        <Badge
                          variant={selectedItem.badge.variant || "default"}
                          className="text-xs px-1.5 py-0.5 min-w-5 h-5"
                        >
                          {selectedItem.badge.count}
                        </Badge>
                      )
                    )}
                  </div>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <div className="flex items-center w-full">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                  {item.badge && (
                    <div className="ml-auto">
                      {item.badge.loading ? (
                        <SpinnerGapIcon className="size-3 animate-spin text-muted-foreground" />
                      ) : (
                        item.badge.count !== undefined && (
                          <Badge
                            variant={item.badge.variant || "default"}
                            className="text-xs px-1.5 py-0.5 min-w-5 h-5"
                          >
                            {item.badge.count}
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop tabs */}
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn("hidden sm:flex space-x-8 -mb-px", className)}
        {...props}
      >
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
            {item.badge && (
              <div className="ml-2">
                {item.badge.loading ? (
                  <SpinnerGapIcon className="size-3 animate-spin text-muted-foreground" />
                ) : (
                  item.badge.count !== undefined && (
                    <Badge
                      variant={item.badge.variant || "default"}
                      className="text-xs px-1.5 py-0.5 min-w-5 h-5"
                    >
                      {item.badge.count}
                    </Badge>
                  )
                )}
              </div>
            )}
          </TabsTrigger>
        ))}
      </TabsPrimitive.List>
    </div>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "border-b-2 px-0.5 py-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center",
        "data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:border-gray-8 data-[state=inactive]:hover:text-muted-foreground/80",
        "data-[state=active]:border-primary data-[state=active]:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-4", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, type TabItem };
