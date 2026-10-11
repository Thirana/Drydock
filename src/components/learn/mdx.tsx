import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { CommandBlock } from "@/components/architecture/command-block";
import {
  Annotated,
  Col,
  Cols,
  Equation,
  Field,
  Fields,
  Hop,
  Hops,
  Line,
  Part,
  Range,
  RangePart,
  Seg,
  Segments,
  Sketch,
  Tags,
} from "./blocks";
import { Caption, Note } from "@/components/mdx/primitives";
import { IconCheck, IconX } from "@/components/ui/icons";
import { headingId } from "@/lib/content/heading-id";
import { chapterByNum, chapterHref, isPublished } from "@/lib/content/learn";
import type { Course, Hue } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { Figure } from "./figure";
import { ScrollX } from "./scroll-x";
import { Swatch } from "./swatch";

/*
 * The vocabulary a course chapter is written in. Most of it is plain; the
 * pieces that need the course (cross-references, figure keys) are bound to it
 * by `chapterMdxComponents`. Widgets and drawings are imported by each chapter
 * itself, so a page only ships the ones it uses.
 */

/** Sections the notes leave unnumbered: the recap blocks at the end. */
const UNNUMBERED = new Set([
  "Summary",
  "Try it yourself",
  "Commands in this chapter",
]);

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return `${node}`;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

function slugOf(node: ReactNode) {
  return headingId(textOf(node));
}

/** A section heading. Numbered ones take their move numeral from a CSS counter. */
function H2({ children }: { children?: ReactNode }) {
  const numbered = !UNNUMBERED.has(textOf(children).trim());
  return (
    <h2
      id={slugOf(children)}
      data-section={numbered ? "numbered" : "recap"}
      className="dd-section dd-head text-ink border-rule mt-16 mb-5 max-w-[760px] scroll-mt-28 border-t pt-9 text-[26px] sm:text-[30px] lg:scroll-mt-10"
    >
      {children}
    </h2>
  );
}

/** Ruled rows; scrolls sideways inside itself when the page is narrow. */
function Table({
  widths,
  children,
}: {
  /** Column widths, e.g. ["28%", "36%", "36%"], when even columns read better. */
  widths?: string[];
  children: ReactNode;
}) {
  return (
    <div className="my-8">
      <ScrollX>
        <table className="w-full min-w-[560px] border-collapse text-left">
          {widths && (
            <colgroup>
              {widths.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
          )}
          {children}
        </table>
      </ScrollX>
    </div>
  );
}

/** A fenced block: shell commands go through CommandBlock, source code sits on code ground, anything else is printed output. */
function Pre({ children }: { children?: ReactNode }) {
  const code = Children.only(children) as ReactElement<{
    className?: string;
    children?: ReactNode;
  }>;
  const lang = code.props.className?.replace("language-", "");
  const text = textOf(code.props.children).replace(/\n$/, "");
  if (lang === "sh")
    return (
      <div className="not-prose my-5 max-w-[860px]">
        <CommandBlock>{text}</CommandBlock>
      </div>
    );
  if (lang === "code")
    return (
      <pre className="not-prose bg-code text-ink my-5 max-w-[860px] overflow-x-auto rounded-[2px] px-4 py-3.5 font-mono text-[13.5px] leading-[1.65] sm:px-5">
        {text}
      </pre>
    );
  return (
    <pre className="not-prose border-rule text-ink-body my-5 max-w-[860px] overflow-x-auto rounded-[2px] border px-4 py-3 font-mono text-[13px] leading-[1.6] sm:px-5">
      {text}
    </pre>
  );
}

/** The annotator's marks, set in the gutter like the margin notes. */
function Aside({
  mark,
  markClass,
  title,
  children,
}: {
  mark?: string;
  markClass?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="border-rule my-10 grid max-w-[760px] grid-cols-[28px_minmax(0,1fr)] gap-x-2 border-t pt-5">
      <span
        aria-hidden="true"
        className={cn(
          "pt-[3px] font-mono text-[15px] font-bold",
          markClass ?? "text-ink",
        )}
      >
        {mark}
      </span>
      <div className="min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {title && (
          <p className="not-prose text-ink mb-2 text-[17px] leading-[1.35] font-bold">
            {title}
          </p>
        )}
        {children}
      </div>
    </aside>
  );
}

