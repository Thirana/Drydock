import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Plain buttons: one solid ink action, an outlined companion, a text link. */
export const glButtonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap font-semibold",
    "cursor-pointer select-none rounded-[2px]",
    "transition-colors duration-[120ms] ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-ink text-ground hover:bg-accent hover:text-accent-ink",
        secondary: "border border-rule-strong text-ink hover:border-ink",
        ghost:
          "text-accent underline decoration-[1.5px] decoration-accent/55 underline-offset-4 hover:decoration-current",
      },
      size: {
        sm: "min-h-9 gap-1.5 px-3 text-[14px]",
        md: "min-h-11 gap-2 px-4 text-[15px]",
        lg: "min-h-12 gap-2 px-5 text-[16px]",
      },
    },
    compoundVariants: [{ variant: "ghost", className: "!px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type GlButtonVariants = VariantProps<typeof glButtonVariants>;

interface GlButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, GlButtonVariants {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function GlButton({
  className,
  variant,
  size,
  leading,
  trailing,
  children,
  type = "button",
  ...props
}: GlButtonProps) {
  return (
    <button
      type={type}
      className={cn(glButtonVariants({ variant, size }), className)}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}

interface ButtonLinkProps extends GlButtonVariants {
  href: string;
  className?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}

export function ButtonLink({
  href,
  className,
  variant,
  size,
  leading,
  trailing,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(glButtonVariants({ variant, size }), className)}
    >
      {leading}
      {children}
      {trailing}
    </Link>
  );
}
