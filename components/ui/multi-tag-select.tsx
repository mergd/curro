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
import { forwardRef, useState } from "react";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
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
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

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

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between min-h-9 h-auto", className)}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {value.length > 0 ? (
                value.map((item) => {
                  const option = options.find((opt) => opt.value === item);
                  return (
                    <Badge key={item} variant="default" className="px-2 py-1">
                      {option?.label ?? item}
                      <div
                        role="button"
                        tabIndex={0}
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
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
                    </Badge>
                  );
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <CaretDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." className="h-9" />
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandList>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        value.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <div className="flex gap-1 p-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex-1"
                  disabled={value.length === options.length}
                >
                  Select All
                </Button>
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
