import { cn } from "@/lib/utils";

import { ImageIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";

interface ImagePreviewProps {
  src?: string;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function ImagePreview({
  src,
  alt,
  className,
  fallback,
}: ImagePreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted border border-dashed rounded-md",
          className,
        )}
      >
        {fallback || (
          <div className="flex flex-col items-center gap-2 p-4 text-muted-foreground">
            {hasError ? (
              <>
                <WarningCircleIcon className="size-8" />
                <span className="text-sm">Failed to load image</span>
              </>
            ) : (
              <>
                <ImageIcon className="size-8" />
                <span className="text-sm">No image</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-md border", className)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="size-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
