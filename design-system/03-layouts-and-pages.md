# 03 - Layouts and Pages

How screens are composed from the foundations and components. Replace the reference product's copy and domain objects with your own, but keep structure, rhythm and visual treatment.

---

## Page inventory

| Screen | Layout |
|---|---|
| Landing (`/`) | Full-width halo + centred 1200px column of sections |
| Auth (`/login`, `/register`, `/verify-email`, `/check-email`) | Two-column shell: brand panel (lg+) + form column |
| Onboarding (`/onboarding`) | Two-column wizard: step-aware brand panel (lg+) + wizard column |
| App (`/dashboard`, etc.) | Sidebar (lg+) + main column with top bar and sectioned content |

---

## Landing page

### Frame

```tsx
<div className="bg-gl-bg text-gl-text relative min-h-screen overflow-x-hidden">
  {/* Full-width halo behind nav + hero */}
  <div
    className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1100px]"
    style={{
      background: `
        radial-gradient(70% 45% at 50% 0%, rgba(111, 200, 160, 0.16) 0%, transparent 65%),
        radial-gradient(45% 35% at 50% 25%, rgba(242, 234, 211, 0.04) 0%, transparent 80%),
        linear-gradient(to bottom, transparent 55%, var(--gl-bg) 100%)
      `,
    }}
    aria-hidden="true"
  />
  <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
    <Nav /> <Hero /> <ProblemSection /> <FeaturesSection /> <LivePreview />
    <HowItWorks /> <FaqSection /> <BottomCta /> <Footer />
  </div>
</div>
```

Section order tells a story: **promise → pain → capabilities → proof (live preview) → steps → objections → final CTA**.

### Nav

- `<header>` is `sticky top-0 z-50 transition-all duration-300`. After scrolling 24px it gains `border-b border-gl-border bg-gl-bg/80 backdrop-blur-2xl`; before that it is transparent.
- `<nav className="flex items-center justify-between py-5 md:py-6">`
- Left: logo lockup.
- Centre (md+): anchor links `rounded-lg px-3 py-2 text-[14px] font-medium text-gl-text-muted hover:text-gl-text transition-colors duration-150`.
- Right (md+): 1px vertical divider `bg-gl-border mx-2 h-[18px] w-px` · "Log in" `text-gl-text hover:text-gl-primary text-[14px] font-semibold px-3 py-2` · `GlButton primary md` "Get started →".
- Mobile: hamburger `IconMenu`/`IconClose` 20px; menu expands with `overflow-hidden transition-all duration-300 max-h-0 opacity-0 → max-h-[400px] opacity-100`, contents `flex flex-col gap-1 border-t border-gl-border py-4`, links `px-3 py-2.5 text-[15px] rounded-lg hover:bg-gl-surface`, full-width `GlButton lg` at the bottom. Auto-close when the window reaches `md`.

### Hero

`<section className="relative pt-16 pb-20 text-center sm:pt-20 sm:pb-24">`

1. **Announcement pill** (`mb-8`) - "New" label + one-line value prop + arrow. Shorter copy on mobile (`sm:hidden` / `hidden sm:inline`).
2. **H1** (`mx-auto mb-6 max-w-[820px]`), two lines, three-beat reveal:
   - Line 1 `animate-fade-up-lg inline-block` - opening phrase in **gradient text** + plain word.
   - `<br />`
   - Line 2 `animate-fade-up-lg animation-delay-500 inline-block` - ends with one **key word** in `text-gl-primary animate-scale-in animation-delay-800`.
3. **Subtitle** `mx-auto mb-10 max-w-[620px] text-[17px] sm:text-[20px] leading-[1.55] text-gl-text-muted text-pretty`.
4. **CTAs** `flex flex-wrap items-center justify-center gap-4` → `GlButton primary lg` with arrow + `GlButton secondary lg`.
5. **Trust badges** `mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3` → check bullet + `text-[13px] font-medium text-gl-text-muted`, three short claims.
6. **Bento product spot** `relative mt-20` → `mx-auto max-w-[960px] text-left`:

```tsx
<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
  <div className="sm:col-span-2 lg:col-span-1 lg:row-span-3"><HeroObjectCard /></div>  {/* tall anchor */}
  <MomentumWidget />                                                                 {/* big amber number */}
  <ScoreArcWidget />                                                                 {/* 270° arc gauge */}
  <SplitWidget className="sm:col-span-2 lg:col-span-2" />                           {/* two-bar ratio */}
  <CategoriesWidget className="sm:col-span-2 lg:col-span-2" />                       {/* ranked bars */}
</div>
```

