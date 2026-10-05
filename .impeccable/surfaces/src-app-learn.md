---
version: 1
slug: "src-app-learn"
primary_target: "src/app/learn/[course]/[chapter]/page.tsx"
related_targets: ["src/app/learn/page.tsx","src/app/learn/[course]/page.tsx","src/app/learn/[course]/layout.tsx","src/components/learn"]
---

# Surface brief: the courses (`/learn/**`)

Scope: the learning-path index, the two course indexes, every chapter page, and the figures and widgets inside them. Visitor mode: **Read**. Light and dark themes, reader-toggled, system default. Extends the site's world (see the site brief and DESIGN.md); this is not a new world.

Audience and job: someone working through a chapter, often long-form and in order, sometimes arriving cold from search for one topic; and evaluators skimming how the author teaches. They must understand one idea per section, try it by hand in a widget, and know where they are in a 59-chapter course. Proof is the real course content: Kadé's addresses, real commands, working widgets. Constraints: static export, no invented claims, " - " never em dash, per-chapter widget loading.

## Direction contract

THESIS: A chapter is a page of the same annotated score. Its sections are numbered moves down the left gutter; the author's key ideas sit in the margin under a mark; drawings break out wide in the course's drawing hues; widgets are small instruments set into the text, drawn with the same hairlines and controls as the lab. Refuses: cards, boxed callouts, pills, icon sidebars, coloured chrome, progress gamification.

OWN-WORLD: Inherited unchanged - off-white page (dark: near-black), ink scale, one blue for current and followable, red for faults, Atkinson Hyperlegible Next and Mono, hairlines, 2px corners, no shadows. Added for this surface only: the four drawing hues (plum, teal, green, amber) inside drawings and widgets, named by each course's legend, per The Drawing Hue Rule.

STORY: The reader always knows three things - which course and part they are in (the rail), which move of the chapter they are on (numbered sections, scroll-spied in the rail), and what comes next (the pager). Everything else is the text.

FIRST VIEWPORT: Chapter page - quiet top bar; on desktop a text-only chapter rail on the left (course title, parts as plain labels, chapters as numbered rows, the current one blue with its sections beneath); on the right the reading column: the chapter title as the headline, the lead, a muted meta line under it (part, "chapter 4 of 34", reading time - never above the title), then section 1. On mobile the rail becomes a sticky "Chapters" strip that opens a full-height sheet.

FORM: Reading column at 68ch; figures and widgets may break out to the column plus gutter; drawings keep a 680px minimum and scroll sideways on narrow screens. Sections: `##` headings with an automatic mono move numeral in the gutter; Summary, Try it yourself and Commands in this chapter carry no numeral. Key ideas as margin marks, not boxes. Tables as ruled rows. Widgets: hairline frame, inputs with inline validation, output in an `aria-live` region, step/play/reset using the existing button, ToggleChip and SegmentedControl vocabulary; verdicts in words with drawn icons (The Plain Verdict Rule).

Signature interaction: as the reader scrolls, the current section's numeral in the rail turns blue and the marker moves down the section list - the score's sliding marker, at chapter scale.

FINISH: unreviewed and undocumented is unfinished; the pilot chapter (plan step 2) is reviewed by the author before the course migration, and the finished surface ends with the finish review and a regenerated DESIGN.md.