/** A key idea: the move worth remembering. */
function Key({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Aside mark="!" title={title}>
      {children}
    </Aside>
  );
}

const BOX: Record<
  string,
  { mark?: string; markClass?: string; label: string }
> = {
  problem: { mark: "?", markClass: "text-fault", label: "The problem" },
  fixed: { mark: "!", label: "Fixed" },
  check: { mark: "$", markClass: "text-ink-muted", label: "gcloud check" },
  console: { label: "Console" },
  cost: { label: "Cost and limits" },
  exam: { label: "Exam angle" },
};

/** The GCP notes' recurring blocks: the problem, the fix, a read-only check, and so on. */
function Box({
  kind,
  title,
  children,
}: {
  kind: keyof typeof BOX;
  title?: string;
  children: ReactNode;
}) {
  const box = BOX[kind] ?? BOX.check;
  return (
    <Aside mark={box.mark} markClass={box.markClass} title={title ?? box.label}>
      {children}
    </Aside>
  );
}

/**
 * One thing to try at the end of a chapter: what it shows as the title, a few
 * plain bullets (steps, what to look for, where it runs, which section it goes
 * with), then the command to run. Numbered in the gutter like the sections.
 */
function TryIt({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-rule my-8 grid max-w-[760px] grid-cols-[28px_minmax(0,1fr)] gap-x-2 border-t pt-5">
      <span
        aria-hidden="true"
        className="text-ink-faint pt-[3px] font-mono text-[14px] font-bold"
      >
        {n}.
      </span>
      <div className="min-w-0 [&_li]:mt-1 [&_li]:text-[16.5px] [&_li]:leading-[1.55] [&_ul]:my-0 [&_ul]:pl-5 [&>div]:mt-4 [&>div]:mb-0">
        <h3 className="not-prose text-ink mb-2 text-[17px] leading-[1.35] font-bold">
          {title}
        </h3>
        {children}
      </div>
    </section>
  );
}

function Term({ children }: { children: ReactNode }) {
  return <dfn className="text-ink font-semibold not-italic">{children}</dfn>;
}

/** Names the block that follows: "Output", "What it tells you". */
function Label({ children }: { children: ReactNode }) {
  return <p className="dd-label not-prose mt-5 mb-2">{children}</p>;
}

/** Which system a command is for, under the command. */
function Os({ children }: { children: ReactNode }) {
  return (
    <span className="text-ink-muted mt-1 block font-mono text-[12.5px] leading-[1.4] whitespace-normal">
      {children}
    </span>
  );
}

/** A second, smaller line inside a table cell. */
function Sub({ children }: { children: ReactNode }) {
  return (
    <span className="text-ink-muted mt-0.5 block font-sans text-[14px] leading-[1.45] whitespace-normal">
      {children}
    </span>
  );
}

/** A value to read exactly: an address, a result, a field. */
function Mono({ children }: { children: ReactNode }) {
  return (
    <span className="text-ink font-mono text-[14.5px] whitespace-nowrap">
      {children}
    </span>
  );
}

/** A single bit, set like a cell of the bit grids: network part or host part. */
function Bit({ k, children }: { k: "net" | "host"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "text-ink inline-grid h-6 min-w-[18px] place-items-center rounded-[2px] border px-0.5 align-[-0.3em] font-mono text-[13px]",
        k === "net" ? "border-teal bg-teal-soft" : "border-rule-strong bg-mark",
      )}
    >
      {children}
    </span>
  );
}

