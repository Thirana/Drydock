import { flushSync } from "react-dom";

type Transition = { finished: Promise<unknown> };
type Doc = Document & {
  startViewTransition?: (update: () => void) => Transition;
};

let latest = 0;

/**
 * Apply a state change inside a view transition, so the old content leaves
 * and the new one arrives instead of swapping in place.
 *
 * `kind` lands on `html[data-vt]`, so each widget's CSS only animates its own
 * transitions. `dir` sets `html[data-vt-dir]` for sideways motion. `scope`
 * gets `data-vt-active` for the duration, which is how a widget used many
 * times on one page names only the copy being changed.
 *
 * Falls back to a plain update where view transitions are missing or motion
 * is reduced.
 */
export function withTransition(
  update: () => void,
  {
    kind,
    dir,
    scope,
  }: { kind: string; dir?: "fwd" | "back"; scope?: HTMLElement | null },
) {
  const doc = document as Doc;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced) {
    update();
    return;
  }
  const html = document.documentElement;
  const token = ++latest;
  html.dataset.vt = kind;
  html.dataset.vtDir = dir ?? "none";
  scope?.setAttribute("data-vt-active", "");
  const transition = doc.startViewTransition(() => flushSync(update));
  transition.finished.finally(() => {
    scope?.removeAttribute("data-vt-active");
    if (token !== latest) return;
    delete html.dataset.vt;
    delete html.dataset.vtDir;
  });
}
