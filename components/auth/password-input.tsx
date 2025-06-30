"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";

export type PasswordInputProps = React.ComponentProps<typeof Input>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          ref={ref}
          className={className}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={togglePasswordVisibility}
          disabled={props.disabled}
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        >
          {showPassword ? (
            <EyeSlashIcon className="size-4" aria-hidden="true" />
          ) : (
            <EyeIcon className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
