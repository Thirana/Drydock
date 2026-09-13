"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ICONS } from "@/components/ui/icons";
import type { IconName } from "@/lib/content/types";
import { cn } from "@/lib/utils";

interface TrackNavProps {
  items: { href: string; label: string; icon?: IconName }[];
  variant: "sidebar" | "pills";
}

export function TrackNav({ items, variant }: TrackNavProps) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav aria-label="Track sections">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon ? ICONS[item.icon] : null;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[13.5px] transition-colors duration-[120ms]",
                    active
                      ? "bg-gl-primary text-gl-primary-ink font-semibold"
                      : "text-gl-text-muted hover:bg-gl-surface hover:text-gl-text font-medium",
                  )}
                >
                  {Icon && <Icon size={18} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Track sections"
      className="no-scrollbar overflow-x-auto px-5 pb-3"
    >
      <ul className="flex w-max gap-1.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon ? ICONS[item.icon] : null;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition-all duration-150",
                  active
                    ? "border-gl-primary/30 bg-gl-primary-soft text-gl-primary"
                    : "border-gl-border bg-gl-surface text-gl-text-muted hover:text-gl-text",
                )}
              >
                {Icon && <Icon size={14} />}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
