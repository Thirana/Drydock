---
name: Drydock
description: Deliberately broken cloud architectures, and how to fix them step by step.
colors:
  signal-teal: "#2eb8a0"
  signal-teal-hover: "#3ecdb5"
  signal-teal-soft: "#0d2420"
  signal-teal-ink: "#051a16"
  drydock-charcoal: "#161918"
  keel-shadow: "#101210"
  hull-graphite: "#1d201e"
  raised-graphite: "#252924"
  seam-line: "#2c312d"
  field-line: "#383d39"
  chalk-line: "#d8ddd6"
  chalk-ink: "#eef0ec"
  weathered-sage: "#8a9189"
  faint-sage: "#606963"
  rust-alarm: "#b87060"
  rust-soft: "#261009"
  rust-ink: "#1c0907"
  ochre-lamp: "#c4a05e"
  ochre-soft: "#231a07"
  sage-clear: "#69b598"
  sage-clear-soft: "#0d2419"
  periwinkle-compute: "#8285ba"
  periwinkle-soft: "#161628"
  rose-data: "#b87da2"
  halo-sage: "rgba(111, 200, 160, 0.16)"
  mask-stop: "#000"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "78px"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
    fontFeature: "\"cv02\", \"cv03\", \"cv04\", \"cv11\""
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.028em"
  chapter:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.028em"
  page-title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.022em"
  feature-title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  subtitle:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.018em"
  lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body-large:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  control:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.005em"
  small-body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.12em"
  data:
    fontFamily: "Geist Mono, JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\""
  evidence:
    fontFamily: "Geist Mono, JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: "Geist Mono, JetBrains Mono, ui-monospace, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  scrollbar: "3px"
  xs: "4px"
  code-inline: "5px"
  segment: "7px"
  sm: "8px"
  well: "9px"
  inset: "10px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  gutter-sm: "20px"
  gutter-md: "32px"
  gutter-lg: "48px"
  card-sm: "20px"
  card-md: "24px"
  card-lg: "28px"
  grid-gap: "20px"
  section-sm: "48px"
  section-md: "64px"
  section-lg: "80px"
  chapter-rail: "148px"
components:
  button-primary:
    backgroundColor: "rgba(46, 184, 160, 0.16)"
    textColor: "{colors.signal-teal}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "9px 14px"
  button-primary-hover:
    backgroundColor: "rgba(46, 184, 160, 0.24)"
    textColor: "{colors.signal-teal}"
  button-primary-lg:
    backgroundColor: "rgba(46, 184, 160, 0.16)"
    textColor: "{colors.signal-teal}"
    rounded: "{rounded.inset}"
    padding: "13px 22px"
  button-secondary:
    backgroundColor: "rgba(238, 240, 236, 0.06)"
    textColor: "{colors.chalk-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "9px 14px"
  button-secondary-hover:
    backgroundColor: "rgba(238, 240, 236, 0.10)"
    textColor: "{colors.chalk-ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.weathered-sage}"
    rounded: "{rounded.lg}"
    padding: "9px 14px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.weathered-sage}"
    rounded: "{rounded.sm}"
    size: "32px"
  segment-active:
    backgroundColor: "{colors.signal-teal}"
    textColor: "{colors.signal-teal-ink}"
    rounded: "{rounded.segment}"
    padding: "7px 12px"
  segment-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.weathered-sage}"
    rounded: "{rounded.segment}"
    padding: "7px 12px"
  toggle-chip:
    backgroundColor: "{colors.hull-graphite}"
    textColor: "{colors.weathered-sage}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  toggle-chip-active:
    backgroundColor: "{colors.signal-teal-soft}"
    textColor: "{colors.signal-teal}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  nav-item-active:
    backgroundColor: "{colors.signal-teal}"
    textColor: "{colors.signal-teal-ink}"
    rounded: "{rounded.segment}"
    padding: "8px 10px"
  phase-step-active:
    backgroundColor: "{colors.hull-graphite}"
    textColor: "{colors.chalk-ink}"
    rounded: "{rounded.well}"
    padding: "10px 12px"
  chapter-progress:
    backgroundColor: "{colors.signal-teal}"
    rounded: "{rounded.pill}"
    size: "11px"
  chapter-progress-healthy:
    backgroundColor: "{colors.sage-clear}"
    rounded: "{rounded.pill}"
    size: "11px"
  card-feature:
    backgroundColor: "{colors.hull-graphite}"
    textColor: "{colors.chalk-ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-lg}"
  card-stat:
    backgroundColor: "{colors.hull-graphite}"
    textColor: "{colors.chalk-ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-sm}"
  inner-well:
    backgroundColor: "{colors.raised-graphite}"
    textColor: "{colors.chalk-ink}"
    rounded: "{rounded.inset}"
    padding: "16px"
  state-well:
    backgroundColor: "{colors.drydock-charcoal}"
    textColor: "{colors.chalk-ink}"
    typography: "{typography.evidence}"
    rounded: "{rounded.inset}"
    padding: "14px 16px"
  command-block:
    backgroundColor: "{colors.keel-shadow}"
    textColor: "{colors.chalk-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "16px"
  severity-critical:
    backgroundColor: "{colors.rust-alarm}"
    textColor: "{colors.rust-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  severity-high:
    backgroundColor: "{colors.rust-soft}"
    textColor: "{colors.rust-alarm}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  severity-medium:
    backgroundColor: "{colors.ochre-soft}"
    textColor: "{colors.ochre-lamp}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  severity-low:
    backgroundColor: "{colors.raised-graphite}"
    textColor: "{colors.weathered-sage}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  defect-chip:
    backgroundColor: "{colors.rust-soft}"
    textColor: "{colors.rust-alarm}"
    typography: "{typography.data}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  closed-badge:
    backgroundColor: "{colors.sage-clear-soft}"
    textColor: "{colors.sage-clear}"
    typography: "{typography.data}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  risk-pill:
    backgroundColor: "{colors.ochre-soft}"
    textColor: "{colors.ochre-lamp}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: Drydock

