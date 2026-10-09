# Step 6 - Learning extras

**Status: done 2026-10-09** for search, glossary and progress. The Kadé reference link (item 3) and Kadé's findings register (item 5) were not chosen.

- **Search:** `pagefind` 1.5.2 (dev dependency); `npm run build` is now `next build && pagefind --site out`. Indexed: the chapter `<article>` and the lab view `<article>` (`data-pagefind-body`, 66 pages). `WidgetFrame`, `Figure` and `DiagramFrame` carry `data-pagefind-ignore`. Result title and "where" come from `SearchMeta` (`src/components/site/search-meta.tsx`). UI in `src/components/site/search.tsx`, loaded from `/pagefind/pagefind.js` at run time; in `next dev` it says search needs a build. Excerpts sometimes run two table cells together - Pagefind's text extraction, left as is.
- **Glossary:** `src/lib/content/glossary.ts` reads the MDX at build time (no hand-written definitions): 166 terms, the introducing sentence quoted (plus the one before when it is under 70 characters). Page `src/app/learn/glossary/page.tsx`; linked from `/learn`, the course pages and the footer.
- **Progress:** `src/lib/progress.ts` (`dd-progress` in localStorage, try/catch everywhere, `useSyncExternalStore`). The rail records each visit and marks opened chapters with a faint check; `ContinueReading` on the course page.

Size: M. Each item is independent and can be skipped or reordered. All of them stay static.

## 1. Search (recommended)

- Use **Pagefind**: run it after `next build` on `out/` (`"build": "next build && pagefind --site out"`). No server, no external service.
- Index only chapter bodies and Harbour views (`data-pagefind-body` on the article); exclude the rail, pager and widgets' changing output.
- UI: a search button in the top bar opening a plain dialog: input, results as ruled rows (chapter title, part, matching excerpt with the match marked in `--dd-mark`). No cards.

## 2. Glossary

- `<Term>` gets an optional `id`. A build-time collector (the course registry can import the MDX sources as text, or a small script writes `content/learn/glossary.json`) lists every term with the chapter that introduces it.
- `/learn/glossary`: alphabetical, each term with a one-line definition (written once, by hand, for the ~180 terms) and "introduced in 4. Subnet masks".
- Optional later: terms in prose link to their glossary entry the first time they appear in a chapter.

## 3. Kadé reference

- Chapter 0 of each course is the address book. Add a "Kadé reference" link at the top of the chapter rail and in the mobile chapter sheet.
- Later: addresses in prose (`10.10.1.10`, `api.kade.lk`) could show what they are on hover/focus. Only if the reading stays quiet.

## 4. Progress and resume

- localStorage only (per-viewer convenience, wrapped in try/catch, the page works without it): last chapter per course and chapters opened.
- Course page: "Continue: 12. How routing works". Rail: a faint mark beside chapters already opened. No percentages, streaks or badges.

## 5. Kadé's findings register (later)

GCP chapter 0 lists "What is wrong today", and 18.2 closes them. Model them like Harbour's defects and reuse the register UI, so the course has its own small score.

## Done when

Whichever items were chosen are shipped, documented in DESIGN.md (search dialog, glossary list) and pass the same checks as other pages.
