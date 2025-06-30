import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className = "",
  showText = true,
  size = "md",
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "gap-1",
      icon: "size-6",
      iconContainer: "size-7",
      text: "text-lg font-display ",
    },
    md: {
      container: "gap-1",
      icon: "size-5",
      iconContainer: "size-8",
      text: "text-xl font-display ",
    },
    lg: {
      container: "gap-1",
      icon: "size-7",
      iconContainer: "size-10",
      text: "text-2xl font-display ",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Link
      href="/"
      className={`flex items-center ${currentSize.container} ${className}`}
    >
      <div
        className={`flex ${currentSize.iconContainer} items-center justify-center `}
      >
        <BriefcaseIcon className={currentSize.icon} weight="duotone" />
      </div>
      {showText && (
        <span className={`${currentSize.text} tracking-tight`}>curro</span>
      )}
    </Link>
  );
}