<!-- Source of truth: this file supersedes design-system/. That folder was extracted from a different product and stays only as a class-recipe reference; patterns it describes that Drydock does not ship are not part of this system. Tokens live in src/app/globals.css. -->

## Overview

**Creative North Star: "The Hull on Blocks"**

A ship in dry dock is lifted out of the water so every seam, weld and patch can be seen. Drydock's interface does the same for a cloud platform. The ground is a calm, green-tinted charcoal. The structure sits on it plainly: diagrams, registers and commands rendered at full fidelity, with nothing decorative in the way. One colour, Signal Teal, marks what is active, selected or moving forward. Everything else is matte and desaturated, so a rust badge or a failing hop reads immediately as the flaw, and sage reads immediately as the fix.

The density is that of a technical workbench, not a brochure. Type is tight and bold at the top of the hierarchy and quiet below it. Anything that is evidence (defect IDs, phase numbers, counts, IP ranges, configuration, `gcloud` commands) is set in Geist Mono with tabular figures. Depth comes from a four-rung surface ladder with soft shadows rather than lines or ornament. Motion is short, purposeful and always stoppable: headlines rise, the phase rail fills, cards lift a couple of pixels, and anything that plays on its own has a pause.

The graphics are the product itself. Marketing surfaces show live renders of the real architecture model, a real register entry and real commands, never illustrations or animated stand-ins. The system is dark only, gradient text is retired, and every surface stays readable with JavaScript off.

**Key Characteristics:**
- Dark only, on green-tinted charcoal, never pure black or navy.
- One saturated signal (teal) for state; rust for broken, sage for fixed, ochre for risk.
- Depth from the surface ladder plus soft shadows; one hard chalk-line shadow per page.
- Evidence in mono: IDs, phases, counts, configuration and commands use Geist Mono with tabular figures.
- Product previews built from the real model, not illustrations.
- Nothing below 11px; nothing a reader must read in faint sage.
- Quiet motion that pauses, respects `prefers-reduced-motion`, and never hides content from a page without JavaScript.

## Colors

A near-monochrome forest-charcoal ground with one signal teal and a small set of matte hues, each assigned a single job.

### Primary
- **Signal Teal** (`signal-teal`): the only saturated colour. Used for the active nav item, the active segment, the selected tour tab, focus rings, phase-rail and chapter progress, links, map selection strokes, tinted primary buttons, the "closes here" marker on a sequence, and one highlighted word per heading. It always means "this is where you are" or "this moved forward", never a category and never a finished fix.
- **Signal Teal Hover** (`signal-teal-hover`): hover state for teal links and solid teal controls.
- **Signal Teal Soft** (`signal-teal-soft`): background for active toggle chips, active mobile nav pills and the selected tour tab's icon.
- **Signal Teal Ink** (`signal-teal-ink`): text on a solid teal fill (active segment, active sidebar item).

