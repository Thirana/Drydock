# Step 1 - Product and design foundations

**Status: done 2026-10-05.** What actually shipped, where it differs from the plan below:

- **Decisions:** tagline "Learn how networks work. Then fix one that doesn’t." (in PRODUCT.md; `src/config/site.ts` switches in step 5). Harbour's map stays ink-only (The Monochrome Lab Rule).
- **Final role values** (chosen together with a contrast + colour-blindness check; see DESIGN.md before changing one):

  | Token | Light | Dark |
  | --- | --- | --- |
  | `--dd-role-client` (Sender Plum) | `#8e3394` | `#cd85d8` |
  | `--dd-role-net` (Wire Teal) | `#268899` | `#71cfd9` |
  | `--dd-role-server` (Server Green) | `#21763c` | `#4eb068` |
  | `--dd-role-request` (Request Amber) | `#c97c16` | `#f6c16b` |

  Plus `--dd-role-*-soft` fills (`color-mix` 10% into the ground) and Tailwind colours `role-client`, `role-client-soft`, etc.
- **No `info` role.** The source's blue maps to `net` when it means the network part (network bits, a network zone) and to plain ink otherwise. Host bits use the existing highlighter (`--dd-mark`).
- **Text is never role-coloured.** The source's `c-*` text classes become `l` (wire label, muted ink) or are dropped on `s` sub-lines.
- **Figure CSS** lives in `src/app/globals.css` under `.dd-fig` (`n`, `n.<role>`, `zone`, `w`, `w.<role>`, `dash`, `t`, `s`, `l`, `f`, `mid`). Drawings keep `min-width: 680px` and scroll sideways on narrow screens.
- **Arrowheads:** `src/components/learn/diagram-defs.tsx` - render `<DiagramDefs />` once per page; markers are `url(#dd-ah-<role>)` (`arrowHead(role)` helper).
- **Surface brief:** `.impeccable/surfaces/src-app-learn.md`.
- **`design-system/` is not Drydock.** It documents another product (dark-only, teal-green, Inter, cards). It was left untouched; DESIGN.md is the authority. Consider deleting that folder later.
- `doc/**` is now ignored by ESLint and Prettier.
- Scratch route `src/app/learn-preview/` (three converted source drawings + key) is still there for review; step 2 deletes it.

Size: M. Changes `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `src/app/globals.css`, `design-system/`, and adds a surface brief for the learning pages. No page work yet.

Run `/impeccable` for this step so the design context is loaded, and treat it as an extension of the existing world, not a redesign.

## 1. PRODUCT.md

Update, keeping the existing voice:

- **Product purpose:** a networking learning guide in three stages - fundamentals, networking on GCP, then a deliberately broken platform to prove it. Harbour's "order of the fixes is the argument" stays as the lab's positioning.
- **Users:** add learners starting from zero (the fundamentals course assumes no networking background). Keep the evaluator audience.
- **Operating context:** new hierarchy - `/learn/<course>/<chapter>` next to provider → lab → track → view. Name the two courses and their parts. Kadé is the story inside the courses, and Harbour is the lab.
- **Scope:** the fundamentals course is provider-neutral, and its cloud examples use GCP. Labs remain GCP-only.
- **Terminology:** add course, part, chapter, section, widget (interactive figure), Kadé.
- **Evidence on hand:** add the two courses (59 chapters, ~158 widgets).
- **Brand commitments:** the tagline may need to cover learning, not only broken architectures. Propose two or three options to the author; do not change it unasked.
- Resolve the open "Fifteen problems" vs 17 defects fact, or keep it listed.

## 2. The role palette (new tokens)

Rename the source's colour convention into roles. Roles describe what a thing is in a drawing, never its state.

| Role token | Source colour | Meaning | Light (start) | Dark (start) |
| --- | --- | --- | --- | --- |
| `--role-client` | purple | the sender: your laptop, a browser, a client | `#6a4ed6` | `#a58cf7` |
| `--role-net` | cyan | what sits in between: router, gateway, switch, proxy, LB, NAT | `#0d7f8c` | `#3ec7d5` |
| `--role-server` | green | the destination and its replies | `#1d7f4c` | `#5ad28f` |
| `--role-request` | orange | the outbound leg, the request, "go to the gateway" | `#b45a17` | `#ec9a55` |
| `--role-info` | blue (source) | network bits, neutral information | map to `--dd-ink-muted` or a slate; must not look like the accent blue | |
| highlight | yellow | host bits, "notice this" | reuse `--dd-mark` | reuse |
| fault | red | dropped, refused, failing | reuse `--dd-fault` | reuse |

