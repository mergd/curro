"use client";

import { LOCATION_HIERARCHY } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "./button";
import { Input } from "./input";

interface CityOption {
  value: string;
  label: string;
  starred: boolean;
}

interface CityInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CityInput({
  value = "",
  onChange,
  placeholder = "e.g., San Francisco, USA",
  className,
  disabled,
}: CityInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<CityOption[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate all city options with country codes
  const allCityOptions: CityOption[] = Object.entries(
    LOCATION_HIERARCHY,
  ).flatMap(([countryCode, countryData]) =>
    countryData.cities.map((city) => ({
      value: `${city.name}, ${countryCode}`,
      label: `${city.name}, ${countryCode}`,
      starred: city.starred,
    })),
  );

  // Filter and sort options based on input
  const filterOptions = (query: string) => {
    if (!query.trim()) {
      // Show starred cities first when no query
      return allCityOptions
        .filter((option) => option.starred)
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(0, 10);
    }

    const filtered = allCityOptions.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase()),
    );

    // Sort by relevance: exact match > starts with > contains, then by starred status
    return filtered
      .sort((a, b) => {
        const aLower = a.label.toLowerCase();
        const bLower = b.label.toLowerCase();
        const queryLower = query.toLowerCase();

        // Exact match
        if (aLower === queryLower) return -1;
        if (bLower === queryLower) return 1;

        // Starts with
        if (aLower.startsWith(queryLower) && !bLower.startsWith(queryLower))
          return -1;
        if (bLower.startsWith(queryLower) && !aLower.startsWith(queryLower))
          return 1;

        // Starred status
        if (a.starred && !b.starred) return -1;
        if (b.starred && !a.starred) return 1;

        // Alphabetical
        return aLower.localeCompare(bLower);
      })
      .slice(0, 10);
  };

  useEffect(() => {
    setFilteredOptions(filterOptions(inputValue));
  }, [inputValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: CityOption) => {
    setInputValue(option.value);
    onChange?.(option.value);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setFilteredOptions(filterOptions(inputValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pr-10", className)}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <CaretDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </Button>
      </div>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                  "flex items-center justify-between",
                  option.value === value && "bg-gray-50",
                )}
                onClick={() => handleOptionSelect(option)}
              >
                <span className="flex items-center gap-2">
                  <span>{option.label}</span>
                  {option.starred && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Popular
                    </span>
                  )}
                </span>
                {option.value === value && (
                  <CheckIcon className="size-4 text-blue-600" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No cities found. Try typing a city name.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