### Secondary
- **Rust Alarm** (`rust-alarm`), **Rust Soft** (`rust-soft`), **Rust Ink** (`rust-ink`): defects and failure. Critical severity is solid rust with rust ink; high severity, defect ID chips, open-defect counts and callouts, failing packet hops, "Now" labels and the focused defect row in a dependency list use rust on rust soft. Danger-toned dashed strokes mark defective paths on the map.
- **Ochre Lamp** (`ochre-lamp`), **Ochre Soft** (`ochre-soft`): medium severity, risk and caution. The "High risk" phase pill and the verify-before-moving-on panel are ochre. On the map, ochre is the **edge** tone (load balancers, Cloud Armor, public ingress).

### Tertiary
- **Sage Clear** (`sage-clear`), **Sage Clear Soft** (`sage-clear-soft`): passed and fixed. "Fixed" labels, "all N defects closed" badges, closed map callouts, passing journeys, "Closes in phase N", verifiable claims' check bullets, chapter progress once the reader reaches Healthy, and the map's **private** tone.
- **Periwinkle Compute** (`periwinkle-compute`), **Periwinkle Soft** (`periwinkle-soft`): the map's **compute** tone.
- **Rose Data** (`rose-data`): the map's **data** tone (Cloud SQL, storage, caches).

### Neutral
- **Drydock Charcoal** (`drydock-charcoal`): page background. Also the recessed ground inside diagram frames, preview wells and the Now/Fixed state well.
- **Keel Shadow** (`keel-shadow`): the lowest rung. Track sidebar, command blocks, segmented-control and phase-rail wells, table headers, figure chrome bars.
- **Hull Graphite** (`hull-graphite`): cards, register entries, stat cards, the active phase step, announcement pills.
- **Raised Graphite** (`raised-graphite`): nested panels inside cards (Now/Fixed boxes), inline code, low-severity badges, provider and track chips, row hover.
- **Seam Line** (`seam-line`): every default 1px border, divider and table rule.
- **Field Line** (`field-line`): slightly brighter border for hovered chips, unreached progress dots and link underlines.
- **Chalk Line** (`chalk-line`): border and hard offset shadow of the one showcase figure per page.
- **Chalk Ink** (`chalk-ink`): headings, primary values, command text, active labels.
- **Weathered Sage** (`weathered-sage`): body copy, descriptions, inactive nav, legends, and every label a reader needs (phase names, rail labels, defect IDs in lists, eyebrows, close counts). Category dots that carry no state are weathered sage too.
- **Faint Sage** (`faint-sage`): non-essential metadata only (footnotes, lab labels in chrome, decorative arrows, placeholder text). About 3.1:1 on charcoal and 2.9:1 on hull graphite.

### Atmosphere
- **Halo Sage** (`halo-sage`): the radial glow at the top of marketing pages, between 7% and 16% opacity, fading to transparent into drydock charcoal.
- **Mask Stop** (`mask-stop`): opaque stops inside CSS `mask-image` gradients. Only its alpha matters; it is never a visible colour.

### Named Rules
**The Signal Rule.** Teal marks state (active, selected, focused, progressed) and nothing else. It is never a diagram category, a severity or a decorative fill. If removing the teal would not change what a reader knows about where they are, it should not be teal.

**The Rust Means Broken Rule.** Rust appears only where something is defective or failing. A rust element with no defect behind it is a false alarm; risk without a defect is ochre.

**The Passed Means Sage Rule.** Closed defects, passing journeys, fixed configuration and the healthy end state are sage. Teal never marks a completed fix, so "you are here" and "this check passed" never blur.

**The Tone Map Rule.** Diagram colours come from the `--tone-*` variables (edge → ochre, compute → periwinkle, data → rose, private → sage, danger → rust, external → weathered sage), never from hex literals, and teal stays reserved for selection.

## Typography

**Display Font:** Inter with the optical-size axis (with ui-sans-serif, system-ui)
**Body Font:** Inter (same stack)
**Label/Mono Font:** Geist Mono (with JetBrains Mono, ui-monospace)