Widget cards: `border border-gl-border bg-gl-surface shadow-gl hover:shadow-gl-lg rounded-xl p-5 transition-all duration-[150ms] hover:-translate-y-0.5`, each with a faint eyebrow at the top. Content cycles slowly (see `04 → Fade cycle`).

### Problem section ("Sound familiar?")

- Header block `mx-auto mb-10 max-w-[640px] text-center` → H2 + one-line lead.
- Three pain cards (feature/problem card recipe) with an icon tile (warning / learn / danger tones), `text-[20px]` title, `text-[15px] leading-[1.6]` body.
- **Mobile carousel → desktop grid:**
  ```
  no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto
  sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-3
  ```
  Cards `w-[82%] min-w-[82%] flex-shrink-0 snap-start sm:w-auto sm:min-w-0`. A right-edge fade `from-gl-bg bg-gradient-to-l to-transparent w-16 sm:hidden` hints at more. Carousel dots below track the visible card with `IntersectionObserver` (`threshold: 0.6`, `root` = scroller).

### Features section (auto-advancing tabs)

- Header block (`max-w-[680px] mb-8`).
- **Tab pills** `mb-10 flex justify-center gap-2`:
  ```
  relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3 py-1.5 text-[12px] font-semibold
  sm:gap-2 sm:px-5 sm:py-2 sm:text-[13px] transition-all duration-150
    active:   border-gl-primary/30 bg-gl-primary-soft text-gl-primary
    inactive: border-gl-border bg-gl-surface text-gl-text-muted hover:border-gl-border-input hover:text-gl-text
  ```
  Active pill has a progress underline: `animate-tab-progress absolute bottom-0 left-0 h-[2px] w-full bg-gl-primary opacity-60` that fills over the 5s interval.
- **Panels** stacked in one grid cell (`display: grid`, each panel `gridArea: '1 / 1'`) so the container is always the tallest panel - no layout shift. Inactive panels: `opacity 0`, `translateY(10px)`, `visibility: hidden`, `pointer-events: none`. Transition 260ms.
- Panel layout `grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16`:
  - Left: H3 `text-[28px] sm:text-[32px]` · body `text-[16px] leading-[1.65] mb-7` · bullet list `flex flex-col gap-3.5` with check bullets (`mt-[3px]`) and `text-[14.5px]` text.
  - Right: a rich static **preview card** of that feature (`rounded-2xl p-6 shadow-gl-lg`).
- Auto-advance: `setTimeout` 5000ms keyed on the active index, so clicking a tab restarts the clock.

### Live preview

A full, static copy of the real app dashboard rendered with sample data, anchored at `id="preview"` for the hero's secondary CTA. Reuse the real presentational components (stats row, charts, list, heatmaps) fed with fixed data - do **not** call the API from the landing page. Frame it as the showcase panel (`border-gl-border-strong shadow-gl-hard`) with a chrome bar (see "Showcase dashboard panel" below).

### How it works

- H2 with one highlighted word.
- Three step cards in the same carousel → grid pattern (`sm:grid-cols-3`).
- **Connector line** behind the icon row on desktop:
  ```tsx
  <div className="pointer-events-none absolute top-[44px] right-[16.66%] left-[16.66%] hidden h-px sm:block"
    style={{ background: 'linear-gradient(to right, transparent, var(--gl-border) 12%, var(--gl-border) 88%, transparent)' }} />
  ```
  Cards sit above it with `relative z-10`.
- Card: `rounded-2xl p-6 flex flex-col gap-5` → top row icon tile (`size-10`, primary / warning / learn tones) ↔ giant step numeral `font-mono text-[28px] font-bold text-gl-border` ("01") → mini preview between `border-y border-gl-border py-4` → title `text-[18px]` + body `text-[14px]`.

### Testimonials (optional)

`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3` of `<figure>` cards `rounded-2xl p-7 flex flex-col justify-between gap-6` → `<blockquote>` `text-[17px] leading-[1.5] font-medium tracking-[-0.012em] text-gl-text` with curly quotes in `text-gl-primary font-bold` → `<figcaption>` swatch-coloured initials avatar + name (`text-[14px] font-semibold`) + role (`text-[12.5px] text-gl-text-muted`). Do not fabricate named people - use role descriptions.

### FAQ

