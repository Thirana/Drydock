# 01 - Foundations

Principles, stack setup, colour, typography, spacing, radius and elevation. Every value here is already encoded in `theme.css`; this file explains **what each token is for** and **the rules for using it**.

---

## Design principles

| Principle | In practice |
|---|---|
| **Calm, focused, dark** | A single dark theme. Forest-charcoal greys with a faint green undertone, never blue-navy or pure black. |
| **Depth through surfaces, not lines** | Elevation comes from stepping up the surface ladder plus soft shadows. Borders are 1px and low-contrast. |
| **One loud colour** | Teal-green is the only saturated colour. Secondary accents (ochre, periwinkle, rose, rust, cyan) are matte and desaturated. |
| **Data looks like data** | Numbers, dates, counts and keyboard hints are monospaced with tabular figures. |
| **Show the product** | Marketing and onboarding screens use miniature real UI (cards, stats, charts), not stock illustrations. |
| **Motion is purposeful and quiet** | Fades and small lifts (8–24px), 120–600ms, ease-out curves. Loops are slow (5–6s). |

---

## Stack setup

The reference is **Next.js (App Router) + Tailwind CSS v4 + shadcn/ui**. If your project uses a different stack, keep the token values and class recipes; translate the mechanics.

### Packages

```bash
npm install tailwindcss @tailwindcss/postcss tw-animate-css shadcn \
  class-variance-authority clsx tailwind-merge lucide-react sonner
```

- `lucide-react` is used **only** for the `Loader2` spinner. All other icons are custom SVGs (see `02-components.md → Icons`).
- `sonner` provides toasts.

### PostCSS