**Character:** Inter carries the argument: bold, tightly tracked headings and plain, readable prose, with character variants cv02/cv03/cv04/cv11 for open digits and an unambiguous l. Geist Mono carries the evidence, making anything you could paste into a terminal or cross-reference look like data.

### Hierarchy
- **Display** (700, 52px → 64px at sm → 78px at lg, line-height 1.02, -0.035em): the landing H1 only.
- **Headline** (700, 36px → 44px at sm, 1.08, -0.025em → -0.028em): centred section intros on provider, lab and fallback pages, with a 680px measure.
- **Chapter** (700, 32px → 40px at sm, 1.1, -0.025em → -0.028em): left-aligned landing chapter headings, with a 640px measure.
- **Page title** (700, 26px → 28px at sm, 1.2, -0.022em): the title of a track view.
- **Feature title** (700, 22px, 1.3, -0.018em): the featured defect's title and lab names in a finale.
- **Title** (700, 20px, 1.3, -0.015em): card titles and lab cards.
- **Subtitle** (700, 18px, 1.25, -0.018em): problem list items, tour panel titles, phase names in sequence cards, explorer panel titles.
- **Section header** (700, 15px, -0.015em): in-app section headings and panel headings, led by a 3×18px teal bar where they open a section.
- **Lead** (400, 17px → 20px at sm in the hero, 1.55): the paragraph under a headline or chapter, in weathered sage.
- **Body large** (400, 16px, 1.6): the opening paragraph of an MDX hero panel.
- **Body** (400, 15px, 1.65): long-form MDX prose, capped at 78ch, in weathered sage. Register and card bodies run 14–15px at 1.6–1.7.
- **Control** (600, 14px, -0.005em): medium buttons, header nav links (500), track sidebar items (13.5px), tour tab titles.
- **Small body** (400, 13.5px, 1.6): tour descriptions, register Now/Fixed text, fact lists, dialog and footer copy.
- **Label** (700, 11px, 0.12em, uppercase): eyebrows over stats, register sub-sections ("How you would find it") and table headers, in weathered sage.
- **Data** (Geist Mono, 11–12px, 600, tabular): defect IDs, "Phase 3", "+4 closed", counts, breadcrumbs (uppercase, 0.06em). Stat values scale up to 28px bold at -0.02em.
- **Evidence** (Geist Mono, 13px, 1.6): configuration strings shown as a state ("allow INGRESS · tcp:22 · source 0.0.0.0/0").
- **Code** (Geist Mono, 12.5px, 1.7): command blocks. Comment lines are italic weathered sage, so the commands stand out in chalk ink.

### Named Rules
**The Evidence in Mono Rule.** If a value could be copied into a terminal, grepped for or cross-referenced (an ID, phase number, count, CIDR, configuration line or command), it is set in Geist Mono with tabular figures, even inside a sentence. Prose never is.

**The Solid Emphasis Rule.** Emphasis in a heading is at most one word or short phrase in solid Signal Teal. No gradient text, anywhere.

**The 11px Floor Rule.** No text is smaller than 11px. The remaining 10px labels in the track views (register and explorer eyebrows, the component panel, the `Eyebrow` faint variant) are drift to raise, not a precedent.

**The Tightening Rule.** Tracking tightens as size grows (-0.01em at 15px to -0.035em at 78px); uppercase micro-labels go the other way (+0.08em to +0.12em). Headings get `text-wrap: balance`, paragraphs `text-wrap: pretty`.

## Layout

There are three frames.

**Marketing frame** (landing, provider and lab pages): a centred 1200px column with 20px side gutters, 32px from sm and 48px from lg. Sections are separated by vertical padding alone (48px, then 64px at sm and 80px at lg), with no rules between them. The hero is centred. Section intros are centred with a 680px measure and a 40px gap to their content. The header is sticky and turns into a blurred charcoal bar with a seam-line border after 24px of scroll; below md it carries a menu button that opens a full-width list of 44px link rows.

**Chapter layout** (the landing page after the hero): at lg a two-column grid, a 148px chapter rail beside the chapters with a 48px gap; below lg a single column with a floating chapter pill pinned to the bottom of the viewport. Each chapter keeps the marketing section padding, opens with a left-aligned heading and lead (640px measure, 32–40px above the content), and pairs copy with its evidence side by side at lg (map crop beside a problem list, symptom beside a command, dependency panel beside a sequence) before stacking to one column.