- Container `mx-auto flex max-w-[720px] flex-col gap-3` of separate cards `rounded-2xl border border-gl-border bg-gl-surface shadow-gl overflow-hidden`.
- Trigger `flex w-full items-start justify-between gap-4 px-6 py-5 text-left hover:bg-gl-surface-2 transition-colors duration-150`, `aria-expanded`. Question `text-[15.5px] sm:text-[16px] font-semibold`, turns `text-gl-primary` when open. Chevron 16px rotates 180° (300ms) and turns primary.
- **Smooth height** with the grid-rows trick: wrapper `grid transition-all duration-300 ease-in-out grid-rows-[0fr] → grid-rows-[1fr]`, child `overflow-hidden`.
- Answer `px-6 pb-5` → `border-l-2 border-gl-primary pl-4 text-[15px] leading-[1.7] text-gl-text-muted`.
- First item open by default.

### Bottom CTA

Inside `<section className="py-12 sm:py-16 lg:pt-16 lg:pb-20">`, the CTA container (`rounded-3xl`, `bg-gl-surface`) with a double halo:

```tsx
<div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" style={{
  background: `
    radial-gradient(55% 70% at 50% 0%, rgba(111, 200, 160, 0.13) 0%, transparent 70%),
    radial-gradient(40% 50% at 50% 100%, rgba(111, 200, 160, 0.07) 0%, transparent 70%)
  `,
}} />
```

Content (`relative z-10`): row of stat pills (`mb-8`) → headline `max-w-[700px] text-[38px] sm:text-[48px] lg:text-[56px]` with one highlighted word → sub-copy `max-w-[520px]` → primary + secondary `GlButton lg` → trust badges `mt-8 gap-x-6 gap-y-2.5`.

### Footer

`<footer className="border-t border-gl-border py-12 pb-10">` → `grid grid-cols-2 gap-8 sm:grid-cols-4`:
- Brand column `col-span-2 sm:col-span-1`: logo lockup (`size 20`, `text-[16px]`) · one-line description `max-w-[280px] text-[13px] leading-[1.55] text-gl-text-muted` · copyright `mt-6 font-mono text-[12px] text-gl-text-faint`.
- Three link columns: heading `mb-4 text-[11px] font-bold tracking-[0.12em] uppercase text-gl-text-faint` · `ul flex flex-col gap-2.5` · links `text-[13.5px] font-medium text-gl-text-muted hover:text-gl-text`.

---

## Auth shell

```tsx
<div className="flex min-h-screen">
  {/* Brand panel - lg+ only */}
  <div className="bg-gl-bg-subtle relative hidden flex-col overflow-hidden px-10 py-10 lg:flex lg:w-[440px] xl:w-[500px]">
    <div className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full" aria-hidden="true"
      style={{ background: 'radial-gradient(circle, rgba(46,184,160,0.09) 0%, transparent 65%)' }} />
    {/* Logo lockup (relative z-10) */}
    <div className="relative z-10 flex flex-1 flex-col justify-center gap-8">
      {/* Tagline: text-[28px] xl:text-[32px] leading-[1.2] font-bold tracking-[-0.02em]
          line 1 gradient text, line 2 text-gl-text; then text-[13.5px] muted description */}
      {/* Static mini hero-object card (rounded-xl p-5 shadow-gl) */}
      {/* 3 check-bullet features, text-[13px] */}
    </div>
    <p className="text-gl-text-faint relative z-10 mt-8 text-[11px]">© {year} Brand. All rights reserved.</p>
  </div>

  {/* Form column */}
  <div className="bg-gl-bg relative flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true"
      style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(46,184,160,0.04), transparent)' }} />
    {/* Floating product fragments - lg+ only, opacity 0.3 (see 04) */}
    {/* Mobile logo lockup: mb-10 lg:hidden */}
    <div className="relative z-10 w-full max-w-md">{children}</div>
  </div>
</div>
```

### Auth form content

`space-y-6`:
1. **Trust pill** - announcement-pill style with a "Free" label + "No credit card required".
2. Heading `text-[26px] leading-tight font-bold tracking-[-0.02em]` + sub `mt-1.5 text-[14px] leading-relaxed text-gl-text-muted`.
3. `<form noValidate>` → **form card** (`rounded-2xl p-6 space-y-4 shadow-gl`) → fields with recessed inputs → full-width solid primary submit (`mt-1`).
4. Switch link `text-center text-[13.5px] text-gl-text-muted` with inline primary link.

