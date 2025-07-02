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

import { CheckIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { forwardRef, KeyboardEvent, useState } from "react";

export interface TagComboboxOption {
  label: string;
  value: string;
}

interface TagComboboxProps {
  options: TagComboboxOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
}

export const TagCombobox = forwardRef<HTMLDivElement, TagComboboxProps>(
  (
    {
      options,
      value = [],
      onValueChange,
      placeholder = "Add tags...",
      className,
      disabled,
      allowCustom = true,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

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

    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.([]);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && inputValue.trim() && allowCustom) {
        event.preventDefault();
        const trimmedValue = inputValue.trim();
        if (!value.includes(trimmedValue)) {
          onValueChange?.([...value, trimmedValue]);
        }
        setInputValue("");
      }
    };

    const handleAddCustom = () => {
      if (inputValue.trim() && allowCustom) {
        const trimmedValue = inputValue.trim();
        if (!value.includes(trimmedValue)) {
          onValueChange?.([...value, trimmedValue]);
        }
        setInputValue("");
      }
    };

    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(option.value),
    );

    const canAddCustom =
      allowCustom &&
      inputValue.trim() &&
      !value.includes(inputValue.trim()) &&
      !options.some((option) => option.value === inputValue.trim());

    return (
      <div ref={ref} className={cn("w-full space-y-1", className)}>
        {/* Combobox input with inline tags */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-start text-left font-normal h-auto min-h-10 p-2 hover:bg-transparent"
              disabled={disabled}
            >
              <div className="flex flex-wrap items-center gap-1 w-full">
                {value.length > 0 && (
                  <>
                    {value.map((item) => {
                      const option = options.find((opt) => opt.value === item);
                      return (
                        <Badge
                          key={item}
                          variant="default"
                          className="pr-1 text-xs"
                        >
                          {option?.label ?? item}
                          <div
                            role="button"
                            tabIndex={0}
                            className="ml-1 size-3 rounded-full hover:bg-background/10 flex items-center justify-center cursor-pointer"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemove(item);
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemove(item);
                            }}
                          >
                            <XIcon className="size-2" />
                          </div>
                        </Badge>
                      );
                    })}
                  </>
                )}
                {value.length === 0 ? (
                  <span className="text-muted-foreground">{placeholder}</span>
                ) : (
                  <div className="flex items-center gap-1 ml-1 text-muted-foreground">
                    <PlusIcon className="size-3" />
                    <span className="text-xs">Add</span>
                  </div>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search or type to add..."
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={handleKeyDown}
              />
              <CommandList>
                {filteredOptions.length === 0 && !canAddCustom && (
                  <CommandEmpty>No options found.</CommandEmpty>
                )}

                {canAddCustom && (
                  <CommandGroup>
                    <CommandItem onSelect={handleAddCustom}>
                      <PlusIcon className="mr-2 size-4" />
                      Add "{inputValue.trim()}"
                    </CommandItem>
                  </CommandGroup>
                )}

                {filteredOptions.length > 0 && (
                  <CommandGroup>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          handleSelect(option.value);
                          setInputValue("");
                        }}
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
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear all button */}
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>
    );
  },
);

TagCombobox.displayName = "TagCombobox";
