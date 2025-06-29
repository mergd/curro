import { cn } from "@/lib/utils";

import {
  AlertTriangle,
  InfoIcon as LucideInfoIcon,
  XOctagon,
} from "lucide-react";
import React from "react";

interface EmptyStateMessageProps {
  variant?: "warning" | "error" | "info" | "default";
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode; // Allow for additional content like buttons
}

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
  variant = "default",
  icon: customIcon,
  title,
  description,
  className,
  children,
}) => {
  let containerClasses = "";
  let textClasses = "";
  let IconComponent: React.ReactNode | null = customIcon;

  switch (variant) {
    case "warning":
      containerClasses =
        "bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700/50";
      textClasses = "text-orange-700 dark:text-orange-300";
      if (!IconComponent)
        IconComponent = (
          <AlertTriangle className={cn("h-6 w-6", textClasses, "opacity-80")} />
        );
      break;
    case "error":
      containerClasses =
        "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700/50";
      textClasses = "text-red-700 dark:text-red-300";
      if (!IconComponent)
        IconComponent = (
          <XOctagon className={cn("h-6 w-6", textClasses, "opacity-80")} />
        );
      break;
    case "info":
      containerClasses =
        "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700/50";
      textClasses = "text-blue-700 dark:text-blue-300";
      if (!IconComponent)
        IconComponent = (
          <LucideInfoIcon
            className={cn("h-6 w-6", textClasses, "opacity-80")}
          />
        );
      break;
    default: // 'default' for "No transactions found" or general messages
      containerClasses =
        "bg-slate-50 border-slate-200 dark:bg-slate-800/20 dark:border-slate-700/50";
      textClasses = "text-slate-700 dark:text-slate-300";
      if (!IconComponent)
        IconComponent = (
          <LucideInfoIcon
            className={cn("h-6 w-6", textClasses, "opacity-80")}
          />
        );
      break;
  }

  return (
    <div
      className={cn(
        "flex items-center p-4 border rounded-lg w-full",
        containerClasses,
        className,
      )}
    >
      {IconComponent && <div className="shrink-0 mr-3">{IconComponent}</div>}
      <div className="grow">
        <h3 className={cn("font-medium text-base", textClasses)}>{title}</h3>
        {description && (
          <p className={cn("text-sm", textClasses, "opacity-90 mt-0.5")}>
            {description}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
};
