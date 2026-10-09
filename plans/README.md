# Drydock as a full networking learning guide - plan

Written 2026-10-05. This folder is the reference for the whole migration. Each step has its own file; do them in order. `ledger.md` is the chapter-by-chapter checklist.

Moved from `doc/plan/` to `plans/` on 2026-10-09, when the sources were deleted, so the record is versioned. Paths below that start with `doc/` no longer exist.

## Goal

Turn Drydock from "one broken lab" into a complete networking learning guide:

1. **Learn the fundamentals** - 35 chapters (`doc/source-content/networking-notes (1).html`).
2. **Learn how GCP does it** - 24 chapters (`doc/source-content/GCP networking notes.html`).
3. **Prove it on a broken platform** - the existing Harbour lab, now the capstone.

The site keeps its current look (the Annotated Score: off-white page, ink, one blue, fault red, Atkinson Hyperlegible, hairlines, no cards). The additions are a small colour palette for diagrams and widgets, a chapter-reading layout, and new navigation.

When this plan is done, both source HTML files can be deleted with nothing lost.

## Decisions already made (2026-10-05)

| Question | Decision |
| --- | --- |
| Structure | Learning path. Courses at `/learn/fundamentals/<chapter>` and `/learn/gcp/<chapter>`. Harbour keeps `/gcp/harbour/network/...`. |
| Story | Kadé teaches, Harbour tests. Kadé stays the story inside both courses. Harbour is the capstone lab, and defects and chapters link to each other. |
| Colour | A role palette for diagrams and widgets only. Site chrome stays ink + one blue + fault red. Courses may get a small coloured marker, nothing more. |
| Widgets | Port all ~158 as React components. The sources are deleted only when the ledger is complete. |

## What is in the sources

| | Fundamentals | GCP |
| --- | --- | --- |
| Chapters | 35 (0-34) in 6 parts | 24 (0-18.2, some split as 5.1/5.2) in 7 parts |
| Words (incl. tables) | ~61k | ~54k |
| Static SVG diagrams | 44 | 19 |
| Tables | 170 | 185 |
| Code blocks | 31 | 223 (mostly `gcloud`) |
| Distinct widgets | 74 (102 placements) | 84 (85 placements) |
| Widget code | readable JS, ~206 KB | minified JS, ~345 KB; chapter HTML stored gzip+base64 in `<script id="tplz">` |

Source mechanics: each chapter is a `<template class="chapter" data-section data-num data-title>`. Widgets are `<div class="fig" data-fig="name" data-*>` placeholders. JS fills them from `figs[name](dataset)` (returns HTML) and wires them with `inits[name](el, dataset)`.

Diagram colour convention already in the sources: **purple = sender/client**, **cyan = the network in between** (router, gateway, proxy, LB), **green = server/destination and replies**, **orange = the request/outbound leg**, yellow = host bits/highlight, blue = network bits/info. Step 1 turns this into Drydock tokens.

## Steps

| # | Step | File | Size | Depends on |
| --- | --- | --- | --- | --- |
| 0 | ✅ Extract the sources into workable files (done 2026-10-05) | [00-extract.md](00-extract.md) | S | - |
| 1 | ✅ (done 2026-10-05) Update product and design foundations (PRODUCT.md, DESIGN.md, role palette tokens) | [01-foundations.md](01-foundations.md) | M | 0 |
| 2 | ✅ (done 2026-10-05) Content model, routes, chapter page and navigation, proven on a pilot chapter | [02-model-routes-pilot.md](02-model-routes-pilot.md) | L | 1 |
| 3 | ✅ (done 2026-10-06) Migrate the fundamentals course (converter + widgets, part by part) | [03-migrate-fundamentals.md](03-migrate-fundamentals.md) | XL | 2 |
| 4 | ✅ (done 2026-10-06) Migrate the GCP course | [04-migrate-gcp.md](04-migrate-gcp.md) | XL | 2 (3 for shared widgets) |
| 5 | ✅ (done 2026-10-09) Home page, header, `/learn` index, course pages, Harbour as capstone, cross-links | [05-home-nav-crosslinks.md](05-home-nav-crosslinks.md) | L | 3, 4 |
| 6 | ✅ (done 2026-10-09: search, glossary, progress; Kadé reference link skipped) Learning extras | [06-extras.md](06-extras.md) | M | 3, 4 |
| 7 | ✅ (done 2026-10-09) Verify, delete the sources, finish review, document | [07-verify-and-remove.md](07-verify-and-remove.md) | M | all |

Widget porting is the bulk of the work. It is done with each part, not saved for the end, so every merged part is complete and shippable on its own.

Suggested branches/PRs: one per step, and one per part inside steps 3 and 4 (about 13 PRs for the two courses).

## Rules that apply to every step

- Copy uses " - " (spaced hyphen), never an em dash. The sources contain 35 em dashes and ~140 en dashes; convert them. Ranges become `0-34`.
- No cards, chips, pills, shadows, or corners rounder than 2px. Source "pills" become role-coloured text with a small mark.
- No small label or kicker above a heading. The source `eyebrow` ("Chapter 4 · Addressing") moves into the page meta and the chapter rail.
- Blue only means "current" or "followable". Red only means broken. Role colours never mean either.
- Never colour alone: every coloured diagram element also carries a label or a legend entry.
- Next.js 16 here differs from older versions. Read `node_modules/next/dist/docs/` before writing route code (see AGENTS.md).
- Fully static (`output: "export"`). Nothing that needs a server.
- No invented claims (reader counts, testimonials).

## Improvement ideas (beyond a straight port)

Ideas marked ✅ are already part of the steps. The rest are optional; pick them up in step 6 or later.

1. ✅ **Harbour as the final exam.** Each Harbour defect gets "Learn it first: GCP 5.1 Firewall rules". Each GCP chapter gets "See it broken: Harbour D4". This is what turns three things into one guide.
2. ✅ **Numbered sections as moves.** The sources already number every h2 (`01`, `02`...). Render them with the site's move numerals so chapters feel like the rest of Drydock.
3. ✅ **Real cross-links.** The sources say "chapter 3" or "Network notes ch 33" ~670 times. Convert them to links (`<Ch n={3} />`, `<Ch course="fundamentals" n={33} />`). Then each GCP chapter can show "Builds on: Fundamentals 3, 12" automatically.
4. ✅ **Per-chapter widget loading.** Import widgets in each chapter's MDX, not globally in `mdx-components.tsx`, so a chapter only ships its own JS.
5. **Glossary from terms.** The sources mark ~180 terms with `<span class="term">`. Collect them into a `/learn/glossary` page with a link back to where each is introduced.
6. **Static search.** Pagefind indexes `out/` after `next build`: no server, fits the static rule.
7. **Resume where you left off.** The sources already store the last chapter in localStorage. Keep that as a quiet "Continue: 12. How routing works" on the course page.
8. **Kadé reference always one click away.** Chapter 0 of each course is an address book. Link it from the chapter rail as "Kadé reference" and from any address in prose later.
9. **Kadé's own findings.** GCP chapter 0 lists "What is wrong today" and 18.2 closes them. A later pass could show them in the same register style as Harbour's defects.
10. **SEO and sharing.** Per-chapter metadata and a sitemap, since the site is also a portfolio.
11. **Reconcile Harbour's "Fifteen problems" vs 17 defects** while rewriting the home page (open fact in PRODUCT.md).
