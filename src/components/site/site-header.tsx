"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow, IconMenu, IconX } from "@/components/ui/icons";
import { LogoLockup } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  links: { href: string; label: string }[];
  cta: { href: string; label: string };
}

export function SiteHeader({ links, cta }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled || open
          ? "border-gl-border bg-gl-bg/80 backdrop-blur-2xl"
          : "border-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8 md:py-5 lg:px-12"
      >
        <LogoLockup />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-gl-text-muted hover:text-gl-text rounded-lg px-3 py-2 text-[14px] font-medium transition-colors duration-150"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <div
            aria-hidden="true"
            className="bg-gl-border mx-2 hidden h-[18px] w-px md:block"
          />
          <ButtonLink
            href={cta.href}
            size="sm"
            trailing={<IconArrow size={13} />}
            className="md:px-3.5 md:py-[9px] md:text-[14px]"
          >
            {cta.label}
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            className="text-gl-text-muted hover:bg-gl-text/[0.06] hover:text-gl-text -mr-2.5 inline-flex size-11 items-center justify-center rounded-lg transition-colors duration-[120ms] md:hidden"
          >
            {open ? <IconX size={14} /> : <IconMenu />}
          </button>
        </div>
      </nav>
      <div
        id={menuId}
        hidden={!open}
        className="border-gl-border border-t md:hidden"
      >
        <ul className="mx-auto flex max-w-[1200px] flex-col px-5 py-2 sm:px-8">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-gl-text-muted hover:text-gl-text flex min-h-11 items-center text-[15px] font-medium transition-colors duration-150"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
