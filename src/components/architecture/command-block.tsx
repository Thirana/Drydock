import { cn } from "@/lib/utils";

/** Terminal-style block. Comment lines are dimmed so the commands stand out. */
export function CommandBlock({
  children,
  label,
}: {
  children: string;
  label?: string;
}) {
  const lines = children.split("\n");
  return (
    <div className="border-gl-border bg-gl-bg-subtle overflow-hidden rounded-md border">
      {label && (
        <div className="border-gl-border flex items-center justify-between border-b px-4 py-2">
          <span className="text-gl-text-faint font-mono text-[10.5px] font-semibold tracking-[0.12em] uppercase">
            {label}
          </span>
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="bg-gl-border size-2 rounded-full" />
            <span className="bg-gl-border size-2 rounded-full" />
            <span className="bg-gl-border size-2 rounded-full" />
          </span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.7]">
        <code>
          {lines.map((line, i) => (
            <span key={i}>
              <span
                className={cn(
                  /^\s*#/.test(line)
                    ? "text-gl-text-muted italic"
                    : "text-gl-text",
                )}
              >
                {line}
              </span>
              {i < lines.length - 1 && "\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
