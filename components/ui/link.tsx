import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import NextLink from "next/link";

interface LinkProps extends React.HTMLProps<HTMLAnchorElement> {
  text?: string;
  underline?: boolean;
  className?: string;
  isExternal?: boolean;
  disableExternalIcon?: boolean;
}

const Link = ({
  text,
  href = "#",
  underline,
  className,
  children,
  isExternal,
  disableExternalIcon = false,
  disabled,
  ...props
}: LinkProps) => {
  const classes = clsx(
    disabled && "opacity-50 cursor-not-allowed",
    "inline-flex items-center gap-1 hover:opacity-80",
    className,
    {
      "underline decoration-1 decoration-gray-a4 underline-offset-2": underline,
    },
  );

  if (isExternal) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={classes}
        href={href}
        {...props}
      >
        {text || children}
        {!disableExternalIcon && <ExternalLink className="h-3 w-3" />}
      </a>
    );
  }

  return (
    <NextLink className={classes} href={href} {...props}>
      {text || children}
    </NextLink>
  );
};

export default Link;
