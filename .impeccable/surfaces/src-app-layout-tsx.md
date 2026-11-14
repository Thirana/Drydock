---
version: 1
slug: "src-app-layout-tsx"
primary_target: "src/app/layout.tsx"
related_targets: ["src/app/page.tsx","src/app/[provider]/[lab]/page.tsx","src/app/[provider]/[lab]/[track]/layout.tsx"]
---

# Surface brief: Drydock site (all routes)

Scope: whole site - home, provider, lab index, every track view. Visitor mode: Read (track views, lab index) with a Persuade opening on home. Light and dark themes, reader-toggled, system default.

Audience and job: cloud engineers reasoning through a broken platform in fix order; evaluators skimming the author's thinking. Proof is the real Harbour model (17 defects, phases 0-6, 6 journeys). Constraints: static export, no invented claims, " - " never em dash.

History: user rejected the original dark card dashboard, then rejected the built "cutting bench" world (too loud). Current steer, user's words: "minimal, but unique, easy to read and go through".

## Direction contract

THESIS: A track reads like an annotated game. Phases are numbered moves on one notation line, defects carry the annotator's marks (?? ? ?! with the word), the author's disagreements are margin notes. Refuses: cards, chips, sidebars of icons, and loud material costume.

OWN-WORLD: Neutral white page (dark: near-black), near-black ink, one blue for the current move and links, a red reserved for faults. Atkinson Hyperlegible Next for everything read, Atkinson Hyperlegible Mono for move numbers, IDs and commands. Hairline rules, generous white space, one reading column; diagrams break out wide. No shadows, no pills, 2px corners at most.

STORY: The reader sees the order first as a line of numbered moves, then reads each move and its marks; nothing competes with the text.

FIRST VIEWPORT: Home (redesigned 2026-11-14, code-led; user rejected an interactive stage in the hero, route lines between headline lines, a six-box drawing as too simple, and a full-width drawing with a chapter key as too much) - a split: on the left the tagline, lead, the ink button "Start with chapter 1" and ghost "Jump to GCP"; on the right one unframed static drawing at chapter weight, capped at 600px and aligned to the column's right edge (a margin bleed read as oversized), drawn for the home page from GCP chapter 0's facts: Kadé's project as found (Cloud DNS, the load balancer at 34.120.88.10, kade-vpc with sn-app's two VMs and sn-data's kade-db, the firewall table) with red numbered problems 1-5, wires drawing in once, no caption (user asked to drop the frame and the text under it, and to give the space and some vertical air to the drawing). Phones scroll the drawing sideways like a course figure. Below the fold: "Try five steps of that request" - a hairline of five numbered moves in the order Kadé's request meets them (1. Resolve a name 2. Leave home 3. Cross the load balancer 4. Pass the firewall 5. Reach the database) with the sliding blue marker; text left, figure right, /#try-N links to one. Moves 1-4 are small figures drawn for this page (src/components/site/landing/steps.tsx) in the course vocabulary, one switch and one verdict each, facts from Fundamentals 22 and 10 and GCP 12.1 and 5.1 (the user found the chapters' full DnsSim, FwWalk and LbChain too complex here, and the Harbour move off-topic); move 5 is the course's SameNet; the three stages as numbered moves; the Kadé section with a three-way switch over chapter 0's drawings (whole map, cloud today, cloud at the end) above both courses' parts; then Harbour: text left, and on the right D6 followed in the five steps' frame (Find it / Put it in order / Fix it) over a drawing of the platform around it. User-approved exception (2026-11-14): this home-page lab drawing uses the GCP course legend hues (plum = run by Google, green = allowed traffic) to match the page's other drawings; defects stay red. Lab pages stay monochrome. Track views - top bar, the views as a notation line "1. About 2. Map ...", then title and lead in the reading column.

FORM: Annotated Score (assigned candidate 4 of 7, re-roll round 1 steered minimal), seed key ca464d4d. Raises: restraint (one headline per view), two-value text contrast, plain literal labels, one continuous column with a moving current edge.

Signature interaction: a blue marker slides along the notation line to the current move; defects under played moves strike through as the marker passes.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion on the home page

Switching content inside a home widget runs as a view transition (`src/lib/view-transition.ts`, rules at the end of `globals.css`), never an in-place swap. The five steps: the old move leaves sideways in 150ms, the new copy arrives from the direction of travel with a slight blur, and the figure follows 60ms later; the blue marker slides between tabs. Inside a drawing (the `Step` widgets and Harbour's D6): the drawing crossfades and the verdict rises 6px. Kadé's maps crossfade. The rest of the page holds still. Reduced motion and browsers without view transitions get a plain swap (the latter keep `.dd-stage-in`).

## Phones (below 768px)

The home page is rewritten for a phone, not shrunk. Nothing on it scrolls sideways.
- Hero: `RequestDrawingPhone`, the request's path drawn upright at 1:1 (viewBox 350 wide), with the five problems as a list under it.
- Five steps: `TryRoute`, a vertical route with a stop per step: name, question, what the figure shows (red if it is a fault), and "Try it in chapter N".
- Kadé's maps are left out; the course part lists stay.
- Harbour: D6 as three short reads (Find it, Put it in order, Fix it) instead of the drawing.
- `DesktopHint` (site-wide, in the root layout): once per browser, on a first phone visit, a paper sheet with an ink hairline and the blue marker bar on its top edge shows a small drawing (this phone at its real width, wired to a laptop at 1024px +) and says the figures are best on a laptop or tablet, with "Got it" and "Send me the link" (share sheet, else copy).