**Track frame** (every view inside a track): at lg and up, a 240px keel-shadow sidebar, sticky and full height, holding the logo lockup, a lab card, the view nav, the track list and the lab disclaimer pinned to the bottom. Below lg the sidebar is replaced by a sticky blurred header with a horizontally scrolling row of pill nav links. Each view opens with a header band (20px gutters, 32px from sm; 28px top, 24px bottom; seam-line bottom border) carrying a mono uppercase breadcrumb. MDX prose runs at 15px with a 78ch cap, and every h2 carries an id slugged from its text so sections can be linked.

**Wide by design:** architecture diagrams and phase rails keep their natural width and scroll horizontally inside their frame, with hidden scrollbars on rails. Horizontally scrolling tab rows fade their trailing edge into the page below lg so it is clear more sits off-screen. The page body itself never scrolls horizontally.

Breakpoints are Tailwind's defaults (sm 640, md 768, lg 1024, xl 1280). Styles are written mobile-first. Touch targets are at least 44px, even where the visible mark is smaller (an `after:` inset extends small icon buttons).

## Elevation & Depth

Depth comes first from the surface ladder: keel shadow → drydock charcoal → hull graphite → raised graphite. Each nesting level steps up exactly one rung, and a well or input inside a card steps *down*. Soft, dark shadows then lift resting cards off the page, and a larger shadow marks something open, hovered or showcased. Borders stay 1px and low-contrast, so they define edges without drawing lines.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 8px 24px -10px rgba(0,0,0,0.55)`): default for cards, stat cards, register entries, dependency and sequence panels, the active phase step and the active form segment.
- **Lifted** (`box-shadow: 0 2px 4px rgba(0,0,0,0.55), 0 28px 48px -20px rgba(0,0,0,0.7)`): hover on interactive cards, an open register entry, the landing register entry, the healthy finale map, the floating chapter pill and floating panels.
- **Chalk line** (`box-shadow: 4px 4px 0 #d8ddd6`): the showcase figure only (the hero map on the landing page, `DiagramFrame` in track views), paired with a chalk-line border.

### Named Rules
**The One Rung Rule.** Nest one surface step at a time. A hull-graphite card holds raised-graphite panels, and a recessed well inside it drops to charcoal or keel shadow. Never skip a rung, and never put two adjacent surfaces on the same tone with only a border between them.

**The One Chalk Line Rule.** The hard off-white offset shadow appears at most once per page, around the single most important diagram. A second one makes the page look broken rather than the architecture. Never pair it with a fade or mask that would clip it.

**The Quiet Halo Rule.** Ambient radial glows (halo sage, 7–16% opacity) sit only at the top of a page, fade to transparent well before the edges, and dissolve into drydock charcoal.

## Shapes

Softly rounded, never sharp and never bubbly. Corners scale with the size of the container, and a shape inside another is never rounder than its container. Note that this project overrides Tailwind's radius names: `rounded-md` is 12px, `rounded-lg` is 16px and `rounded-xl` is 24px, which is **larger** than `rounded-2xl` (16px).

- **3px** (`rounded.scrollbar`), **4px** (`rounded.xs`), **5px** (`rounded.code-inline`): browser surfaces: the scrollbar thumb, the focus outline and inline code.
- **7px** (`rounded.segment`): segments inside a segmented control, sidebar nav items.
- **8px** (`rounded.sm`): icon buttons (play/pause, menu close) and hero rail steps.
- **9px** (`rounded.well`): segmented-control wells and phase-rail steps.
- **10px** (`rounded.inset`): large buttons, and every well nested inside a 16px card: Now/Fixed state wells, tour preview tiles, dependency rows, the verify panel.
- **12px** (`rounded.md`): the phase-rail well, command blocks and icon tiles.
- **16px** (`rounded.lg`): small and medium buttons, feature, register, dependency and sequence cards, tour tabs and panels, and diagram frames.
- **24px** (`rounded.xl`): standalone, un-nested blocks only: stat cards, MDX address blocks and tables, explorer panels and the lab card in the sidebar.
- **Pill** (`rounded.pill`): severity badges, defect and closed chips, toggle chips, stat pills, announcement pills, dots, progress bars and the floating chapter pill.