```js
// postcss.config.mjs
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### Global CSS

Copy `theme.css` into your global stylesheet (e.g. `src/app/globals.css`).

> **Tailwind v3 projects:** move the `@theme inline` block into `tailwind.config` `theme.extend` (`colors.gl.*`, `boxShadow.gl*`, `borderRadius`, `fontFamily`) and keep the `:root` variables, `@layer base`, keyframes and utilities as plain CSS.

### Fonts

Inter (with the optical-size axis) for all UI text, Geist Mono for data.

```tsx
// src/app/layout.tsx
import { Inter, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
```

### `cn()` helper

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Use `cn()` for every conditional class list.

### shadcn

`components.json` uses `"style": "base-nova"`, `"baseColor": "neutral"`, `"cssVariables": true`, `"iconLibrary": "lucide"`. The shadcn semantic tokens (`--background`, `--primary`, …) are mapped to the GL palette in `theme.css`, so any shadcn primitive you add matches automatically. Prefer the custom GL components in `02-components.md` for anything user-facing.

---

## Colour

### Surface ladder (darkest → lightest)

| Token | Hex | Utility | Use for |
|---|---|---|---|
| `--gl-bg-subtle` | `#101210` | `bg-gl-bg-subtle` | Sidebar, auth/onboarding brand panels, chart and progress **tracks**, segmented-control wells, window chrome bars |
| `--gl-bg` | `#161918` | `bg-gl-bg` | Page background; **inputs that sit inside a card** (recessed look) |
| `--gl-surface` | `#1d201e` | `bg-gl-surface` | Cards, dialogs, sheets, dropdowns, tooltips, announcement pills |
| `--gl-surface-2` | `#252924` | `bg-gl-surface-2` | Nested cards inside cards, chips, hover state on rows/list items, icon-button backgrounds |

**Rule:** each nesting level steps **one** rung up. A card on the page is `surface`; a panel inside that card is `surface-2`. An input inside a `surface` card drops **down** to `bg`.

### Borders

| Token | Hex | Use for |
|---|---|---|
| `--gl-border` | `#2c312d` | Default 1px border on all cards, dividers, table rows, section rules |
| `--gl-border-input` | `#383d39` | Text inputs, selects, secondary button outlines - slightly brighter so fields are findable |
| `--gl-border-strong` | `#d8ddd6` | **Signature accent only**: a showcase panel with `shadow-gl-hard` (4px offset solid off-white shadow). Use at most once per page. |

### Text

| Token | Hex | Contrast on `gl-bg` | Use for |
|---|---|---|---|
| `--gl-text` | `#eef0ec` | ~15:1 | Headings, primary content, values, active labels |
| `--gl-text-muted` | `#8a9189` | ~5.5:1 | Body copy, descriptions, secondary labels, inactive nav, user-written content in lists |
| `--gl-text-faint` | `#606963` | ~3.1:1 | Eyebrows over stats, timestamps, axis ticks, placeholders, footnotes. **Never** for required-reading text. |

### Primary accent

| Token | Hex | Use for |
|---|---|---|
| `--gl-primary` | `#2eb8a0` | Solid primary buttons, active nav item, active segment, focus rings, highlighted words in headings, links, chart lines, today marker |
| `--gl-primary-hover` | `#3ecdb5` | Hover on solid primary and on primary links |
| `--gl-primary-soft` | `#0d2420` | Background for accent badges ("New", "Free"), check-mark circles, score pills in previews, trend-up chips, active tab pill |
| `--gl-primary-ink` | `#051a16` | Text/icons **on** a solid `gl-primary` background |

Alpha variants are used freely: `bg-gl-primary/[0.16]` (tinted button), `/[0.24]` (tinted hover), `ring-gl-primary/15` (input focus halo), `border-gl-primary/30` (active tab border), `text-gl-primary/60` (dimmed label inside a primary pill).

### Tone triads (soft / fg / ink)

Each semantic colour has three roles. Always use them together the same way:

| Role | Pattern | Example |
|---|---|---|
| **Soft chip** | `bg-{tone}-soft text-{tone}` | Streak badge: `bg-gl-warning-soft text-gl-warning` |
| **Solid chip** | `bg-{tone} text-{tone}-ink` | Score pill ≥ 8: `bg-gl-primary text-gl-primary-ink` |
| **Icon tile** | `bg-{tone}-soft text-{tone}` in a `size-10/11 rounded-xl` square | Problem cards, how-it-works steps |

| Tone | Soft | Fg | Ink |
|---|---|---|---|
| Primary | `#0d2420` | `#2eb8a0` | `#051a16` |
| Success | `#0d2419` | `#69b598` | - |
| Warning | `#231a07` | `#c4a05e` | `#1a1200` |
| Danger | `#261009` | `#b87060` | `#1c0907` |
| Type A (`work`) | `#28200c` | `#c4a05e` | `#1a1200` |
| Type B (`learn`) | `#161628` | `#8285ba` | `#0d0c1e` |

Utilities for the type pair: `bg-gl-work`, `bg-gl-work-bg`, `text-gl-work`, `text-gl-work-ink`, and the same with `learn`.

**Warning tone doubles as "momentum"** - streaks, "best" values, and anything celebratory-but-not-primary use amber.

### Threshold colouring

For any 1–10 (or percentage) metric:

| Range | Treatment |
|---|---|
| ≥ 8 (good) | `bg-gl-primary text-gl-primary-ink` |
| 5 – 7 (ok) | `bg-gl-warning text-gl-warning-ink` |
| < 5 (poor) | `bg-gl-danger text-gl-danger-ink` |

### Categorical palette

Used for user-created groupings (projects, tags, categories). Show as a small dot (`size-2` to `size-3 rounded-full`) next to the name.

Six CSS tokens: `--gl-swatch-1` … `--gl-swatch-6`
`#69b598` sage · `#8285ba` periwinkle · `#b87da2` rose · `#c4a05e` ochre · `#b87060` rust · `#62aebf` cyan

Extended 8-colour palette (for user-selectable colours - validate against this list on the backend):

```ts
export const COLOR_PALETTE = [
  '#69B598', '#8285BA', '#B87DA2', '#C4A05E',
  '#62AEBF', '#B87060', '#7DB8B0', '#A87DB8',
] as const;
```

Assign the next unused colour automatically (`COLOR_PALETTE[count % COLOR_PALETTE.length]`), or deterministically from an ID:

```ts
export function getSwatchVar(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `var(--gl-swatch-${(hash % 6) + 1})`;
}
```

**Tinted chip from any swatch** (hex + alpha suffix):
`background: ${color}18` · `border: 1px solid ${color}30` · `color: ${color}`

**Solid chip from any swatch:** `backgroundColor: color` with `color: 'rgba(12,10,5,0.82)'` for dark text.

### Decorative colours (gradients only)

These appear **only** inside gradients and glows, never as flat fills:

| Value | Use |
|---|---|
| `#2EB8A0 → #7DDFD0` | Gradient headline text (`bg-gradient-to-r from-[#2EB8A0] to-[#7DDFD0] bg-clip-text text-transparent`) |
| `rgba(111,200,160, 0.07–0.16)` | Sage halo behind landing hero and bottom CTA |
| `rgba(242,234,211, 0.04)` | Faint cream warmth layered in the hero halo |
| `rgba(46,184,160, 0.04–0.09)` | Teal glow on auth/onboarding panels and behind forms |
| `rgba(46,184,160, 0.22)` | Text selection |

---

## Typography

**Families:** `font-sans` (Inter) for everything; `font-mono` (Geist Mono) for numbers, dates, counts, percentages, keyboard hints, character counters, axis labels, and the "01/02/03" step numerals.

**Weights:** `font-medium` (500) for UI labels and nav · `font-semibold` (600) for buttons, card titles, field labels · `font-bold` (700) for all headings, stat values and eyebrows. Normal (400) only for dimmed sub-labels inside pills.

**Tracking rule:** the larger the text, the tighter the tracking. Uppercase micro-labels go the other way (wide).

### Type scale

| Role | Size | Leading | Tracking | Weight | Example class |
|---|---|---|---|---|---|
| Hero H1 | 52 → 64 (sm) → 78 (lg) | `1.02` | `-0.035em` | bold | `text-[52px] sm:text-[64px] lg:text-[78px] leading-[1.02] tracking-[-0.035em] font-bold` |
| CTA headline | 38 → 48 → 56 | `1.05` | `-0.030` → `-0.035em` | bold | |
| Section H2 | 36 → 44 (sm) | `1.08` | `-0.025` → `-0.028em` | bold | `text-[36px] sm:text-[44px] leading-[1.08] tracking-[-0.025em] sm:tracking-[-0.028em]` |
| Feature H3 | 28 → 32 (sm) | `1.18` | `-0.022em` | bold | |
| Panel headline (auth/onboarding) | 28 → 32 (xl) | `1.2` | `-0.02em` | bold | |
| Page title (app) | 26 → 28 (sm) | `tight` | `-0.022em` | bold | |
| Form title | 26 | `tight` | `-0.02em` | bold | |
| Hero object title | 22 | `1.32` | `-0.018em` | bold | |
| Card title | 20 | `1.3` | `-0.015em` | bold | |
| Step / sheet title | 18 | `1.25` / `snug` | `-0.018em` | bold | |
| Dialog title / list header | 16–17 | `snug` | `-0.015em` | bold | |
| Section header (app) | 15 | - | `-0.015em` | bold | |
| Lead paragraph | 17 → 20 (sm) | `1.55` | - | normal | `text-gl-text-muted` |
| Body large | 16 | `1.65` | - | normal | |
| Body | 14–15 | `1.6`–`1.65` | - | normal | |
| UI label / nav | 13–14 | - | - | medium | |
| Small / helper | 12–13.5 | `relaxed` | - | normal | |
| Micro (chip text) | 10.5–11.5 | `none` | `0.01em` | semibold | |
| Eyebrow | 10–11 | - | `0.12em` | bold, **uppercase** | `text-gl-text-faint text-[11px] font-bold tracking-[0.12em] uppercase` |
| Big stat value | 42 | `none` | `-0.03em` | bold | `tabular-nums` |
| Widget stat value | 22–28 (mono) / 52 (hero streak) | `none` | `-0.02em` | bold | `font-mono tabular-nums` |
| Mono meta | 10–12 | - | `0.06`–`0.12em` if uppercase | medium/semibold | `font-mono` |

Arbitrary pixel sizes (`text-[13.5px]`) are intentional - the scale is finer than Tailwind's defaults. Keep them.

### Text treatments

- **Headings:** add `text-balance`. **Paragraphs:** add `text-pretty`.
- **Highlight one word** in a section heading with `text-gl-primary` ("Set up and start **growing**.").
- **Gradient text** only for the primary tagline on hero, auth panel and onboarding panel - one phrase per screen.
- **User-authored content** (notes, descriptions written by the user) renders in `italic text-gl-text-muted`. This visually separates "your words" from UI chrome.
- **Measure:** hero sub-copy `max-w-[620px]`, section intros `max-w-[640px]`–`[680px]`, CTA sub-copy `max-w-[520px]`, empty-state copy `max-w-[320px]`.

---

## Spacing and layout

| Context | Value |
|---|---|
| Marketing container | `mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12` |
| Marketing section padding | `py-12 sm:py-16 lg:py-20` (some sections use `lg:pt-16 lg:pb-8/12`) |
| Section intro → content gap | `mb-8` to `mb-10` |
| Hero | `pt-16 pb-20 sm:pt-20 sm:pb-24`, centred |
| App content area | `px-8 py-8 pb-20`; sections separated by `mt-12` |
| App top bar | `px-6 pt-7 pb-6 sm:px-8`, bottom border |
| Card padding | `p-5` stat/widget · `p-6` form card, preview, dialog · `p-7` feature/hero card |
| Grid gaps | `gap-3.5` bento/stats · `gap-4`/`gap-5` card grids · `gap-10 lg:gap-16` copy + preview split |
| Form field stack | `space-y-4` (auth) · `gap-[22px]` (sheets) · label → input `space-y-1.5` / `mb-2` |
| Brand side panel | `lg:w-[440px] xl:w-[500px]`, `px-10 py-10` |
| Sidebar | `w-[240px] px-4 py-[22px]` |
| Slide-over sheet | `w-[480px] max-w-full` |
| Dialog | `w-[400px] max-w-[calc(100vw-32px)]` |
| Form column | `max-w-md` |

**Mobile-first always.** Write base styles for phones, then add `sm:` (640), `md:` (768), `lg:` (1024), `xl:` (1280). Side panels and the sidebar are hidden below `lg`.

---

## Radius

`theme.css` overrides some of Tailwind's radius names. Effective values:

| Class | Value | Used for |
|---|---|---|
| `rounded` | 4px | Tiny trend-icon squares, skeleton bars |
| `rounded-sm` | 8px | Mini chart bars |
| `rounded-md` | 12px | Menu items |
| `rounded-lg` | 16px | GlButton sm/md, auth inputs, solid form buttons, tooltips |
| `rounded-xl` | 24px | Stat cards, widgets, nested preview cards, icon tiles, list cards |
| `rounded-2xl` | 16px | Hero/feature/problem cards, form cards, FAQ items |
| `rounded-3xl` | 24px | Bottom CTA container |
| `rounded-full` / `rounded-pill` | 999px | Badges, chips, dots, avatars, progress tracks, tab pills |
| `rounded-[7px]` | 7px | Segmented-control segments, sidebar nav items, icon menu buttons |
| `rounded-[9px]` | 9px | Segmented-control well, dropdown menu panel, sidebar CTA |
| `rounded-[10px]` | 10px | GlButton lg, sheet inputs, GlSelect, sheet/dialog buttons |
| `rounded-[14px]` | 14px | Dialog |

If you do **not** copy the radius overrides, replace `rounded-lg` → `rounded-[16px]` and `rounded-xl` → `rounded-[24px]` in the recipes to get the same result.

---

## Elevation

| Utility | Value | Use for |
|---|---|---|
| *(none)* | - | Flat rows inside a card, section dividers |
| `shadow-gl` | `0 1px 2px rgba(0,0,0,.5), 0 8px 24px -10px rgba(0,0,0,.55)` | Default resting card, stat cards, form cards, dropdown menu |
| `shadow-gl-lg` | `0 2px 4px rgba(0,0,0,.55), 0 28px 48px -20px rgba(0,0,0,.7)` | Hover state of lifting cards, hero object card, previews, dialogs, sheets, tooltips, select listbox |
| `shadow-gl-hard` | `4px 4px 0 #d8ddd6` | Signature showcase panel only, paired with `border-gl-border-strong` |

**Hover lift recipe** (interactive or showcase cards):
`shadow-gl hover:shadow-gl-lg transition-all duration-[150ms] hover:-translate-y-0.5`

**Overlay z-order:** sticky nav `z-50` · sheet backdrop `z-50`, sheet `z-60` · dialog backdrop `z-[70]`, dialog `z-[80]` · dropdowns `z-10`/`z-20` within their container.
