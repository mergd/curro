import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-3 text-gray-11 ring-gray-6 hover:bg-gray-4",
        red: "bg-red-3 text-red-11 ring-red-6 hover:bg-red-4",
        green: "bg-green-3 text-green-11 ring-green-6 hover:bg-green-4",
        blue: "bg-blue-3 text-blue-11 ring-blue-6 hover:bg-blue-4",
        yellow: "bg-yellow-3 text-yellow-11 ring-yellow-6 hover:bg-yellow-4",
        purple: "bg-purple-3 text-purple-11 ring-purple-6 hover:bg-purple-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