Diagram geometry follows the same language in SVG: groups at rx 12 (dashed where a group is not yet built), nodes at rx 8, edge labels at rx 4.

### Named Rules
**The Nested Corner Rule.** An inner radius is never larger than its container's. Inside a 16px card use 10–12px; reserve 24px for blocks that sit directly on the page.

## Components

### Buttons
Precise instruments, softly tinted: translucent fills rather than solid slabs, with a small, quick press.
- **Shape:** gently rounded (16px at sm/md, 10px at lg).
- **Primary:** Signal Teal text on a 16% teal tint; hover deepens to 24%. Semibold, -0.005em tracking. Sizes are sm (13px, 6px 12px), md (14px, 9px 14px) and lg (15px, 13px 22px). Primary CTAs carry a trailing arrow icon.
- **Secondary:** chalk ink on a 6% chalk tint, 10% on hover. It always pairs with a primary ("Open Harbour →" + "See how it works").
- **Ghost:** transparent with weathered-sage text; hover adds a 5% tint and brightens to chalk ink.
- **Icon button:** 32px visible, weathered sage, 6% chalk tint on hover, with an `after:` inset that makes the touch target 44px. Always carries an `aria-label`.
- **States:** a 120ms ease-out transition, `scale(0.97)` on press, 50% opacity when disabled, and the global 2px teal focus outline with a 2px offset.
- **Labels:** one verb per destination. Every link to a lab's first view reads "Open {lab}"; screen-reader text completes short visible labels ("Open" + hidden view name).

### Chips
- **Toggle chip** (map overlays, pickers): a pill on hull graphite with a seam-line border and weathered-sage text. Hover moves to raised graphite and a field-line border. Active is teal soft with a 30%-teal border, teal text and semibold weight. It uses `aria-pressed`.
- **Severity badge:** an uppercase 10.5px bold pill with 0.08em tracking. Critical is solid rust, high is rust on rust soft, medium is ochre on ochre soft, low is weathered sage on raised graphite with a border. It always shows the word, not just the colour.
- **Defect chip:** a mono 11px semibold rust pill on rust soft with a 30%-rust border (60% on hover). It links to the defect's register entry ("D3a · phase 2").
- **Open / closed count:** a mono pill that reads "12 of 17 defects open" in rust with a dot, and switches to "all 17 defects closed" in sage with a check.
- **Risk pill:** "High risk" in uppercase 11px ochre on ochre soft, beside the phase it applies to.
- **Stat pill:** a raised-graphite pill with a teal mono value followed by a weathered-sage label ("6 remediation phases").

### Segmented control
A keel-shadow well (9px radius, 1px seam-line border, 4px padding) of 7px segments at 12.5px. The active segment is solid Signal Teal with teal ink; inactive segments are weathered sage, brightening on hover. The well scrolls horizontally rather than wrapping.

### Cards / Containers
- **Corner Style:** 16px for feature, register and panel cards; 24px only for standalone stat cards and blocks; 10–12px for anything nested.
- **Background:** hull graphite on the page; nested panels in raised graphite; preview and state wells recessed to charcoal.
- **Shadow Strategy:** Resting at rest. Interactive feature cards lift 2px on hover and move to Lifted over 150ms, and an open register entry takes Lifted too.
- **Border:** 1px seam line, always.
- **Internal Padding:** 20px for stat cards and small-screen cards, 24px from sm, 28px for full feature cards.

### Navigation
- **Site header:** logo lockup (four blocks with one knocked out of place in teal, plus a 17px bold wordmark), 14px medium weathered-sage links that turn chalk on hover, a thin vertical seam divider and a small tinted primary CTA. The header is transparent at the top and blurred charcoal once scrolled or while the mobile menu is open. Below md a 44px menu button (`aria-expanded`, `aria-controls`) opens a list of 15px links in 44px rows; it closes on Escape, on choosing a link, and when the viewport passes md.
- **Track sidebar:** 13.5px items with 18px stroke icons. The active item is solid teal with teal ink and semibold weight; inactive items are weathered sage, moving to a hull-graphite hover. The track list below uses a teal dot for the active track and mono defect counts.
- **Mobile track nav:** a horizontally scrolling row of 12.5px pills. The active pill is teal soft with a 30%-teal border.