Field-level errors show under the field (e.g. "An account with this email already exists." for a 409). Generic failures go to a toast. Login failures stay generic ("Invalid email or password").

---

## Onboarding wizard

Same two-column proportions as auth.

- Outer `flex min-h-screen lg:h-screen lg:overflow-hidden`.
- **Brand panel** `bg-gl-bg-subtle hidden flex-col px-10 py-10 lg:flex lg:w-[440px] xl:w-[500px]`: logo · step-specific content that re-animates on step change (`key={step}` + `animate-in fade-in-0 slide-in-from-bottom-2 duration-300`) · copyright.
  - Step content `flex flex-1 flex-col justify-center gap-7`: gradient/plain two-line tagline → explanation → **a preview widget relevant to this step** (stack of mini cards `rounded-xl px-4 py-3 shadow-gl`) → three solid check-bullet features.
- **Wizard column** `bg-gl-bg flex flex-1 flex-col px-6 py-12 sm:px-10 lg:px-14 xl:px-20`: mobile logo · step bar · step body (same `key` animation).
- **Step body** anatomy:
  1. Status pill ("● Setting up workspace") `mb-4`
  2. H1 `text-[28px] xl:text-[32px]` with the key noun in gradient text
  3. Helper paragraph `mt-2 text-[14px] leading-relaxed`
  4. Eyebrow "POPULAR - CLICK TO ADD" (`text-[10.5px] font-semibold tracking-[0.08em] uppercase text-gl-text-faint mb-3`) → suggestion chips `flex flex-wrap gap-2`
  5. Custom-entry card (`rounded-2xl p-5`) with recessed input + neutral "Add" button
  6. Eyebrow "ADDED - 2 / 5" → list of rows `rounded-xl px-4 py-3.5 shadow-gl` animating in (`animate-in fade-in-0 slide-in-from-bottom-1 duration-200`), remove "×" `text-gl-text-faint hover:text-gl-danger`; or a dashed placeholder when empty
  7. Full-width solid primary "Continue - next step →" (`mt-8 py-3`), with a faint hint below when disabled

---

## App shell

```tsx
<div className="bg-gl-bg text-gl-text flex min-h-screen">
  <div className="hidden lg:block"><Sidebar /></div>
  <main className="flex min-w-0 flex-1 flex-col">
    <TopBar />
    <div className="flex-1 px-8 py-8 pb-20">{/* sections, mt-12 apart */}</div>
  </main>
</div>
```

### Sidebar

`<aside className="no-scrollbar sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-gl-border bg-gl-bg-subtle px-4 py-[22px]">`

Top to bottom:
1. Logo lockup (`mb-6 px-2 py-1`, size 20, `text-[15px]`).
2. **Primary create action** - full-width outline accent button "+ Add item" (`mb-4`).
3. **Nav** `ul flex flex-col gap-0.5`: `flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[13.5px] font-medium transition-colors duration-[120ms]` with 18px icon. Active `bg-gl-primary text-gl-primary-ink font-semibold` + `aria-current="page"`; inactive `text-gl-text-muted hover:text-gl-text`.
4. **Group list** (`mt-6`): eyebrow `mb-2.5 px-2.5 text-[10px]` → sidebar list items with colour dots and mono counts (skeleton rows while loading).
5. **Footer** (`mt-auto`): Settings link → `mt-2 border-t border-gl-border pt-3` user block with initials avatar, name `text-[12.5px] font-semibold truncate`, email `text-[11px] text-gl-text-muted truncate`.

### Top bar

`border-b border-gl-border px-6 pt-7 pb-6 sm:px-8` → `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6`:
- Left: page title `text-[26px] sm:text-[28px] font-bold tracking-[-0.022em]` + momentum badge inline (`flex flex-wrap items-center gap-3`) · date below `mt-1.5 text-[13px] text-gl-text-muted` (e.g. "Thursday, May 15").
- Right: context chips - "Today:" label + solid swatch chips `rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold` with `backgroundColor: swatch; color: rgba(12,10,5,0.82)`.

### Dashboard content

Three sections, each with the accent-bar section header:

1. **Overview** - right slot: period segmented control (7 days / 30 days / This week / This month). Stats row → activity card (charts). Dims to 60% while refetching.
2. **Recent items** - right slot: outline "+ Add item". List card with header (title + filter segmented control + "View all →") and data rows; skeleton / empty / filtered-empty states.
3. **Patterns** - calendar heatmaps.

The create/edit form opens as a right slide-over sheet; delete confirms in a dialog.

