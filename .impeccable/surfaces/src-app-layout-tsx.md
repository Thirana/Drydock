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

FIRST VIEWPORT: Home - quiet top bar; large sans headline left-aligned, lead and one ink button; beneath, the Harbour score as a notation line of moves 0-6 with defects listed under each move, the current move in blue, played moves' defects struck through; the map follows below. Track views - top bar, the views as a notation line "1. About 2. Map ...", then title and lead in the reading column.

FORM: Annotated Score (assigned candidate 4 of 7, re-roll round 1 steered minimal), seed key ca464d4d. Raises: restraint (one headline per view), two-value text contrast, plain literal labels, one continuous column with a moving current edge.

Signature interaction: a blue marker slides along the notation line to the current move; defects under played moves strike through as the marker passes.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