### Chapter Marker (signature)
Shows how far the reader has walked from as found to healthy.
- **Rail (lg):** a sticky list beside the chapters. Each chapter is a 44px link row with an 11px dot and a 13px label; a 1px connector joins consecutive dots. Reached dots are solid teal, unreached dots are charcoal with a field-line ring, and the current label is chalk semibold with `aria-current="location"`. When the current chapter is the healthy end, every reached dot and connector turns sage.
- **Bar (below lg):** a Lifted, blurred charcoal pill pinned 16px above the bottom of the viewport, holding one 16×4px segment per chapter, the current chapter label and "Next: {chapter}". It links to the next chapter and fades in only once the first chapter is reached.
- **Behaviour:** the active chapter is the last one whose top has passed 45% of the viewport, or the last chapter at the bottom of the page; progress colours transition over 300ms.

### Phase Rail (signature)
The component that carries the product's argument. In track views it is a keel-shadow well (12px radius) of equal steps at least 132px wide. Each step stacks a 4px progress bar (teal once reached, seam line ahead), a mono uppercase "Phase N" label (teal when active), the phase name in 13px semibold and a mono count ("17 open" at phase 0, "+3 closed" after). The active step rises to hull graphite with a seam border and a Resting shadow. Bars colour over 300ms, so stepping forward reads as progress.

In the hero map the rail compresses into the figure caption: a pause/play icon button followed by equal-width 4px bars with no labels, sharing the caption's side padding so the last bar ends under the open count. Each bar is a 44px-tall button whose accessible name is "Phase N: name". The current phase is named once, beside the lab title, as a teal mono "Phase N" and the phase name; every change replays a 320ms rise on a teal wash that fades over 1.4s. That label is a polite live region only while the walkthrough is paused, so autoplay is not announced every step.

### Defect Register Entry (signature)
A `<details>` card in hull graphite. The summary row holds the defect ID chip, the severity badge, a 15px title that turns teal when open, a mono phase pill and a chevron that rotates 180° over 300ms. The body follows a fixed order: symptom (chalk, medium weight), explanation (weathered sage, 80ch), a **Concept** callout set off by a 2px teal left rule, "Cannot start until" and "Blocks" defect chips, the detect command, side-by-side **Now** (rust mono label) and **Fixed** (sage mono label) panels in raised graphite with 10px corners, then the fix command.

### Register Entry with state switch
The landing page's single, always-open register entry, for following one defect to its fix. A Lifted hull-graphite card: the summary row (ID chip, severity badge, 17px title, mono phase pill), then a Now/Fixed segmented control beside a mono status ("open, as found" in rust, "closed in phase N" in sage), a charcoal state well (10px, `evidence` type) that swaps between the before and after configuration as a polite live region, and the fix command under a "The change that closes it" label.

### Dependency and Sequence panels
Two Resting cards that show why order matters. The dependency panel lists defects in 10px-rounded rows (mono "phase N" column, mono ID, title, optional "also waits on …" note) grouped under "Lands first" and "Waits for it", with the followed defect's row on rust soft. The sequence panel lists every remediation phase as a divided row (mono "Phase N", name, ochre risk pill where it applies, a teal-soft "{ID} closes here" marker, mono "+N" count), followed by an ochre verify panel for the high-risk phase.

### Command Block
A terminal slab in keel shadow (12px radius, seam-line border). An optional header bar shows a mono uppercase label ("detect", "fix") and three seam-coloured dots. The code is 12.5px Geist Mono at 1.7 line height; `#` comment lines are italic weathered sage and commands are chalk ink. It shows the full command, scrolls horizontally and never wraps.

### Diagram Frame (signature)
The one chalk-line showcase per page: a 16px-radius figure with a chalk-line border and the chalk-line hard shadow. A keel-shadow caption bar holds a 16px logo, a bold 13px title, a mono meta line and, in the hero, the open/closed count and phase rail; a keel-shadow strip carries the line legend (solid "traffic path", dim dashed "not built yet", rust dashed "defective path"). The SVG sits on drydock charcoal and is never masked or faded. Nodes use their tone as the stroke; selection switches the stroke to teal at 2–2.4px over a 7% teal wash. Labels are 11–13.5px, with mono for addresses and ports.

Non-showcase diagrams (the healthy finale, map crops) use the same caption bar and charcoal ground in a seam-line card with a Resting or Lifted shadow instead.

