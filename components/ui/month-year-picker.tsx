import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CalendarIcon, XIcon } from "@phosphor-icons/react";
import { forwardRef, useState } from "react";

interface MonthYearPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const MonthYearPicker = forwardRef<
  HTMLButtonElement,
  MonthYearPickerProps
>(
  (
    { value, onChange, placeholder = "Select month and year", disabled },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    // Parse current value
    const currentDate = value ? new Date(value + "-01") : null;
    const currentMonth = currentDate ? currentDate.getMonth() : null;
    const currentYear = currentDate ? currentDate.getFullYear() : null;

    // Generate year options (current year ± 20 years)
    const currentYearActual = new Date().getFullYear();
    const years = Array.from(
      { length: 41 },
      (_, i) => currentYearActual - 20 + i,
    );

    const handleMonthChange = (month: string) => {
      const monthIndex = MONTHS.indexOf(month);
      if (currentYear && monthIndex !== -1) {
        const formattedMonth = String(monthIndex + 1).padStart(2, "0");
        onChange(`${currentYear}-${formattedMonth}`);
      }
    };

    const handleYearChange = (year: string) => {
      if (currentMonth !== null) {
        const formattedMonth = String(currentMonth + 1).padStart(2, "0");
        onChange(`${year}-${formattedMonth}`);
      }
    };

    const formatDisplayValue = () => {
      if (!currentDate) return placeholder;
      return `${SHORT_MONTHS[currentMonth!]} ${currentYear}`;
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            disabled={disabled}
            className="w-full justify-between text-left font-normal"
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 size-4" />
              {formatDisplayValue()}
            </div>
            {value && (
              <XIcon
                className="size-4 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select
                value={currentMonth !== null ? MONTHS[currentMonth] : ""}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={currentYear?.toString() || ""}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {years.reverse().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

MonthYearPicker.displayName = "MonthYearPicker";
