"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TIMEZONES } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { CaretDownIcon, CheckIcon, ClockIcon } from "@phosphor-icons/react";
import { forwardRef, useMemo, useState } from "react";

interface TimezoneDropdownProps {
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const TimezoneDropdown = forwardRef<
  HTMLButtonElement,
  TimezoneDropdownProps
>(
  (
    {
      value,
      onValueChange,
      placeholder = "Select timezone...",
      className,
      disabled,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Group timezones by region
    const groupedTimezones = useMemo(() => {
      const groups: Record<string, Array<(typeof TIMEZONES)[number]>> = {};

      TIMEZONES.forEach((timezone) => {
        if (!groups[timezone.region]) {
          groups[timezone.region] = [];
        }
        groups[timezone.region].push(timezone);
      });

      return groups;
    }, []);

    // Filter timezones based on search
    const filteredTimezones = useMemo(() => {
      if (!inputValue.trim()) return TIMEZONES;

      const query = inputValue.toLowerCase();
      return TIMEZONES.filter(
        (timezone) =>
          timezone.label.toLowerCase().includes(query) ||
          timezone.value.toLowerCase().includes(query) ||
          timezone.region.toLowerCase().includes(query),
      );
    }, [inputValue]);

    const handleSelect = (timezoneValue: string) => {
      onValueChange?.(timezoneValue);
      setOpen(false);
      setInputValue("");
    };

    const handleClear = () => {
      onValueChange?.(undefined);
      setOpen(false);
    };

    const getDisplayValue = () => {
      if (!value) return placeholder;

      const timezone = TIMEZONES.find((tz) => tz.value === value);
      return timezone ? timezone.label : value;
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            <div className="flex items-center">
              <ClockIcon className="mr-2 size-4 text-muted-foreground" />
              <span className="truncate text-left">{getDisplayValue()}</span>
            </div>
            <CaretDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search timezones..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {filteredTimezones.length === 0 && (
                <CommandEmpty>No timezones found.</CommandEmpty>
              )}

              {inputValue.trim() ? (
                // Show filtered results without grouping when searching
                <CommandGroup>
                  {filteredTimezones.map((timezone) => (
                    <CommandItem
                      key={timezone.value}
                      onSelect={() => handleSelect(timezone.value)}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 size-4",
                          value === timezone.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{timezone.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {timezone.region}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                // Show grouped results when not searching
                Object.entries(groupedTimezones).map(
                  ([region, timezones], index) => (
                    <div key={region}>
                      <CommandGroup heading={region}>
                        {timezones.map((timezone) => (
                          <CommandItem
                            key={timezone.value}
                            onSelect={() => handleSelect(timezone.value)}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 size-4",
                                value === timezone.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span>{timezone.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {index < Object.keys(groupedTimezones).length - 1 && (
                        <CommandSeparator />
                      )}
                    </div>
                  ),
                )
              )}

              {/* Clear Selection */}
              {value && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleClear}
                      className="text-muted-foreground"
                    >
                      Clear selection
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

TimezoneDropdown.displayName = "TimezoneDropdown";