Each role also gets a `-soft` tint (8-10% alpha) for fills. Rules for drawing with it:

- Box: soft fill + 1.25px role stroke + **ink text** (never coloured body text inside boxes).
- Arrow: role stroke + matching arrowhead. Dashed = not built yet / optional, as today.
- Coloured text (`c-green` etc. in the sources) is allowed only for short labels next to a drawing, at ≥4.5:1 contrast.
- Every diagram with two or more roles shows a legend (reuse the `DiagramFrame` caption legend).
- Validate all values for contrast on `--dd-ground` in both themes (strokes ≥3:1, text ≥4.5:1). The `dataviz` skill has a palette validator you can use.

Open choice for this step: whether Harbour's map adopts the roles (edge/compute/data) or stays monochrome. Recommendation: keep Harbour monochrome for now and revisit in step 5, because its red-defect story reads best on ink.

## 3. DESIGN.md changes

- Replace **The Monochrome Drawing Rule** with **The Role Colour Rule**: diagrams and widgets may use the role palette; chrome (header, rails, links, buttons, headings) may not. Blue keeps its one job and red keeps its one job.
- Keep **The Red Is a Fault Rule.** In widgets, red marks a dropped packet, a refused connection, a failing check. It does not mark a wrong quiz answer.
- **Quiz feedback:** "Correct" and "Not quite" are written in ink with a check or cross icon and the explanation. No green/red verdicts. (Green stays a role, never "good".)
- Add components: **Chapter rail**, **Section numerals** (h2 as moves), **Key** (source `.key`, rendered as a margin-mark aside, not a box), **Term**, **Figure** (static SVG), **Widget shell** (input + output, step/play/reset controls using the existing `ToggleChip`/`SegmentedControl`/button vocabulary), **Summary table**, **Try it yourself** (command + OS note), **Commands in this chapter**, **Chapter pager**.
- Mobile: widgets with 32-bit grids or byte dumps scroll sideways inside their frame with the existing "scroll sideways" note, or reflow to 2 x 16 / 4 x 8 rows. Decide per widget family in steps 3-4.

Update `design-system/01-foundations.md` (tokens), `02-components.md` (new components) and `04-motion-and-graphics.md` (diagram rules) to match.

## 4. Tokens in code

- Add the role tokens to `src/app/globals.css` under the existing `:root` / `[data-theme="dark"]` blocks, and expose them as Tailwind colours (`text-role-client`, `fill-role-net-soft`...).
- Add diagram CSS classes that mirror the source's SVG vocabulary so converted SVG stays short: `.lg-d .n` (node), `.n.client|net|server|request`, `.t` (title), `.s` (sub), `.w` (wire), `.w.dash`, `.mid`. Arrowhead markers per role in one shared `<defs>` component.
- Mirror the tokens in `design-system/theme.css` and `.impeccable/design.json`.

## 5. Surface brief

Add `.impeccable/surfaces/src-app-learn.md` for `/learn/**`: mode **Read**. Thesis: a chapter reads like a page of the same annotated score - numbered sections as moves, the author's key ideas in the margin, drawings that break out wide, widgets as small instruments set into the text.

## Done when

- PRODUCT.md and DESIGN.md describe the three-stage guide and the role palette.
- Role tokens exist in both themes and pass contrast checks.
- One test page (or Storybook-like scratch route, removed afterwards) shows a converted source diagram in both themes.
