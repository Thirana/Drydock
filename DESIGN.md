---
name: Drydock
description: Deliberately broken cloud architectures, and how to fix them step by step.
colors:
  ground: "#fbfbfa"
  sunk: "#f1f1ef"
  rule: "#e0e0dc"
  rule-strong: "#b9b9b4"
  ink: "#121211"
  ink-body: "#3b3b38"
  ink-muted: "#62625d"
  ink-faint: "#757570"
  accent: "#1f55e6"
  accent-hover: "#1543c2"
  accent-soft: "rgba(31, 85, 230, 0.08)"
  accent-ink: "#ffffff"
  fault: "#c8261c"
  fault-soft: "rgba(200, 38, 28, 0.07)"
  code: "#f1f1ef"
  ground-dark: "#131312"
  sunk-dark: "#1b1b1a"
  rule-dark: "#2c2c2a"
  rule-strong-dark: "#4a4a47"
  ink-dark: "#f4f4f0"
  ink-body-dark: "#b4b4ae"
  ink-muted-dark: "#8e8e88"
  ink-faint-dark: "#7b7b75"
  accent-dark: "#7ea2ff"
  accent-hover-dark: "#a5bfff"
  accent-soft-dark: "rgba(126, 162, 255, 0.12)"
  accent-ink-dark: "#0b1433"
  mark: "#fbe98a"
  mark-ink: "#121211"
  mark-dark: "rgba(250, 219, 95, 0.2)"
  mark-ink-dark: "#fff3c4"
  fault-dark: "#ff6f61"
  fault-soft-dark: "rgba(255, 111, 97, 0.1)"
  plum: "#8e3394"
  teal: "#268899"
  green: "#21763c"
  amber: "#c97c16"
  plum-dark: "#cd85d8"
  teal-dark: "#71cfd9"
  green-dark: "#4eb068"
  amber-dark: "#f6c16b"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(48px, 7vw, 76px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline-section:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
  move:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.3
    fontFeature: "\"tnum\" 1"
  code:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: "\"tnum\" 1"
  figure-title:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.2
  figure-sub:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "\"tnum\" 1"
  figure-label:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "2px"
spacing:
  gutter: "20px"
  gutter-wide: "32px"
  row: "16px"
  column-gap: "40px"
  group: "56px"
  container: "1200px"
  reading: "760px"
  measure: "68ch"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  button-secondary:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    textColor: "{colors.accent}"
    padding: "0"
    height: "44px"
  toggle-choice:
    textColor: "{colors.ink-muted}"
    height: "40px"
  toggle-choice-active:
    textColor: "{colors.ink}"
  defect-ref:
    textColor: "{colors.fault}"
    typography: "{typography.move}"
  view-strip-item:
    textColor: "{colors.ink-muted}"
    height: "48px"
  view-strip-item-active:
    textColor: "{colors.accent}"
  command-block:
    backgroundColor: "{colors.code}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.sm}"
    padding: "14px 20px"
---

# Design System: Drydock

## Overview

**Creative North Star: "The Annotated Score"**

A Drydock track reads like an annotated game. The remediation order is a line of numbered moves; each defect carries the annotator's mark beside its word; the author's disagreements sit in the margin under a "!?". The page is the printed page of that score: off-white ground, near-black ink, one reading column, generous white space, hairline rules where another site would draw boxes. Diagrams are the only thing allowed to break out wide.

Two colours carry all the meaning. Blue marks where the reader is and what they can follow - the current move, the current view, links, the one solid action on hover. Red is kept for faults and nothing else. Everything else is type weight, the four steps of ink, and space. Dark mode is the same page with the lamp off, not a different world: the same roles, re-valued for a near-black ground.

The system refuses cards, chips, pill badges, drop shadows, icon sidebars and material costume. Density is moderate and textual; structure comes from rules, numerals in a gutter, and the reading measure.

**Key Characteristics:**
- Off-white page, near-black ink, hairline rules instead of containers.
- One blue for "current" and "followable"; one red for "broken".
- Inside course drawings and widgets only, four drawing hues - plum, teal, green, amber - say who is who; each course's legend names what they mean.
- Atkinson Hyperlegible Next for everything read; Atkinson Hyperlegible Mono for move numbers, defect IDs, ranges and commands.
- Numbered moves ("1.", "2.") as the recurring structural device - the score, the view strip, the view guide, the register.
- Flat: no shadows anywhere, corners 2px at most.
- Motion only where something changed: the marker slides, a struck defect draws its line.

## Colors

A near-neutral paper-and-ink palette with exactly two signal hues, each with a single job. Course drawings and widgets add four drawing hues that never leave the drawing.

### Primary
- **Current-Move Blue** (accent): the sliding marker on the score, the current view in the view strip, the chosen move's numeral and name, links (`dd-link`, prose links, header call to action), the hover state of the primary button, focus outlines, text selection, and diagram selection. Hover deepens to **Pressed Blue** (accent-hover). **Blue Wash** (accent-soft) tints a selected diagram region only. **Blue Ink** (accent-ink) is the text colour on a solid blue fill.

### Secondary
- **Fault Red** (fault): defect IDs wherever they appear (register gutter, defect references, diagram defect marks), the critical and high severity marks and words, open-defect counts, the "Now" half of a before/after pair, failing hops, defective diagram paths (`--tone-danger`), and any range or status that is bad. **Fault Wash** (fault-soft) is its only tint.

### Neutral
- **Page Ground** (ground): the page, the sticky strips (at 95% with a light blur), diagram wells.
- **Sunk Ground** (sunk): row hover on the register, the only raised-feeling surface. **Code Ground** (code) shares its value and sits behind commands and inline code.
- **Hairline** (rule): every divider, row rule, column top rule and diagram frame.
- **Strong Hairline** (rule-strong): the secondary button's border, scrollbar thumb.
- **Ink** (ink): headings, titles, emphasis, the primary button fill, the rule under a register phase heading.
- **Body Ink** (ink-body): running prose and leads.
- **Muted Ink** (ink-muted): meta text, labels, unselected choices, command comments.
- **Faint Ink** (ink-faint): static move numerals, list markers, struck (closed) defects.

### Drawing hues (course drawings and widgets only)
Four hues for the parts of a network drawing. They came from the course notes' own convention, re-tuned for this page. The hues are shared; what each one means is set by the course's **legend** (`Course.legend` in code), and every figure's key prints it in that course's words.

- **Plum** (plum), **Teal** (teal), **Green** (green), **Amber** (amber).
- **Fundamentals legend - who does what:** plum the sender (laptop, browser, client); teal whatever sits in between and forwards (router, gateway, switch, proxy, NAT, load balancer, and the network bits of an address); green the server and the replies coming back; amber the request on its way out.
- **GCP legend - where it lives:** teal your VPC (subnets, VMs, routes, NAT); plum run by Google, outside your VPC (load balancer front ends, Cloud Run, Cloud SQL, IAP); amber firewall and access rules; green allowed traffic and replies. Networks outside GCP (shoppers, home, office, Cloudflare) are drawn in ink.
- A figure that means something else by a hue (packet layers, for instance) passes its own `labels` to the key instead of the course legend.
- Each hue has a soft fill, `color-mix(in oklab, <hue> 10%, ground)`, used only inside a box of that hue.
- Host bits and "notice this" inside a widget use the existing **Highlighter** (mark), and so does a box that is a warning (a dry run, a draining VM, an exception). A dropped packet, refused connection, failing check or a problem uses **Fault Red**. There is no "info" or "success" hue.
- **Selection inside a drawing** uses Current-Move Blue, as it does everywhere else: the hop a step-through is describing, the link or part a tab has picked (`.n.cur`, `.w.cur`). Parts a request never reached fade to 40% (`.off`).

Values were chosen together, not one by one: in both themes every hue's stroke clears 3:1 on the ground, and every pair of hues, blue and red stays apart under deuteranopia, protanopia and tritanopia simulation (minimum OKLab distance about 6). Re-run that check before changing any one of them.

Dark values (the `-dark` tokens) replace each role one for one when `[data-theme="dark"]` is on `<html>`. The attribute is set before paint from the stored `dd-theme` preference, falling back to `prefers-color-scheme`.

### Named Rules
**The One Blue Rule.** Blue means "you are here" or "you can follow this". It never decorates, never fills a static numeral, never marks a category.

**The Red Is a Fault Rule.** Red appears only where something is broken: a defect ID, a critical or high mark, a failing hop, a defective path. Medium and low severity stay in ink; fixed things return to ink or faint ink, never green.

**The Drawing Hue Rule.** Course drawings and widgets may colour a box, wire or arrowhead by what it is in that course's legend, and nothing else. Hue lives on strokes, arrowheads, soft fills and a small key swatch; text inside a drawing stays in ink and muted ink. Hues never appear in chrome - header, rails, links, buttons, headings and prose stay ink, blue and red. Any drawing with two or more hues shows its key, and every coloured thing also carries a label, so colour is never the only code.

**The Monochrome Lab Rule.** Lab drawings (the Harbour map, journeys, load balancer chain) stay in ink tones through the `--tone-*` tokens (edge and private in ink, compute and data in muted ink, external in faint ink, lines in hairline). Only `--tone-danger` takes colour, and selection is blue. A lab is about what is broken, so nothing competes with the red.

**The Plain Verdict Rule.** A quiz or check answers in words: "Correct" or "Not quite", with a drawn check or cross icon in ink and the reason. Never a green/red verdict - a wrong answer is not a fault, and green never means "good".

## Typography

**Display Font:** Atkinson Hyperlegible Next (with ui-sans-serif, system-ui)
**Body Font:** Atkinson Hyperlegible Next
**Label/Mono Font:** Atkinson Hyperlegible Mono (with ui-monospace, SFMono-Regular, Menlo), tabular figures on

**Character:** One legibility-first family in two cuts. The sans carries every sentence and heading at bold weight without shouting; the mono sets anything that is an identifier - move numbers, defect IDs, CIDR ranges, commands - where I/l/1 and O/0 must never be confused.

### Hierarchy
- **Display** (700, 48px / 64px / 76px by breakpoint, 1.02, -0.02em): the home headline only.
- **Headline** (700, 38px to 48px, 1.1, -0.02em): the single h1 of a track view or lab page.
- **Headline Section** (700, 32px to 40px, 1.1): section intros on landing and index pages.
- **Title** (700, 22px, 1.25): prose h3, register phase headings; 18-20px bold for argument titles, columns and view-guide items.
- **Lead** (400, 19-20px, 1.55): the paragraph under a page title, max 40-62ch.
- **Body** (400, 18px, 1.65, max 68ch): long-form prose in `gl-prose`.
- **Body Small** (400, 16px, 1.6): notes, column text, register explanations, table cells.
- **Label** (600, 13px, 0.01em, sentence case, muted ink): names a group of data - "Phase", "Severity", "How you would find it". Never set above a heading.
- **Move** (mono 700, 13.5-15px): move numerals ("3."), defect IDs, severity marks.
- **Code** (mono 400, 14px, 13.5px from 1024px, 1.7): command blocks; inline code at 0.86em on code ground.
- **Figure** (inside drawings only): box titles sans 600 13.5px; sub-lines (addresses, ports, values) mono 11.5px; words on a wire sans 600 12px in muted ink.

### Named Rules
**The Plain Label Rule.** Labels are small, sentence-case and literal, and they label data, not headings. No uppercase tracking, no kicker line above a title.

**The Mono Means Identifier Rule.** Mono is for things you would type or cite - numbers, IDs, ranges, commands. Prose and headings are never set in mono.

**The Mark With the Word Rule.** A severity mark (`??` critical, `?` high, `?!` medium, `·` low) is always shown with its word in full view, except inside the score, where the mark rides on the ID and the word is given to screen readers.

## Layout

A single centred container (max 1200px) with 20px side gutters, 32px from 640px up. Inside it, reading happens in one column: page headers cap at 760px, prose at 68ch, leads at 40-62ch. Diagrams break out of the column on large screens to roughly the viewport minus 48px (capped near 1440px) and scroll sideways on small screens with a plain note saying so.

Rhythm is set by rules and rows rather than boxes: list-like content (view guide, arguments, columns, register rows, metadata) starts each item with a hairline and 16-24px of vertical padding. Groups separate by 56px; column grids use a 40px gap at 2 and 3 columns. Page tops breathe (48-96px). A track view's structure is: sticky view strip, title and lead, prose, and a pager to the neighbouring views.

Responsive behaviour stays in one column: the score turns from a horizontal line of equal moves into a vertical list with a left blue bar on the current move; the view strip scrolls horizontally and keeps the current view centred; the header collapses to a menu below 768px.

## Elevation & Depth

None. The system is flat by construction: every shadow token resolves to `none`. Depth is conveyed by rules (hairline for separation, ink rule for a heading that owns a group), by the sunk ground on hover, and by the sticky strip's 95% ground with a light backdrop blur so text beneath it does not collide.

### Named Rules
**The Flat Page Rule.** No box shadows, no hard offsets, no glows. If a thing needs to separate, give it a hairline.

## Shapes

Square-cornered paper. Every radius token resolves to 2px, used on buttons, command blocks, inline code, diagram frames and the focus outline. Borders are 1px hairlines; the only heavier strokes are the 2px underline of the current view, the 3px blue score marker, and a 1.5px strike line. Circles appear only as diagram node markers and hop dots inside drawings.

### Named Rules
**The 2px Ceiling Rule.** Nothing is rounder than 2px outside a diagram's own geometry. No pills, no rounded cards.

## Components

### Buttons
Plain and few: one solid ink action, an outlined companion, a text link.
- **Shape:** near-square (2px).
- **Primary:** ink fill, ground text, semibold; 36 / 44 / 48px tall with 12 / 16 / 20px side padding and 14 / 15 / 16px text. One per view at most.
- **Hover / Focus:** fill turns blue with blue-ink text over 120ms ease-out; focus is a 2px blue outline offset 3px.
- **Secondary:** transparent with a strong-hairline border and ink text; the border darkens to ink on hover.
- **Ghost:** blue text with no padding; its underline appears on hover.

### Choices (toggle and segmented)
- **Style:** text, not chips. A row of 15px words 20px apart, each at least 40px tall.
- **State:** unselected is muted ink; selected is ink, semibold, with a 2px blue underline offset 7px.

### Links
- **Inline:** blue text with a 35%-blue 1px underline that goes solid on hover (150ms).
- **Defect reference:** mono 14px bold fault red, underline on hover only - set like a move in the score.
- **Row links** (lab entries, view-guide items): ink title that turns blue on hover; the whole row is the target.

### Containers
- **Corner Style:** 2px where a boundary exists at all.
- **Background:** ground; code ground for commands.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** a top hairline per item; a full hairline frame only around diagrams.
- **Internal Padding:** 16px row padding; commands 14px by 16-20px, wrapping with a 2ch hanging indent.

### Navigation
- **Top bar:** 64px tall, hairline below; the "Drydock?!" wordmark left, muted 15px links that go to ink on hover, one blue call to action with an arrow, the theme toggle.
- **View strip:** sticky, hairline below, ground at 95% with blur. Views are written as numbered moves ("1. About", "2. Map") in 15px with a 13px mono numeral; the current view is blue, bold, with a 2px blue underline; others are muted and go to ink on hover.

### The Score (signature)
The remediation sequence as a notation line. A hairline carries equal moves; each move is a mono numeral (faint, blue when current) and its name (muted when unplayed, ink when played, blue bold when current). The defects each move closes sit beneath in mono 13.5px: open critical/high in bold red with their mark, open medium/low in bold ink, closed ones faint and struck through. A 3px blue marker slides along the top rule to the current move over 500ms (`cubic-bezier(0.16, 1, 0.3, 1)`); the strike line draws left to right in 380ms as its move is played. Arrow keys step the moves. A live count reads "N of M defects open" with N in red.

### Defect Register (signature)
Defects grouped by phase under a heading with a faint mono numeral, a 22px title and an ink rule. Each row is a disclosure on a three-column grid: a 56px gutter holding the red mono ID, the 18px semibold title with its severity mark and word, and a chevron that turns blue when open. Rows are separated by hairlines and wash to sunk ground on hover. Opened, a row reads symptom, explanation, concept, then a Now/Fixed pair split by a hairline, and the detect and fix commands.

### Margin Mark (signature)
The author's asides and positions (Note, Argument) sit on a 28px gutter holding a bold mono "!?" in ink - the annotator's "interesting move". Notes are 16.5px body; arguments add a 20px bold claim above 17px reasoning and a top hairline.

### Wordmark
"Drydock" in 19px bold ink with a blue mono "?!" set high beside it - the dubious-move mark that names the site.

### Figures and Diagrams
Course figures (`.dd-fig`): the same hairline 2px frame on ground. Boxes are 2px-cornered with a 1.25px stroke - ink-faint for a neutral box, a hue with its soft fill for a box the legend names. Titles in sans 13.5px semibold ink, sub-lines (addresses, ports) in mono 11.5px muted. Wires 1.5px with a matching arrowhead (`DiagramDefs`, rendered once by the course layout); dashed means "not built yet" or "optional", exactly as in the lab. The key sits under the drawing as small swatch-and-word pairs, then the caption in muted 15px. On narrow screens a drawing keeps 680px and scrolls sideways, with a plain note saying so. Address-block charts (`blk`: used, plan, goog, res, free) and status dots (ink for fine, red for broken) are part of the same vocabulary.

Lab figures: caption above (16px bold title, muted meta, a line legend of traffic / not built yet / defective path), the drawing below inside a hairline 2px frame on ground. Drawn in the monochrome tones; defect marks and defective paths in red; selected regions washed blue.

Text never crosses a box edge (`src/lib/architecture/text-fit.ts`). A box's sub-line wraps to a second line at its " · " separators before it is ever squeezed; defect IDs sit as a small tag on the box's top-right edge, clear of the title; edge labels take the longest stretch of their line that no box covers, are painted above the boxes, and drop to two smaller lines when the gap is narrow. A label with no room at all is left off rather than drawn under a box.

### Course chapters
- **Chapter rail:** sticky, text only, 236px on the left from 1024px, 96px from the text column (the section numerals hang in that gap). Course title, parts as plain labels, chapters as numbered rows (mono faint numeral, body-ink title; the current one blue and bold; unpublished ones faint and not linked). Under the current chapter its sections, with a 2px blue marker that slides to the section in view (500ms, the score's curve). Below 1024px it folds into a sticky strip ("4. Subnet masks · section") that opens the same list as a full-height sheet (`<dialog>`).
- **Chapter header:** the title as the headline, the lead, then one muted meta line under it - part, "chapter 4 of 34", reading time. Nothing sits above the title.
- **Numbered sections:** every `##` takes a move numeral from a CSS counter - mono, faint, hanging in the gutter from 1024px, inline before it below. Summary, Try it yourself and Commands in this chapter are unnumbered recaps.
- **Asides on the gutter:** a key idea under "!", a note under "!?", the GCP blocks under their own mark - the problem "?" in red, the fix "!", a read-only gcloud check "$"; console, cost and exam blocks carry no mark. Each starts with a hairline and a bold title; its body is indented by the gutter, which is what shows where it ends.
- **Builds on:** a muted line under a heading linking the fundamentals chapters a section relies on.
- **Try it yourself / Commands in this chapter:** one item per command, numbered in the gutter like the sections: a bold title (what it shows), plain bullets (steps when there is more than one command or none, what to look for, where it runs, the section it goes with), then the command in a Command Block. Never a table.
- **Commands and output:** commands use the Command Block; printed output sits in a hairline frame on the page ground, mono 13px body ink, so the two never look alike.
- **Widgets:** a hairline frame with 24px inside, inputs 44px tall in mono with a strong-hairline border (red with a plain sentence when the value cannot be used), results in an `aria-live` region, outcomes as one ink sentence. Bit cells: teal-soft for network bits, highlighter for host bits, ink 1s and muted 0s.
- **Case explorer (GCP widgets):** most GCP widgets are one tool - cases as choices, an optional "What if" row, the drawing, a one-line result (a drawn tick in ink when it works, "!" for a warning, a cross in red only when something is stopped or lost), the takeaway in body ink, and the config folded under "Show as config". Drawn 960 units wide, so these frames take the full column, like tables; text-only widgets keep the 760px measure.

### Commands
Commands wrap inside their block instead of scrolling: long lines take a hanging indent of 2ch, flags (`--region=…`) stay whole and move to the next line together, and only a flag too long for the line breaks mid-token. The text is unchanged, so copying yields the original command.

## Read, Notice, Act

A minimal page still has to answer three questions at a glance: what do I read, what should I notice, and what can I press. Each has exactly one visual answer.

**Read - a wide ink scale.** Headings are full ink; body text sits a clear step lower (`ink-body`, #3b3b38 light / #b4b4ae dark); labels and meta a step lower again. A title stands out by contrast before weight is even counted. Never set body copy in heading ink.

**Notice - one highlighter mark per block.** `.dd-mark` lays a soft yellow wash (`mark`) behind the single thing to notice first: a defect's symptom sentence, "D6 closes here", and inside fix commands the flag that actually closes the defect (found by `keyFlags` in `src/lib/architecture/key-flags.ts`: a flag whose value appears in the fixed state and not the found state; at most three). Yellow never means clickable and never means broken. More than one mark in a block is a mistake.

**Act - one vocabulary for everything clickable.**
- Links: blue, semibold, always underlined (`.dd-link`, prose links, ghost buttons, page lists such as the view guide and the pager).
- Defect IDs: red with a dotted underline; solid on hover.
- Switches (Now / Fixed, register filters): one outlined track, the chosen segment filled in ink (`SegmentedControl`).
- Standalone choices (map overlays, journeys): square outlined buttons, filled in ink when chosen (`ToggleChip`). Never pills.
- Moves on the score and register rows: a hover surface (`sunk`) and pointer; rows that expand carry a chevron.
- The main action: the solid ink button.

## Do's and Don'ts

### Do:
- **Do** use blue only for the current move or view, links, actions and selection.
- **Do** set every defect ID in mono fault red, and show every severity mark with its word.
- **Do** separate items with a hairline (1px rule) and 16px of padding instead of a box.
- **Do** number sequences as moves ("1.", "2.") in mono faint ink, turning blue only when current.
- **Do** keep reading text in one column at 68ch or less; let only diagrams break out wide.
- **Do** keep motion to changes of state: the marker slide, the strike, a 600ms rise on page titles, and honour reduced motion.
- **Do** write copy with a spaced hyphen (" - ").

### Don't:
- **Don't** use cards, chips, pill badges or tinted status capsules; state is carried by colour of text and a mark.
- **Don't** add shadows of any kind, or round anything past 2px.
- **Don't** use red for anything that is not broken, or green for anything that is fixed.
- **Don't** put a small label or kicker above a heading, or set labels in tracked uppercase.
- **Don't** colour lab drawings, or use drawing hues outside a course drawing or widget; a hue means what the course legend says, never a status or decoration.
- **Don't** set text in a drawing hue, or give a quiz verdict in green or red.
- **Don't** set prose or headings in mono.
- **Don't** use an em dash anywhere in copy.