**One render per diagram.** Where a small screen should show only part of the map, the same SVG is scaled and shifted with CSS (a focus rectangle expressed as `aspect-ratio`, a width over 100% and negative percentage margins) instead of rendering a second cropped copy.

### Track Tour
Every view of a track as a tab beside a live preview panel. Tabs are 16px-rounded buttons with a 32px icon square (teal soft when selected) and roving `tabindex` with arrow, Home and End keys; below lg they scroll horizontally with a faded trailing edge. The panel is a 16px Resting card whose preview is drawn from the model (overlay map, journey at two phases, component tiles, load balancer chain, address ranges, register rows), with a text fallback only when a view has no data.

### Motion
- **Micro-interactions:** 120–150ms ease-out (buttons, chips, links, row hovers).
- **Headline reveal:** each line rises 22px over 1s on `cubic-bezier(0.22, 1, 0.36, 1)`, with line two 500ms behind. One keyword pops in with a slight overshoot at 800ms; that is the only overshoot in the system.
- **Hero walkthrough:** the hero map steps through every phase (2.8s a step, 2.2s extra on the first and last), with a pause/play button; choosing a phase stops it.
- **Scroll reveal:** section and chapter headers fade up 24px over 560ms, with the body staggered 130ms behind. Content already on screen at load, or on a page without JavaScript, is never hidden.
- **Progress:** phase bars scale from the left, timed to the step they represent; chapter progress colours over 300ms.
- **Reduced motion:** when requested, loops stop, the walkthrough does not autoplay, entrances resolve instantly and smooth scrolling is disabled, applied globally.

## Do's and Don'ts

### Do:
- **Do** use Signal Teal (`#2eb8a0`) only for active, selected, focused and progressed states, links, and one highlighted word per heading.
- **Do** mark every closed, passed or fixed state in sage, every defect in rust and every risk in ochre.
- **Do** step the surface ladder one rung per nesting level: keel shadow → charcoal → hull graphite → raised graphite.
- **Do** set IDs, phase numbers, counts, CIDRs, configuration and commands in Geist Mono with tabular figures, even mid-sentence.
- **Do** keep every label at 11px or larger, and set anything a reader needs in weathered sage rather than faint sage.
- **Do** keep inner corners at or below their container's: 10–12px inside a 16px card.
- **Do** colour diagram nodes and edges through the `--tone-*` variables, keeping teal for selection.
- **Do** pair every severity or pass/fail colour with a word, icon or number; colour is never the only signal.
- **Do** build marketing previews from the real architecture model, register and commands (live `ArchitectureDiagram`s, real `gcloud` lines), not illustrations.
- **Do** give anything that moves on its own a pause control, a hover or focus hold where it cycles, and a reduced-motion stop.
- **Do** give every interactive target at least 44px, extending small icons with an inset hit area.
- **Do** put in-app concept callouts behind a 2px teal left rule, and eyebrow sub-sections in 11px uppercase bold at 0.12em.
- **Do** keep wide diagrams at their natural width inside a horizontally scrolling frame, and fade the trailing edge of horizontally scrolling tab rows.

### Don't:
- **Don't** use gradient text (`background-clip: text` with a gradient), including in the hero. Emphasis is solid teal.
- **Don't** add a light theme, or use pure black or a blue-navy ground.
- **Don't** set text a reader must read in faint sage (`#606963`, about 3.1:1), or set any text below 11px.
- **Don't** use rust for anything that is not a defect or a failure, teal for a finished fix, or teal as a diagram category or severity.
- **Don't** apply the chalk-line hard shadow to more than one element per page, or mask and fade the figure that carries it.
- **Don't** render a diagram twice to serve two breakpoints; crop the one SVG with CSS.
- **Don't** hide content until JavaScript runs; hidden start states apply only after load and only below the fold.
- **Don't** hardcode hex values in components; the only exceptions are the halo gradient and mask stops.
- **Don't** add a third button family beyond tinted primary/secondary/ghost and the solid active segment.
- **Don't** push ambient glows above 16% opacity or let them reach the edges of their region.
- **Don't** assume Tailwind's default radii: here `rounded-md` is 12px, `rounded-lg` is 16px and `rounded-xl` is 24px.
- **Don't** pull patterns from `design-system/` that Drydock doesn't ship (typewriter cards, testimonials, auth panels, floating fragments) unless a real surface needs them. Document them here first.
