import Link from "next/link";
import { LogoLockup } from "@/components/ui/logo";
import { site } from "@/config/site";
import {
  allLabs,
  allTracks,
  labHref,
  providerHref,
  providers,
  trackHref,
} from "@/lib/content/registry";

export function SiteFooter() {
  const columns = [
    {
      title: "Labs",
      links: allLabs().map((ctx) => ({
        href: labHref(ctx),
        label: ctx.lab.title,
      })),
    },
    {
      title: "Tracks",
      links: allTracks().map((ctx) => ({
        href: trackHref(ctx),
        label: `${ctx.lab.title} · ${ctx.track.title}`,
      })),
    },
    {
      title: "Providers",
      links: providers.map((p) => ({ href: providerHref(p), label: p.name })),
    },
  ];

  return (
    <footer className="border-gl-border border-t py-12 pb-10">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <LogoLockup size={20} textClassName="text-[16px]" />
          <p className="text-gl-text-muted mt-3 max-w-[280px] text-[13px] leading-[1.55]">
            {site.description}
          </p>
          <p className="text-gl-text-faint mt-6 font-mono text-[12px]">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-gl-text-faint mb-4 text-[11px] font-bold tracking-[0.12em] uppercase">
              {column.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gl-text-muted hover:text-gl-text text-[13.5px] font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
