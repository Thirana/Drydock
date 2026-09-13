import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tinted buttons for navigation and calls to action. */
export const glButtonVariants = cva(
  [
    "inline-flex items-center justify-center font-semibold whitespace-nowrap",
    "cursor-pointer select-none tracking-[-0.005em]",
    "transition-all duration-[120ms] ease-out",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gl-primary/[0.16] text-gl-primary",
          "hover:bg-gl-primary/[0.24]",
        ],
        secondary: [
          "bg-gl-text/[0.06] text-gl-text",
          "hover:bg-gl-text/[0.10]",
        ],
        ghost: [
          "bg-transparent text-gl-text-muted",
          "hover:bg-gl-text/[0.05] hover:text-gl-text",
        ],
      },
      size: {
        sm: "gap-1.5 rounded-lg px-3 py-1.5 text-[13px]",
        md: "gap-2 rounded-lg px-3.5 py-[9px] text-[14px]",
        lg: "gap-2.5 rounded-[10px] px-[22px] py-[13px] text-[15px]",
      },
    },
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
