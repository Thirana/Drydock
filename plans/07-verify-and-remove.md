# Step 7 - Verify, delete the sources, finish

**Status: 2026-10-09.** What was done:

- **Coverage:** a script compared every extracted chapter with its MDX (sections, figures, widgets, tables, code, words), then every source text block (paragraph, list item, table cell, heading, caption) against the MDX. Differences were explained (Try-it tables became `<TryIt>` items; colour words and "network notes" were reworded on purpose) except real losses, all restored: the words around single commands in 15 Try-it items across 12 chapters ("Same command with ...", "..., then open any site"), the last Try-it row of fundamentals 22, and the two Layer 4 / Layer 7 captions in fundamentals 33. Three em dashes and one stale "(orange)" in widget data were fixed.
- **Checks:** `check-mdx` (59 of 59), typecheck, lint, build, Pagefind (66 pages). A headless sweep of all 74 built pages at 375 and 1440: no page overflow, no runtime errors, no unnamed controls, no duplicate ids, no images without alt. The header now ignores a trailing `.html` (a static host serving `/labs.html` caused a hydration mismatch).
- **Performance:** every page shipped all 158 widgets (~1.17 MB of JS), because the course registry imported every chapter's MDX and every route reaches the registry through the header. Now `course.ts` holds metadata only, chapter text is in `chapters.ts` (imported by the chapter route alone), and chapters import widgets through `src/components/learn/widgets/lazy.tsx` (`next/dynamic`, still server-rendered). Non-chapter pages ship ~600 KB, a chapter ~630-710 KB depending on its widgets.
- **Detector:** only advisory font sizes that DESIGN.md's type ramp does not list yet.
- **Sources deleted:** `doc/source-content/`, `doc/extract/`, `doc/tools/` (with the author's approval). This plan moved to `plans/`.
- README.md and PRODUCT.md updated.
- **Finish review:** disposition "fix" with eight material fixes (search excerpts garbled by label-only strips, a widget clipping on phones and missing scroll cues, glossary letters hidden on phones, a right-aligned pager, a chapter strip that looked like the site menu, a decorative blur, the lab page's stat row, three edge mismatches). All eight applied; one caused a desktop regression (fixed with a container query); closing verdict "ship". Not reviewed because never captured: /labs, the course index pages, the Continue line, the rail's opened ticks. Ideas raised but not done: a blue marker on the learning path for the reader's stage, the push-back line as a margin mark, a /learn layout that does not repeat the home page.
- **DESIGN.md and .impeccable/design.json regenerated** from the shipped code: type ramp now matches the sizes in use, new components documented, drifted prose corrected.

Size: M. The gate before `doc/source-content/` is deleted.

## 1. Content completeness

- Every row in `ledger.md` is ticked.
- `grep -rn "<Todo" content/ src/` returns nothing.
- A coverage script (`doc/tools/coverage.mjs`) compares the extracted sources with the new MDX, per chapter:
  - number of `##` sections equals the source's `h2` count;
  - number of `<Figure>` equals the source's static SVG count;
  - every `data-fig` widget in the source has its component imported and used in that chapter;
  - table and code-block counts match (or the difference is explained in the ledger);
  - word count within ~3% of the source (catches dropped paragraphs).
- No em dashes: `grep -rn "—" content/ src/` returns nothing.

## 2. Quality

- `npm run lint`, `npm run typecheck`, `npm run build` pass; `out/` contains every chapter route.
- Impeccable detector over the changed UI: `.claude/skills/impeccable/scripts/impeccable detect --json src/components/learn src/app/learn src/app/page.tsx`.
- One batched visual pass: every chapter at 375px and 1440px, light and dark (screenshots), fixed in one batch, confirmed once.
- Accessibility: keyboard through the rail, pager, every widget; `aria-live` outputs; focus visible; reduced motion; contrast of role colours.
- Performance: a chapter page ships only its own widgets (check the build output per route).

## 3. Remove the sources

Only after 1 and 2 pass:

- Delete `doc/source-content/`, `doc/extract/`, `doc/tools/`.
- Keep `doc/plan/` (or move it into the repo) as the record.

## 4. Finish

- Run the Impeccable finish review on the new surfaces.
- Regenerate DESIGN.md from the shipped code (`/impeccable document`) so it reflects the role palette, chapter rail, widgets and the new home page.
- Update PRODUCT.md "Evidence on hand" and README.md.
