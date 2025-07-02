import { cn } from "@/lib/utils";

import { ReactNode } from "react";

interface FormLayoutProps {
  children: ReactNode;
  className?: string;
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

interface FormGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

function FormLayout({ children, className }: FormLayoutProps) {
  return <div className={cn("space-y-8", className)}>{children}</div>;
}

function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function FormGrid({ children, cols = 1, className }: FormGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[cols], className)}>
      {children}
    </div>
  );
}

function FormActions({ children, className }: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-4 pt-6 border-t mt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { FormLayout, FormSection, FormGrid, FormActions };