/** A status word in a table: fine in ink, broken in red, planned in muted ink. */
function St({
  k,
  children,
}: {
  k: "ok" | "bad" | "plan" | "here";
  children: ReactNode;
}) {
  if (k === "ok")
    return (
      <span className="text-ink inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
        <IconCheck size={11} />
        {children}
      </span>
    );
  if (k === "bad")
    return (
      <span className="text-fault inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
        <IconX size={10} />
        {children}
      </span>
    );
  return (
    <span className="text-ink-muted ml-1 text-[14px] whitespace-nowrap">
      {children}
    </span>
  );
}

/** Content that has not been migrated yet. Never ships: step 7 checks for it. */
function Todo({
  kind,
  widget,
  children,
}: {
  kind?: string;
  widget?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-fault text-fault my-6 border border-dashed p-4 text-[15px]">
      Not migrated yet: {widget ? `widget ${widget}` : kind}
      {children}
    </div>
  );
}

/**
 * Components bound to a course: chapter references resolve within it (or into
 * another course with `course="…"`), and figure keys read its legend.
 */
export function chapterMdxComponents(course: Course): MDXComponents {
  /** A reference to another chapter; plain text until that chapter is published. */
  function Ch({
    n,
    course: other,
    section,
    children,
  }: {
    n: string;
    course?: string;
    /** A `##` heading in that chapter, to link straight to it. */
    section?: string;
    children: ReactNode;
  }) {
    const slug = other ?? course.slug;
    // "Chapter 5" in a course that splits it into 5.1 and 5.2 means its start.
    const target = chapterByNum(slug, n) ?? chapterByNum(slug, `${n}.1`);
    if (!target || !isPublished(target.chapter)) return <>{children}</>;
    return (
      <Link
        href={
          section
            ? `${chapterHref(target)}#${headingId(section)}`
            : chapterHref(target)
        }
        title={section ?? target.chapter.title}
      >
        {children}
      </Link>
    );
  }

  /**
   * A muted line of chapter links under a heading: "Builds on" (the default)
   * for what a section relies on, or another label such as "On GCP" for
   * where the other course takes it further.
   */
  function Recalls({
    label = "Builds on",
    children,
  }: {
    label?: string;
    children: ReactNode;
  }) {
    return (
      <p className="not-prose text-ink-muted -mt-1 mb-6 flex max-w-[760px] flex-wrap gap-x-2 gap-y-1 text-[15px] leading-[1.5]">
        <span>{label}</span>
        {Children.toArray(children).map((child, i) => (
          <span key={i} className="inline-flex gap-x-2">
            {i > 0 && <span aria-hidden="true">·</span>}
            {child}
          </span>
        ))}
      </p>
    );
  }

  function Recall({
    n,
    course: other = "fundamentals",
    section,
    children,
  }: {
    n: string;
    course?: string;
    /** A `##` heading in that chapter, to link straight to it. */
    section?: string;
    children: ReactNode;
  }) {
    const target = chapterByNum(other, n);
    const label = (
      <>
        <span className="font-mono text-[14px]">{n}.</span> {children}
      </>
    );
    if (!target || !isPublished(target.chapter))
      return <span className="text-ink-body">{label}</span>;
    return (
      <Link
        href={
          section
            ? `${chapterHref(target)}#${headingId(section)}`
            : chapterHref(target)
        }
        className="dd-link"
      >
        {label}
      </Link>
    );
  }

  return {
    h2: H2,
    pre: Pre,
    Table,
    Key,
    Note,
    Box,
    TryIt,
    Term,
    Label,
    Os,
    Sub,
    Mono,
    Bit,
    St,
    Swatch: ({ hue }: { hue: Hue | "ink" | "fault" }) => (
      <Swatch hue={hue} className="mr-2" />
    ),
    Caption,
    Todo,
    Cols,
    Col,
    Tags,
    Sketch,
    Equation,
    Part,
    Segments,
    Seg,
    Hops,
    Hop,
    Range,
    RangePart,
    Fields,
    Field,
    Annotated,
    Line,
    Ch,
    Recalls,
    Recall,
    Figure: (props: Omit<Parameters<typeof Figure>[0], "legend">) => (
      <Figure legend={course.legend} {...props} />
    ),
  };
}
