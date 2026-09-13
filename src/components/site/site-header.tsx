"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { LogoLockup } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  links: { href: string; label: string }[];
  cta: { href: string; label: string };
}

export function SiteHeader({ links, cta }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-gl-border bg-gl-bg/80 backdrop-blur-2xl"
          : "border-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8 md:py-5 lg:px-12">
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
        <div className="flex items-center">
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
        </div>
      </nav>
    </header>
  );
}
