"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button, TextField } from "@radix-ui/themes";
import * as React from "react";

export type PasswordInputProps = React.ComponentProps<typeof TextField.Root>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
      <TextField.Root
        type={showPassword ? "text" : "password"}
        ref={ref}
        {...props}
      >
        <TextField.Slot side="right">
          <Button
            type="button"
            variant="ghost"
            size="1"
            onClick={togglePasswordVisibility}
            disabled={props.disabled}
            className=""
          >
            {showPassword ? (
              <EyeSlashIcon className="size-4" aria-hidden="true" />
            ) : (
              <EyeIcon className="size-4" aria-hidden="true" />
            )}
          </Button>
        </TextField.Slot>
      </TextField.Root>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
