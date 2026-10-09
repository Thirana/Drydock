import Link from "next/link";
import { LogoLockup } from "@/components/ui/logo";
import { site } from "@/config/site";
import { courseHref, courses, learnHref } from "@/lib/content/learn";
import {
  allLabs,
  allTracks,
  labHref,
  labsHref,
  trackHref,
} from "@/lib/content/registry";

export function SiteFooter() {
  const columns = [
    {
      title: "Learn",
      links: [
        { href: learnHref, label: "The learning path" },
        ...courses.map((c) => ({ href: courseHref(c), label: c.title })),
      ],
    },
    {
      title: "Labs",
      links: [
        { href: labsHref, label: "All labs" },
        ...allLabs().map((ctx) => ({
          href: labHref(ctx),
          label: ctx.lab.title,
        })),
      ],
    },
    {
      title: "Tracks",
      links: allTracks().map((ctx) => ({
        href: trackHref(ctx),
        label: `${ctx.lab.title} · ${ctx.track.title}`,
      })),
    },
  ];

  return (
    <footer className="border-rule mt-auto border-t">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-8 gap-y-10 px-5 pt-12 pb-14 sm:grid-cols-4 sm:px-8">
        <div className="col-span-2 sm:col-span-1">
          <LogoLockup />
          <p className="text-ink-muted mt-3 max-w-[280px] text-[15px] leading-[1.55]">
            {site.tagline}
          </p>
          <p className="text-ink-faint mt-5 text-[14px]">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="dd-label mb-3">{column.title}</p>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink hover:text-accent text-[15px] transition-colors"
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
