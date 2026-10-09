# Step 2 - Content model, routes, chapter page, navigation (pilot)

**Status: done 2026-10-05.** Published: Fundamentals 0 and 4, GCP 0. What shipped, and where it differs from the plan below:

- **Decision: GCP keeps its own colour legend** on the same four hues (teal your VPC, plum run by Google, amber firewall and access rules, green allowed traffic and replies, ink for outside networks, red problems). So tokens and classes are named by hue, not role: `--dd-plum|teal|green|amber` (+ `-soft`), drawing classes `.n.teal`, `.w.amber`, arrowheads `url(#dd-ah-teal)`. Each course has `legend` in `course.ts`; `<Figure>` prints it, and a figure can override with `labels={{ amber: "TCP" }}`.
- **Model:** `Course`, `Part`, `Chapter`, `Hue` in `src/lib/content/types.ts`; registry in `src/lib/content/learn.ts` (`getChapter`, `chapterByNum`, `chapterHref`, `neighbours`, `publishedChapters`, `chapterPosition`). A chapter is published when it has `Content`; unpublished chapters are listed (faint, not linked) and not routed.
- **Content:** `content/learn/<course>/course.ts` (generated, lists all chapters), `chapters/NN-slug.mdx`, `figures/NN-slug.tsx`. `content/learn/index.ts` orders the courses.
- **Routes:** `/learn`, `/learn/[course]`, `/learn/[course]/[chapter]` (static, `dynamicParams = false`). `src/app/learn/layout.tsx` renders the header, footer and `<DiagramDefs />` once.
- **Components (`src/components/learn/`):** `chapter-page.tsx`, `chapter-rail.tsx` (desktop rail + mobile strip and `<dialog>` sheet, scroll-spied sections with a sliding marker), `chapter-list.tsx`, `mdx.tsx` (the chapter vocabulary: `Table`, `Key`, `Note`, `Box`, `Term`, `Label`, `Os`, `Sub`, `Mono`, `Bit`, `St`, `Swatch`, `Ch`, `Recalls`/`Recall`, `Figure`, `Todo`, plus `h2` numbering and `pre` → CommandBlock or output), `figure.tsx`, `swatch.tsx`.
- **Widgets built:** `CidrBar`, `AndGrid` (`widgets/bits.tsx`, with `BitCell`/`BitRow`), `SameNet`, `AddrFind`, shared `WidgetFrame` and `Field`. Pure helpers in `src/lib/net/ipv4.ts`.
- **Header:** main links are Fundamentals · GCP · Labs (`src/lib/content/nav.ts`), used by `PageShell` and the learn layout. The Harbour track layout still has its own links (step 5).
- **Meta line** sits under the lead, never above the title (craft floor bans kickers).
- **Converter moved into this step:** `doc/tools/convert.py` (see step 3).
- **Prettier:** course MDX is ignored (`.prettierignore`), because Prettier's MDX parser wraps table cells in `<p>` and splits inline code. TS/TSX is formatted as usual.
- **Screenshots:** headless Brave enforces a 500px minimum viewport. Use Playwright's headless shell for phone widths: `~/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell --window-size=375,2600 --blink-settings=preferredColorScheme=1 --screenshot=out.png URL` (`=0` for dark).
- `src/app/learn-preview/` is deleted.

Size: L. Build the whole reading experience end to end on **one pilot chapter** before converting 58 more. Pilot: Fundamentals **4. Subnet masks** (one SVG, tables, a summary, "Try it yourself", and three widget kinds: `cidrbar`, `andgrid` x3, `samenet`). Also migrate both **chapter 0s** (Kadé reference pages) because the rail links to them.

Read `node_modules/next/dist/docs/` for the Next 16 App Router conventions (dynamic params, `generateStaticParams`, metadata) before writing routes.

## 1. Types (`src/lib/content/types.ts`)

```ts
export interface Chapter {
  /** "4", "5.1" - shown as the move numeral. */
  num: string;
  slug: string;            // "subnet-masks"
  title: string;           // "Subnet masks"
  lead: string;            // the source's <p class="lead">
  part: string;            // part id, e.g. "addressing"
  Content: MDXContent;
  /** Harbour defects this chapter teaches (step 5). */
  practises?: { lab: string; defect: string }[];
}

export interface Part { id: string; title: string; summary?: string }

export interface Course {
  slug: "fundamentals" | "gcp";
  title: string;           // "Networking fundamentals", "Networking on GCP"
  summary: string;
  parts: Part[];
  chapters: [Chapter, ...Chapter[]];  // chapter 0 is the course's reference page
}
```

Add `courses` to `content/index.ts` next to `providers`, and registry helpers: `getCourse`, `getChapter`, `chapterHref`, `prevNext`, `allChapters`, and slug-uniqueness checks.

## 2. Content layout

