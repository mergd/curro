import { cn } from "@/lib/utils";

import { CheckIcon, ClipboardPasteIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CopyableProps {
  text?: string;
  isCopied?: boolean;
  onCopy?: () => void;
  onPaste?: (text: string) => void;
  variant?: "copy" | "paste";
  className?: string;
}

export default function Copyable({
  text,
  isCopied,
  onCopy,
  onPaste,
  variant = "copy",
  className,
}: CopyableProps) {
  const [isActionPerformed, setIsActionPerformed] = useState(false);

  const copied = isCopied || isActionPerformed;

  useEffect(() => {
    if (isActionPerformed) {
      const timer = setTimeout(() => {
        setIsActionPerformed(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isActionPerformed]);

  const handleAction = async () => {
    if (!text) return;
    if (variant === "copy") {
      await navigator.clipboard.writeText(text);
      onCopy?.();
    } else {
      const clipboardText = await navigator.clipboard.readText();
      onPaste?.(clipboardText);
    }
    setIsActionPerformed(true);
  };

  const IconComponent = variant === "copy" ? CopyIcon : ClipboardPasteIcon;

  return (
    <button
      type="button"
      aria-label={variant === "copy" ? "Copy" : "Paste"}
      onClick={handleAction}
    >
      <span
        className={cn(
          "transform transition-all duration-300 ease-in-out",
          copied ? "text-green-10" : "text-gray-11",
          className,
        )}
      >
        {copied ? (
          <CheckIcon className="size-3" />
        ) : (
          <IconComponent className="size-3" />
        )}
      </span>
    </button>
  );
}

export function Pastable(props: Omit<CopyableProps, "variant">) {
  return <Copyable {...props} variant="paste" />;
}
