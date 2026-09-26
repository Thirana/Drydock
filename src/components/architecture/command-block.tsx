import { cn } from "@/lib/utils";

/**
 * A command, set plainly. Long lines wrap inside the block with a hanging
 * indent, so nothing runs into the edge; the text itself is unchanged, so
 * copying yields the original lines. Comment lines are dimmed so the commands stand out.
 */
export function CommandBlock({
  children,
  label,
}: {
  children: string;
  label?: string;
}) {
  const lines = children.split("\n");
  return (
    <figure className="bg-code rounded-[2px]">
      {label && (
        <figcaption className="dd-label px-4 pt-3 sm:px-5">{label}</figcaption>
      )}
      <pre className="px-4 py-3.5 font-mono text-[14px] leading-[1.7] whitespace-pre-wrap sm:px-5 lg:text-[13.5px]">
        <code>
          {lines.map((line, i) => (
            <span
              key={i}
              className={cn(
                "block pl-[2ch] -indent-[2ch] break-all lg:break-normal lg:[overflow-wrap:anywhere]",
                /^\s*#/.test(line) ? "text-ink-muted" : "text-ink",
              )}
            >
              {line
                ? line.split(/(\s+)/).map((part, j) =>
                    // Keep a flag whole so it never splits at its "--": short
                    // ones everywhere, longer ones where the column is wide.
                    part.trim() && part.length <= 60 ? (
                      <span
                        key={j}
                        className={cn(
                          part.length <= 34 && "whitespace-nowrap",
                          "lg:whitespace-nowrap",
                        )}
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )
                : "\u00a0"}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