```
content/learn/
  index.ts                         export const courses = [fundamentals, gcp]
  fundamentals/
    course.ts                      parts + chapter list (imports each MDX)
    chapters/00-the-kade-scenario.mdx
    chapters/04-subnet-masks.mdx
    figures/04-subnet-masks.tsx    static SVG diagrams for that chapter, as named components
  gcp/
    course.ts
    chapters/00-kade-on-gcp.mdx
    figures/...
src/components/learn/              chapter page, rail, pager, MDX primitives for chapters
src/components/learn/widgets/      one folder per widget family (step 3/4)
src/lib/net/                       pure helpers: ipv4, cidr, mac, bytes, tcp, dns... (unit-testable)
```

Why figures live in TSX files and not inline in MDX: the SVGs are long and would bury the prose. The MDX stays readable (`<MaskDecision />`) and figures stay next to their chapter.

## 3. Routes

- `src/app/learn/page.tsx` - the learning path (both courses + Harbour), built properly in step 5; a plain version is enough now.
- `src/app/learn/[course]/page.tsx` - course index: parts as groups, chapters as numbered rows (like the view guide), word count/reading time per chapter, "Continue" link (step 6).
- `src/app/learn/[course]/[chapter]/page.tsx` - the chapter page. `generateStaticParams` from the registry, `generateMetadata` from title + lead.
- `src/app/learn/[course]/layout.tsx` - the chapter rail.

## 4. The chapter page

Desktop (≥1024px):

```
┌ top bar ──────────────────────────────────────────────────────────┐
│ Drydock?!     Fundamentals  GCP  Labs              theme  menu    │
├───────────────┬───────────────────────────────────────────────────┤
│ Networking    │ Addressing and local delivery · 4 of 34           │
│ fundamentals  │                                                   │
│               │ Subnet masks                     (h1, headline)   │
│ Start here    │ CIDR says where the network part ends...  (lead)  │
│  0. Kadé ref  │                                                   │
│ Addressing    │ 1.  The question before every send                │
│  1. How a req │     prose (68ch)...                               │
│  2. IP addr   │     [ figure breaks out wide ]                    │
│  3. CIDR      │ 2.  What a mask looks like                        │
│ ▸4. Subnet m. │     [ widget ]                                    │
│   1 The quest │  !? Key: two ways to write the same thing         │
│   2 What a m. │ ...                                               │
│  5. Gateway   │ Summary · Try it yourself                         │
│ ...           │ ← 3. Networks, hosts and CIDR   5. The default → │
└───────────────┴───────────────────────────────────────────────────┘
```

- **Chapter rail** (sticky, scrolls on its own, ~240px): course title, parts as plain labels, chapters as numbered rows (mono faint numeral, muted title; current chapter in blue with its section list under it, scroll-spied). Text only - no icons, no boxes.
- **Meta line** (not a kicker above the h1): part name and "4 of 34" sit in muted text above the title row as page context, or below the lead. Pick one in DESIGN.md and keep it consistent.
- **Sections:** MDX `##` headings render with an automatic move numeral (`1.`, `2.`) in mono faint ink in the gutter. "Summary", "Try it yourself" and "Commands in this chapter" have no numeral (the sources mark them `··`).
- **Pager:** previous/next chapter with titles, crossing course boundaries (fundamentals 34 → GCP 0).
- **"Practise this"** slot at the end (filled in step 5 for chapters linked to Harbour defects).

Mobile (<1024px): the rail becomes a "Chapters" button in a sticky strip under the top bar (current chapter title + section), opening a full-height sheet. Same pattern as the source's drawer, styled with Drydock hairlines.

## 5. Chapter MDX primitives (`src/components/learn/mdx.tsx`)

`<Lead>`, `<Key title color?>` (margin mark, `!?` or a role-coloured mark), `<Note>` (existing), `<Term>`, `<Figure wide? caption legend>`, `<Rows cols>` (the source's `.rows` grid as a ruled list), `<Table>` (when GFM is not enough), `<TryIt>` rows (command + OS note + what to look for), `<Summary>`, `<Ch course? n>` (cross-reference link), `<Commands>` (GCP recap using the existing `CommandBlock`). Register these in `src/mdx-components.tsx`. **Do not** register widgets there; chapters import their own.

## 6. Header

Change `PageShell` links to: **Fundamentals** (`/learn/fundamentals`), **GCP** (`/learn/gcp`), **Labs** (`/#labs` or `/labs`), keep the theme toggle and mobile menu. The CTA becomes "Start learning" or stays "Open Harbour" - decide in step 5.

## Clean-up from step 1

- Delete `src/app/learn-preview/` (the role palette check page) once the pilot chapter renders figures.

## Done when

- `/learn/fundamentals/subnet-masks` matches the source chapter 4 in content, with its SVG in role colours, its three widget kinds working, in both themes, at 375px and 1440px.
- Both chapter 0 pages render, including the Kadé map and address book.
- `npm run build`, `npm run lint`, `npm run typecheck` pass; the static export contains the new routes.
- The pilot is reviewed by the author before step 3 starts. This is the moment to change the layout cheaply.