---

## Data visualisation

All charts are hand-built with divs/SVG and tokens - no chart library. This keeps them visually identical to the rest of the UI.

### Colour rules

- Two-series data uses the type pair: **type A `gl-work` (opacity .85) at the bottom/left, type B `gl-learn` (opacity .95) on top/right**.
- Single-series trend uses `gl-primary` line (2.5px, round caps/joins) over a `gl-primary` area at 12% opacity, with only the last point marked (`r=4`).
- Categorical data uses swatches.
- Tracks behind bars: `bg-gl-bg-subtle` (or `bg-gl-surface-2` inside nested cards).
- Axis ticks and labels: `font-mono text-[10px] text-gl-text-faint`.
- Gridlines: `border-t border-dashed border-gl-border`; baseline solid.

### Stacked daily bar chart

- Height 220px, left gutter `pl-8` for tick labels; up to 4 unique integer ticks (`ceil(max/4)`, `ceil(max/2)`, `ceil(3max/4)`, `max`).
- Columns `flex items-end gap-[3px]`, each `flex-1`; bar wrapper `overflow-hidden rounded-t-full` with height = total/max, containing type-B then type-A segments.
- "Today" marker: `size-[5px] rounded-full bg-gl-primary` 8px above the column.
- Hover tooltip (see `02 → Tooltip`) positioned at `((index + 0.5) / count) * 100%`.

### Mini bar chart (previews)

`flex items-end gap-[3px]` at 40px height, bars `flex-1 rounded-t-[2px] bg-gl-primary`, opacity ramping `0.3 + (i / n) * 0.7` so recent bars are brighter. Or highlight a single bar in `gl-primary` and the rest in `rgba(46,184,160,0.3)` / `gl-surface-2`.

### 270° arc gauge

```tsx
const ARC = 169.65; // 2π·36 · 270/360
<svg width="108" height="108" viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--gl-bg-subtle)" strokeWidth="7"
    strokeLinecap="round" strokeDasharray={`${ARC} 226.19`} transform="rotate(135 50 50)" />
  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--gl-primary)" strokeWidth="7"
    strokeLinecap="round" strokeDasharray={ARC} strokeDashoffset={ARC * (1 - value / 10)}
    transform="rotate(135 50 50)" style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)' }} />
</svg>
```
Centre label absolutely positioned: value `text-[24px] font-bold tabular-nums` + "/ 10" `text-[10px] text-gl-text-faint`.

### Calendar heatmap

- 7-column grid, Monday first; pad the start with hidden cells (`visibility: hidden`) and pad the end to a multiple of 7. Day labels Mon–Sun.
- Cell backgrounds:
  - future `rgba(255,255,255,0.03)` · no data `rgba(255,255,255,0.06)` · data but no score `rgba(255,255,255,0.11)`
  - **Score ≥ 8:** `rgba(46,184,160, 0.38 → 1.0)` scaled within the band
  - **Score 5–7:** `rgba(196,160,94, 0.32 → 0.80)`
  - **Score < 5:** `rgba(184,112,96, 0.28 → 0.80)`
- **Count-based variant** (e.g. how many groups touched): 1 → teal .88 · 2 → teal .50 · 3 → amber .55 · 4+ → amber .82.
- Cell value text `text-[10px] sm:text-[11px] font-bold tabular-nums`; switch the ink to the tone's dark `-ink` colour when the fill is strong, and to the tone's fg colour when the fill is weak, so text always stays legible.

### Showcase dashboard panel (marketing)

```
Panel:     border-gl-border-strong bg-gl-surface shadow-gl-hard overflow-hidden rounded-2xl text-left
Chrome:    flex items-center justify-between border-b border-gl-border bg-gl-bg-subtle px-5 py-3
           → Logo 16 + "Dashboard" text-[13px] font-bold + "· Thu, 15 May" font-mono text-[11px] text-gl-text-faint
           → momentum pill rounded-full px-2.5 py-[5px] text-[11.5px] font-bold
Stats:     grid grid-cols-2 sm:grid-cols-4 border-b border-gl-border; cells px-4 py-3 with internal borders
           (2-col: r+b, b, r, none → 4-col: r, r, r, none), eyebrow text-[10px], value text-[22px], note text-[11px]
Body:      grid grid-cols-1 md:grid-cols-[220px_1fr]
           → ranked bars column (border-b md:border-r md:border-b-0)
           → rows divide-y divide-gl-border
```
