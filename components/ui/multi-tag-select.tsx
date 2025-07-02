import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { forwardRef, useEffect, useRef, useState } from "react";

export interface MultiSelectOption {
  label: string;
  value: string;
  count?: number;
  starred?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  enableSelectAll?: boolean;
  maxVisibleTags?: number;
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onValueChange,
      placeholder = "Select items...",
      className,
      disabled,
      enableSelectAll = false,
      maxVisibleTags = 2,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Show all tags when focused/open, collapse when closed
    useEffect(() => {
      setShowAllTags(open);
    }, [open]);

    const handleSelect = (selectedValue: string) => {
      const newValue = value.includes(selectedValue)
        ? value.filter((item) => item !== selectedValue)
        : [...value, selectedValue];
      onValueChange?.(newValue);
    };

    const handleRemove = (valueToRemove: string) => {
      const newValue = value.filter((item) => item !== valueToRemove);
      onValueChange?.(newValue);
    };

    const handleSelectAll = () => {
      onValueChange?.(options.map((option) => option.value));
    };

    const handleClear = () => {
      onValueChange?.([]);
    };

    const visibleTags = showAllTags ? value : value.slice(0, maxVisibleTags);
    const hiddenCount = value.length - visibleTags.length;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              triggerRef.current = node;
            }}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-h-9 h-auto px-2",
              className,
            )}
            disabled={disabled}
          >
            <div
              ref={containerRef}
              className={cn(
                "flex gap-1 flex-1 min-w-0",
                showAllTags ? "flex-wrap py-2" : "flex-nowrap",
              )}
            >
              {value.length > 0 ? (
                <>
                  {visibleTags.map((item) => {
                    const option = options.find((opt) => opt.value === item);
                    return (
                      <Badge
                        key={item}
                        variant="default"
                        className="inline-flex items-center gap-1 flex-shrink-0"
                      >
                        <span>{option?.label ?? item}</span>
                        {showAllTags && (
                          <div
                            role="button"
                            tabIndex={0}
                            className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleRemove(item);
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemove(item);
                            }}
                          >
                            <XIcon className="size-3 text-muted-foreground hover:text-foreground" />
                          </div>
                        )}
                      </Badge>
                    );
                  })}

                  <div className="flex-grow" />
                  {hiddenCount > 0 && !showAllTags && (
                    <span className="text-gray-9 text-sm whitespace-nowrap">
                      +{hiddenCount} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {placeholder}
                </span>
              )}
            </div>
            <CaretDownIcon className="size-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: triggerRef.current?.offsetWidth }}
        >
          <Command>
            <CommandInput placeholder="Search..." className="h-9" />
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandList>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <CheckIcon
                        className={cn(
                          "mr-2 size-4",
                          value.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <span className={cn(option.starred && "font-medium")}>
                        {option.label}
                      </span>
                    </div>
                    {option.count !== undefined && (
                      <span className="text-muted-foreground text-sm ml-2">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <div className="flex gap-1 p-2 border-t">
                {enableSelectAll && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex-1"
                    disabled={value.length === options.length}
                  >
                    Select All
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="flex-1"
                  disabled={value.length === 0}
                >
                  Clear
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
