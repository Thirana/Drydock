import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";
import { Eyebrow } from "@/components/ui/typography";
import { labHref, type LabContext } from "@/lib/content/registry";
import { labStats } from "@/lib/content/stats";
import { StatPills } from "./stat-pills";

export function LabCard({ ctx }: { ctx: LabContext }) {
  const stats = labStats(ctx.lab);
  const trackCount = ctx.lab.tracks.length;

  return (
    <Link
      href={labHref(ctx)}
      className="group border-gl-border bg-gl-surface shadow-gl hover:shadow-gl-lg flex flex-col rounded-2xl border p-7 transition-all duration-[150ms] hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-3">
        <Eyebrow faint>{ctx.provider.name}</Eyebrow>
        <span className="text-gl-text-faint font-mono text-[11px]">
          {trackCount} {trackCount === 1 ? "track" : "tracks"}
        </span>
      </div>
      <h3 className="text-gl-text mt-3 text-[20px] leading-[1.3] font-bold tracking-[-0.015em]">
        {ctx.lab.title}
      </h3>
      <p className="text-gl-text-muted mt-2 text-[14.5px] leading-[1.6] text-pretty">
        {ctx.lab.summary}
      </p>
      {stats && <StatPills stats={stats} className="mt-5" />}
      <ul className="mt-4 flex flex-wrap gap-2">
        {ctx.lab.tracks.map((track) => (
          <li
            key={track.slug}
            className="border-gl-border bg-gl-surface-2 text-gl-text-muted rounded-full border px-2 py-0.5 text-[11px] font-medium"
          >
            {track.title}
          </li>
        ))}
      </ul>
      <span className="text-gl-primary group-hover:text-gl-primary-hover mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold">
        See the {trackCount === 1 ? "track" : "tracks"}{" "}
        <IconArrowRight size={12} />
      </span>
    </Link>
  );
}
