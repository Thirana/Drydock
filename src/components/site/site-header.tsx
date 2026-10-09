"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { IconArrowRight, IconMenu, IconX } from "@/components/ui/icons";
import { LogoLockup } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Search } from "./search";
import type { NavLink } from "@/lib/content/nav";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  links: NavLink[];
  cta?: NavLink;
}

const within = (pathname: string, link: NavLink) => {
  // Some static hosts serve "/labs" as "/labs.html".
  const path = pathname.replace(/\.html$/, "");
  return (link.match ?? [link.href]).some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
};

/** A quiet top bar: the name, a few plain links, the lamp. */
export function SiteHeader({ links, cta }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();

  // Close the menu on Escape, and when the layout grows past it.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 48rem)");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className="border-rule relative z-40 border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8"
      >
        <LogoLockup />
        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="mr-2 hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const current = within(pathname, link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "text-[15px] underline decoration-2 underline-offset-[7px] transition-colors",
                      current
                        ? "text-ink decoration-accent font-semibold"
                        : "text-ink-muted hover:text-ink decoration-transparent",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {cta && (
              <li>
                <Link
                  href={cta.href}
                  className="text-accent inline-flex items-center gap-1.5 text-[15px] font-semibold"
                >
                  {cta.label}
                  <IconArrowRight size={12} />
                </Link>
              </li>
            )}
          </ul>
          <Search className="text-ink-muted hover:text-ink" />
          <ThemeToggle className="text-ink-muted hover:text-ink" />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            className="text-ink-muted hover:text-ink -mr-2.5 inline-flex size-11 items-center justify-center md:hidden"
          >
            {open ? <IconX size={14} /> : <IconMenu />}
          </button>
        </div>
      </nav>
      <div
        id={menuId}
        hidden={!open}
        className="border-rule border-t md:hidden"
      >
        <ul className="mx-auto flex max-w-[1200px] flex-col px-5 py-2 sm:px-8">
          {[...links, ...(cta ? [cta] : [])].map((link) => {
            const current = link !== cta && within(pathname, link);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={current ? "true" : undefined}
                  className={cn(
                    "flex min-h-12 items-center text-[17px]",
                    link === cta ? "text-accent font-semibold" : "text-ink",
                    current && "font-semibold",
                  )}
                >
                  {current && (
                    <span
                      aria-hidden="true"
                      className="bg-accent mr-3 h-5 w-[3px]"
                    />
                  )}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
