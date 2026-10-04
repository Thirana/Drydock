import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";
import { labHref, type LabContext } from "@/lib/content/registry";
import { labStats } from "@/lib/content/stats";
import { StatPills } from "./stat-pills";

/** A lab on the reel list: its name large, the counts beneath. */
export function LabCard({ ctx }: { ctx: LabContext }) {
  const stats = labStats(ctx.lab);
  const trackCount = ctx.lab.tracks.length;

  return (
    <Link
      href={labHref(ctx)}
      className="group border-rule flex flex-col border-t pt-4 pb-8"
    >
      <span className="text-ink-muted font-mono text-[14px]">
        {ctx.provider.name} · {trackCount}{" "}
        {trackCount === 1 ? "track" : "tracks"}
      </span>
      <h3 className="dd-head text-ink group-hover:text-accent mt-2 text-[30px] transition-colors">
        {ctx.lab.title}
      </h3>
      <p className="text-ink-body mt-3 text-[16px] leading-[1.55] text-pretty">
        {ctx.lab.summary}
      </p>
      {stats && <StatPills stats={stats} className="mt-5" />}
      <span className="dd-label text-ink group-hover:text-accent mt-6 inline-flex items-center gap-2">
        See the {trackCount === 1 ? "track" : "tracks"}{" "}
        <IconArrowRight size={12} />
      </span>
    </Link>
  );
}
