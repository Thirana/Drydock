"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IconSearch, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** The parts of Pagefind's browser API this dialog uses. */
interface PagefindData {
  url: string;
  excerpt: string;
  meta: Record<string, string | undefined>;
  sub_results: { title: string; url: string; excerpt: string }[];
}

interface Pagefind {
  options?: (options: Record<string, unknown>) => Promise<void>;
  init?: () => Promise<void>;
  debouncedSearch: (
    query: string,
  ) => Promise<{ results: { data: () => Promise<PagefindData> }[] } | null>;
}

interface Hit {
  url: string;
  title: string;
  where?: string;
  excerpt: string;
  sections: { title: string; url: string }[];
}

type State =
  | { status: "idle" | "loading" | "unavailable" }
  | { status: "done"; query: string; hits: Hit[] };

const PAGEFIND = "/pagefind/pagefind.js";
const LIMIT = 8;

let pagefind: Promise<Pagefind | null> | undefined;

/** The index is written next to the site after `next build`, so it is loaded at run time, not bundled. */
function loadPagefind() {
  pagefind ??= (async () => {
    try {
      const engine: Pagefind = await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */ PAGEFIND
      );
      await engine.options?.({ excerptLength: 22 });
      await engine.init?.();
      return engine;
    } catch {
      return null;
    }
  })();
  return pagefind;
}

/** Pagefind indexes files ("subnet-masks.html"); the site's links have no extension. */
const cleanUrl = (url: string) =>
  url.replace(/\.html(?=#|$)/, "").replace(/\/index(?=#|$)/, "/");

function toHit(data: PagefindData): Hit {
  const url = cleanUrl(data.url);
  return {
    url,
    title: data.meta.title ?? url,
    where: data.meta.where,
    excerpt: data.excerpt,
    sections: data.sub_results
      .map((s) => ({ title: s.title, url: cleanUrl(s.url) }))
      .filter((s) => s.url.includes("#") && s.title)
      .slice(0, 3),
  };
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** A search button for the top bar, and the dialog it opens. "/" or Ctrl/Cmd+K opens it too. */
export function Search({ className }: { className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const router = useRouter();
  const statusId = useId();

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    inputRef.current?.select();
    void loadPagefind();
  }, []);
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const k = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && k === "k") {
        event.preventDefault();
        open();
      } else if (k === "/" && !isTyping(event.target)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const search = async (value: string) => {
    setQuery(value);
    const q = value.trim();
    if (!q) return setState({ status: "idle" });
    setState((s) => (s.status === "done" ? s : { status: "loading" }));
    const engine = await loadPagefind();
    if (!engine) return setState({ status: "unavailable" });
    const found = await engine.debouncedSearch(q);
    // null: a newer keystroke replaced this search.
    if (!found) return;
    const hits = await Promise.all(
      found.results.slice(0, LIMIT).map(async (r) => toHit(await r.data())),
    );
    setState({ status: "done", query: q, hits });
  };

  const first = state.status === "done" ? state.hits[0] : undefined;

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        title="Search (/)"
        aria-haspopup="dialog"
        className={cn(
          "inline-flex size-11 items-center justify-center transition-colors duration-150",
          className,
        )}
      >
        <IconSearch size={17} />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="bg-ground text-ink backdrop:bg-ground/80 m-0 h-dvh max-h-none w-full max-w-none p-0 backdrop:backdrop-blur-sm sm:mx-auto sm:mt-[12vh] sm:h-auto sm:max-h-[76vh] sm:w-[calc(100%-64px)] sm:max-w-[760px]"
      >
        <div className="sm:border-rule flex h-full max-h-[inherit] flex-col sm:rounded-[2px] sm:border">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (!first) return;
              close();
              router.push(first.url);
            }}
            className="border-rule focus-within:border-b-accent flex min-h-14 shrink-0 items-center gap-3 border-b px-5"
          >
            <IconSearch size={17} className="text-ink-muted shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => void search(e.target.value)}
              placeholder="Search the chapters and the lab"
              aria-label="Search the chapters and the lab"
              aria-describedby={statusId}
              autoComplete="off"
              spellCheck={false}
              className="text-ink placeholder:text-ink-faint min-w-0 flex-1 bg-transparent py-3 text-[18px] outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="text-ink-muted hover:text-ink -mr-2.5 inline-flex size-11 shrink-0 items-center justify-center"
            >
              <IconX size={14} />
            </button>
          </form>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
            <p
              id={statusId}
              aria-live="polite"
              className="text-ink-muted pt-4 text-[15px] leading-[1.5]"
            >
              {state.status === "idle" &&
                "Every chapter and every view of the Harbour lab. Try “subnet mask”, “Cloud NAT” or “D6”."}
              {state.status === "loading" && "Searching…"}
              {state.status === "unavailable" &&
                "Search is built with the site, so it works on the published pages and after npm run build, not in the dev server."}
              {state.status === "done" &&
                (state.hits.length
                  ? `${state.hits.length === LIMIT ? "Top" : state.hits.length} ${state.hits.length === 1 ? "match" : "matches"} for “${state.query}”. Enter opens the first.`
                  : `Nothing matches “${state.query}”. Try a shorter word, or the name of a protocol.`)}
            </p>

            {state.status === "done" && state.hits.length > 0 && (
              <ol className="border-rule mt-4 border-t">
                {state.hits.map((hit) => (
                  <li key={hit.url} className="border-rule border-b py-4">
                    <Link
                      href={hit.url}
                      onClick={close}
                      className="text-accent decoration-accent/40 text-[18px] leading-[1.35] font-bold underline decoration-[1.5px] underline-offset-4 transition-colors hover:decoration-current"
                    >
                      {hit.title}
                    </Link>
                    {hit.where && (
                      <p className="text-ink-muted mt-1 text-[14px]">
                        {hit.where}
                      </p>
                    )}
                    <p
                      className="text-ink-body [&_mark]:bg-mark [&_mark]:text-mark-ink mt-1.5 text-[15.5px] leading-[1.55] [&_mark]:px-0.5"
                      // Pagefind escapes the page text and adds only <mark>.
                      dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                    />
                    {hit.sections.length > 0 && (
                      <p className="text-ink-muted mt-2 text-[14.5px] leading-[1.6]">
                        In{" "}
                        {hit.sections.map((s, i) => (
                          <span key={s.url}>
                            {i > 0 && " · "}
                            <Link
                              href={s.url}
                              onClick={close}
                              className="dd-link"
                            >
                              {s.title}
                            </Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
