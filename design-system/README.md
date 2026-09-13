# Design System - Implementation Guide

This folder describes a complete visual design system: colour, type, spacing, components, page layouts, motion and decorative graphics. It was extracted from a working production Next.js app and is written so a coding agent can rebuild the same look and feel in a **different product** that currently has no styling.

---

## Files

| File | What it covers | Read when |
|---|---|---|
| `theme.css` | Drop-in global stylesheet: every colour token, shadow, radius, font mapping, base style, keyframe and animation utility | First - copy it before anything else |
| `01-foundations.md` | Design principles, stack setup, colour roles, typography scale, spacing, radius, elevation | Before writing any UI |
| `02-components.md` | Exact class recipes for buttons, inputs, selects, badges, pills, cards, stat cards, dialogs, sheets, menus, empty/loading/error states, icons, logo | While building components |
| `03-layouts-and-pages.md` | Landing page section by section, auth shell, onboarding wizard, app shell (sidebar + top bar), data visualisation | While building pages |
| `04-motion-and-graphics.md` | Keyframes, scroll reveal, typewriter, fade cycling, ambient glows, product-preview graphics, floating fragments | While polishing |

---

## Instructions for the coding agent

Paste this into the agent's task (adjust the first line to your product):

> Implement the design system described in `docs/design-system/` across this project. It is a dark-only UI with forest-charcoal surfaces, a teal-green accent, Inter + Geist Mono typography, and product-preview graphics instead of illustrations.
>
> 1. Install the stack in `01-foundations.md → Stack setup`, then copy `theme.css` into the global stylesheet.
> 2. Set up fonts and the `cn()` helper exactly as described.
> 3. Build the shared primitives from `02-components.md` (Logo, icons, GlButton, Eyebrow, TypeBadge, ScorePill, GlSelect, field + input recipe, FadeIn) before touching pages.
> 4. Restyle pages using `03-layouts-and-pages.md`. Map our domain onto the patterns - replace the source product's content (log entries, Work/Learning, productivity score, categories) with our own equivalents, but keep structure, spacing and visual treatment.
> 5. Add motion from `04-motion-and-graphics.md` last.
> 6. Never hardcode hex colours in components except inside decorative gradients; always use the `gl-*` token utilities.
> 7. Replace the brand name, logo mark and copy with ours. Do not ship any text from the source product.

---

## Non-negotiables

These are what make the design recognisable. If any of these are missing, the result will not look like the reference.

1. **Dark only.** No light theme. Page background `#161918`, never pure black.
2. **Four-step surface ladder** for depth: `gl-bg-subtle` → `gl-bg` → `gl-surface` → `gl-surface-2`. Cards float on the page with a 1px `gl-border` and `shadow-gl`. Inputs *inside* cards use `gl-bg` so they look recessed.
3. **One accent.** Teal-green `#2EB8A0` for primary actions, active states, focus rings, highlights. Everything else is matte, desaturated colour.
4. **Tight, bold headings** - `font-bold` with negative tracking that gets tighter as size grows (`-0.015em` at 15px → `-0.035em` at 78px).
5. **Numbers look like data** - counts, scores, dates and percentages use `font-mono tabular-nums`.
6. **Eyebrow labels** - tiny uppercase bold labels (`text-[10px]`–`[11px]`, `tracking-[0.12em]`) above stats and panel sections.
7. **Product previews, not illustrations.** Marketing, auth and onboarding screens show static, miniature versions of the real product's widgets.
8. **Ambient radial glows** in teal/sage at 4–16% opacity behind heroes, CTAs and brand panels. Never leave a large dark area completely flat.
9. **Every async view has loading (pulse skeleton), error (inline retry) and empty states** styled with the same tokens.

---

## Mapping the source domain to yours

The reference product is a daily work/learning log. Its domain-specific visuals generalise like this:

| In the reference | Generic pattern | Use it for |
|---|---|---|
| Work / Learning type badge | Two-value **type pair** (ochre vs periwinkle) | Any binary classification: income/expense, bug/feature, internal/external |
| Productivity score 1–10 pill | **Threshold metric pill** (teal ≥ 8, amber 5–7, rust < 5) | Health scores, ratings, SLA %, quality grades |
| Category colour dot + chip | **Categorical swatch** from an 8-colour matte palette | Projects, tags, teams, labels |
| Day streak (amber) | **Momentum stat** in warning tone | Consecutive usage, uptime runs, goals hit |
| Log entry card with typewriter body | **Hero object card** | The single most important object in your product |
| Activity heatmap | **Calendar heatmap** with threshold colouring | Any per-day metric |

---

## Known inconsistencies in the source - do not replicate

- Some decorative previews hardcode swatch hex values (`#69B598`, `#6FC8A0`, `#7C8FE0`…) instead of tokens. In your project, use `var(--gl-swatch-n)` or the palette constant.
- Two primary button styles exist: a tinted one (marketing `GlButton`) and a solid one (forms). This is intentional - see `02-components.md → Buttons` for when to use each - but do not invent a third.
- `--gl-text-faint` (`#606963`) has only ~3.1:1 contrast on `gl-bg`. Use it only for non-essential metadata (timestamps, axis ticks, placeholders), never for body copy or anything a user must read.
- The source has no `prefers-reduced-motion` handling. `theme.css` in this folder adds it - keep it.
