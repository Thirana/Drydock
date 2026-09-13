# 02 — Components

Exact class recipes for every reusable UI element. Build these as shared components before styling any page. All examples are React + Tailwind; the class strings are the source of truth if you use another framework.

Conventions used by the reference:
- Named props interface above every component, explicit return types, no `React.FC`.
- `'use client'` only when the component has state, effects or handlers.
- Every icon/decorative element gets `aria-hidden="true"`.

---

## Logo mark

A five-bar "equaliser" — the tallest centre bar uses the accent. Replace with your own mark, but keep the treatment: **one accent element, rest in `gl-text`**, rendered as inline SVG so it inherits tokens.

```tsx
export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect x="2" y="11" width="2.6" height="9" rx="0.6" className="fill-gl-text" />
      <rect x="6" y="7" width="2.6" height="13" rx="0.6" className="fill-gl-text" />
      <rect x="10" y="3" width="2.6" height="17" rx="0.6" className="fill-gl-primary" />
      <rect x="14" y="9" width="2.6" height="11" rx="0.6" className="fill-gl-text" />
      <rect x="18" y="13" width="2.6" height="7" rx="0.6" className="fill-gl-text" />
    </svg>
  );
}
```

**Lockup:** `flex items-center gap-2.5` → `<Logo size={22} />` + wordmark `text-gl-text text-[17px] font-bold tracking-[-0.015em]` (nav). Use `size={20}` + `text-[15px]` in the sidebar and auth panel, `size={16}` + `text-[13px]` in mini window chrome.

---

## Icons

Custom stroke icons, **not** an icon library (except `Loader2` from lucide for spinners). This keeps stroke weight and corner style consistent.

### Spec

- `fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"`
- Colour always comes from `currentColor` — set it with `text-gl-*` on the icon or parent.
- `aria-hidden="true"` and `className={cn('shrink-0', className)}`
- Props: `{ size?: number; className?: string }`

### Factory

```tsx
import { cn } from '@/lib/utils';

interface IconProps { size?: number; className?: string }

function makeIcon(viewBox: number, strokeWidth: number, defaultSize: number, children: React.ReactNode) {
  return function Icon({ size = defaultSize, className }: IconProps) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${viewBox} ${viewBox}`} fill="none"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" className={cn('shrink-0', className)}>
        {children}
      </svg>
    );
  };
}
```

### Icon set

| Name | viewBox | stroke | default size | Paths |
|---|---|---|---|---|
| `IconArrow` | 14 | 1.8 | 14 | `<path d="M3 7h8M7 3l4 4-4 4"/>` |
| `IconArrowRight` | 12 | 1.8 | 12 | `<path d="M2.5 6H9M6 3l3 3-3 3"/>` |
| `IconCheck` | 14 | 2 | 14 | `<path d="M2.5 7.5l3 3 6-7"/>` |
| `IconPlus` | 14 | 2 | 14 | `<path d="M7 2v10M2 7h10"/>` |
| `IconChevronDown` | 12 | 1.8 | 12 | `<path d="M3 4.5l3 3 3-3"/>` |
| `IconMenu` | 20 | 1.8 | 20 | `<path d="M3 5h14M3 10h14M3 15h14"/>` |
| `IconClose` | 20 | 1.8 | 20 | `<path d="M5 5l10 10M15 5L5 15"/>` |
| `IconTrendUp` | 11 | 2 | 11 | `<path d="M5.5 9V2.5M2.5 5l3-3 3 3"/>` |
| `IconTrendDown` | 11 | 2 | 11 | `<path d="M5.5 2v6.5M2.5 6l3 3 3-3"/>` |
| `IconPen` | 22 | 1.6 | 22 | `<path d="M3 19l3.5-1 11-11a2 2 0 0 0-2.8-2.8l-11 11L3 19z"/><path d="M12.5 6.5l3 3"/>` |
| `IconFolder` | 22 | 1.6 | 22 | `<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h7a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 18H4.5A1.5 1.5 0 0 1 3 16.5v-10z"/>` |
| `IconChart` | 22 | 1.6 | 22 | `<path d="M3 17h16M6 17v-5M10 17V8M14 17v-7M18 17V5"/>` |
| `IconCalendar` | 22 | 1.6 | 22 | `<rect x="3" y="5" width="16" height="14" rx="2"/><path d="M3 9h16M7 3v4M15 3v4"/><circle cx="11" cy="13.5" r="1.3" fill="currentColor" stroke="none"/>` |
| `IconToday` | 22 | 1.6 | 18 | `<rect x="3" y="5" width="16" height="14" rx="2"/><path d="M3 9h16M7 3v4M15 3v4"/>` |
| `IconBook` | 22 | 1.6 | 22 | `<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10v15H5.5A1.5 1.5 0 0 1 4 16.5v-12z"/><path d="M18 4.5A1.5 1.5 0 0 0 16.5 3H12v15h4.5A1.5 1.5 0 0 0 18 16.5v-12z"/>` |
| `IconBriefcase` | 22 | 1.6 | 22 | `<rect x="3" y="7" width="16" height="11" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h3A1.5 1.5 0 0 1 14 5.5V7M3 12h16"/>` |
| `IconAll` (list) | 22 | 1.6 | 18 | `<path d="M3 5h16M3 11h16M3 17h16"/>` |
| `IconSettings` | 22 | 1.6 | 18 | `<circle cx="11" cy="11" r="3"/><path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.5 4.5l1.5 1.5M16 16l1.5 1.5M4.5 17.5L6 16M16 6l1.5-1.5"/>` |
| `IconMail` | 20 | 1.4 | 20 | `<rect x="2" y="4" width="16" height="13" rx="2"/><path d="m2 7 8 6 8-6"/>` |
| `IconEye` | 16 | 1.4 | 16 | `<path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/><circle cx="8" cy="8" r="2"/>` |
| `IconEyeOff` | 16 | 1.4 | 16 | `<path d="M2 2l12 12M6.5 6.56A2 2 0 0 0 9.44 9.5M5.27 5.27C3.3 6.28 2 8 2 8s2.5 5 6 5a6.4 6.4 0 0 0 2.73-.6M8 3c3.5 0 6 5 6 5a9.9 9.9 0 0 1-1.27 1.73"/>` |
| `IconTrash` | 14 | 1.6 | 14 | `<path d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M12 4l-.8 7a1 1 0 0 1-1 .9H3.8a1 1 0 0 1-1-.9L2 4"/>` |
| `IconEmptyList` | 36 | 1.4 | 36 | `<rect x="6" y="9" width="24" height="20" rx="2"/><path d="M6 15h24M12 22h6M12 25h12"/>` |
| `IconDots` | 16 | — | 16 | **fill** icon: `fill="currentColor"`, no stroke: `<circle cx="3.5" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="12.5" cy="8" r="1.4"/>` |

Stroke weight follows size: small inline glyphs (11–14 viewBox) use 1.8–2; 22-unit UI icons use 1.6; large/delicate icons use 1.4. Add new icons in the same style.

**Spinner:** `<Loader2 className="size-4 animate-spin" />` (lucide). Full-page: `size-8 text-gl-primary` centred in `min-h-screen`.

---

## Buttons

There are **three button families**. Use the right one for the context.

### 1. `GlButton` — tinted, for marketing and navigation CTAs

Soft, translucent fill. Used in the landing nav, hero, bottom CTA.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const glButtonVariants = cva(
  [
    'inline-flex items-center justify-center font-semibold whitespace-nowrap',
    'cursor-pointer select-none tracking-[-0.005em]',
    'transition-all duration-[120ms] ease-out',
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        primary: ['bg-gl-primary/[0.16] text-gl-primary', 'hover:bg-gl-primary/[0.24]'],
        secondary: ['bg-gl-text/[0.06] text-gl-text', 'hover:bg-gl-text/[0.10]'],
        ghost: ['bg-transparent text-gl-text-muted', 'hover:bg-gl-text/[0.05] hover:text-gl-text'],
      },
      size: {
        sm: 'gap-1.5 rounded-lg px-3 py-1.5 text-[13px]',
        md: 'gap-2 rounded-lg px-3.5 py-[9px] text-[14px]',
        lg: 'gap-2.5 rounded-[10px] px-[22px] py-[13px] text-[15px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface GlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glButtonVariants> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function GlButton({ className, variant, size, leading, trailing, children, ...props }: GlButtonProps) {
  return (
    <button className={cn(glButtonVariants({ variant, size }), className)} {...props}>
      {leading}{children}{trailing}
    </button>
  );
}
```

- Primary CTAs carry a trailing arrow: `trailing={<IconArrow />}` (size 13–14).
- Pair: primary "Start for free →" + secondary "See how it works".
- CTA rows: `flex flex-wrap items-center justify-center gap-3` (or `gap-4` in hero).

### 2. Solid primary — for form submits and wizard "Continue"

Full-weight, full-width inside form cards.

```
bg-gl-primary text-gl-primary-ink hover:bg-gl-primary-hover
inline-flex w-full cursor-pointer items-center justify-center gap-2
rounded-lg py-2.5 text-[14px] font-semibold           (wizard: py-3)
transition-colors focus-visible:ring-2 focus-visible:ring-gl-primary/40 focus-visible:outline-none
disabled:pointer-events-none disabled:opacity-50     (wizard: disabled:opacity-40)
```

Pending state swaps the label: `<Loader2 className="size-4 animate-spin" /> Creating account…` (use an ellipsis character `…`).

### 3. App action buttons — inside the product

| Variant | Classes | Use |
|---|---|---|
| **Outline accent** | `border border-gl-primary text-gl-primary hover:bg-gl-primary-soft rounded-[8px] px-3 py-[7px] text-[12.5px] font-semibold transition-colors duration-[120ms]` | "+ Add item" in section headers (sidebar version: full width, `rounded-[9px] py-2.5 text-[13.5px]`) |
| **Soft accent (save)** | `bg-gl-primary-soft text-gl-primary hover:bg-gl-primary-soft/80 rounded-[10px] px-[18px] py-[11px] text-[13.5px] font-semibold` | Save in sheets |
| **Soft danger** | `bg-gl-danger-soft text-gl-danger hover:bg-gl-danger-soft/80 rounded-[10px] px-4 py-[9px] text-[13.5px] font-semibold` | Destructive confirm |
| **Text cancel** | `text-gl-text-muted hover:text-gl-text rounded-[10px] px-4 py-[9px] text-[13.5px] font-semibold` | Cancel next to a confirm |
| **Neutral bordered** | `bg-gl-surface-2 border border-gl-border text-gl-text-muted hover:text-gl-text rounded-lg px-3.5 py-2.5 text-[13px] font-medium` | Inline "Add" next to an input |
| **Icon square** | `bg-gl-surface-2 text-gl-text-muted hover:text-gl-text inline-flex size-8 items-center justify-center rounded-lg` | Close button in sheet header |
| **Icon ghost** | `text-gl-text-muted inline-flex size-7 items-center justify-center rounded-[7px] hover:bg-gl-bg-subtle` (add `bg-gl-bg-subtle` when open) | Row "⋯" menu trigger |
| **Text link** | `text-gl-primary hover:text-gl-primary-hover inline-flex items-center gap-1.5 text-[12.5px] font-semibold` + `<IconArrowRight size={12}/>` | "View all →", "Add your first item →" |
| **Inline link** | `text-gl-primary font-medium hover:underline` | "Already have an account? **Log in**" |

All disabled buttons: `disabled:pointer-events-none disabled:opacity-50`.

**Never** use generic grey buttons for a primary action.

---

## Form fields

### Field wrapper

```tsx
function Field({ id, label, error, right, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-gl-text block text-[13px] font-medium">{label}</label>
        {right /* e.g. character counter or current value */}
      </div>
      {children}
      {error && <p role="alert" className="text-gl-danger text-[12px] leading-snug">{error}</p>}
    </div>
  );
}
```

Sheet variant: label `text-[12.5px] font-semibold`, label row `mb-2`, error `mt-1.5 text-[11.5px]`.

Right-slot counters: `font-mono text-[11px] text-gl-text-muted`, switching to `text-gl-danger` when near the limit (e.g. > 95%).

### Text input — inside a `gl-surface` card (auth, onboarding)

```ts
const inputCls = (hasError: boolean) => cn(
  'bg-gl-bg border-gl-border-input text-gl-text placeholder:text-gl-text-faint',
  'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
  'focus-visible:border-gl-primary focus-visible:ring-2 focus-visible:ring-gl-primary/15',
  hasError && 'border-gl-danger focus-visible:border-gl-danger focus-visible:ring-gl-danger/20',
);
```

Always set `aria-invalid={hasError}`.

### Text input — directly on a `gl-surface` panel (sheets)

```ts
cn(
  'border-gl-border-input bg-gl-surface text-gl-text placeholder:text-gl-text-faint',
  'w-full rounded-[10px] border px-3.5 py-3 text-[14px] outline-none transition-colors',
  'focus-visible:border-gl-primary',
  hasError && 'border-gl-danger',
)
```

Textarea: same classes + `resize-y leading-relaxed`, `rows={5}`.

### Password input

Text input with `pr-10` and an absolutely positioned toggle:
`absolute top-1/2 right-3 -translate-y-1/2 text-gl-text-faint hover:text-gl-text-muted transition-colors` containing `IconEye`/`IconEyeOff` at 15px, `tabIndex={-1}`, `aria-label` "Show password" / "Hide password".

### Range slider

`<input type="range" className="accent-gl-primary w-full" />` with a tick row below:
`text-gl-text-faint mt-1 flex justify-between font-mono text-[10.5px]` → `1 · 5 · 10`. Show the current value in the field's right slot as `font-mono text-[12px] text-gl-text-muted` "7 / 10".

### `GlSelect` — custom dropdown (replaces native `<select>`)

Trigger:
```
flex h-[42px] w-full items-center gap-2.5 rounded-[10px] border px-3 transition-colors
border-gl-border-input bg-gl-surface text-gl-text
+ open:  border-gl-primary
+ error: border-gl-danger
```
Contents: optional `leading` (e.g. a `size-2.5 rounded-full` colour dot) · label `flex-1 truncate text-left text-[14px]` (placeholder in `text-gl-text-faint`) · `IconChevronDown size={12}` `text-gl-text-muted transition-transform duration-150`, `rotate-180` when open.

Listbox:
```
absolute right-0 left-0 z-10 mt-1.5 max-h-52 overflow-y-auto rounded-[10px] border py-1
border-gl-border bg-gl-surface shadow-gl-lg
```
Option `flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-[14px]`:
- selected: `bg-gl-primary-soft/30 text-gl-primary` + trailing `IconCheck size={12}`
- disabled: `text-gl-text-faint cursor-not-allowed`
- default: `text-gl-text hover:bg-gl-surface-2`

Behaviour: `aria-haspopup="listbox"`, `aria-expanded`, `role="listbox"` / `role="option"` / `aria-selected`; closes on outside `mousedown` and `Escape`.

### Segmented control

Used for binary type pickers, period pickers and list filters.

```
Well:    inline-flex items-center gap-1 rounded-[9px] border border-gl-border bg-gl-bg-subtle p-1
Segment: rounded-[7px] px-3 py-[7px] text-[12.5px] font-medium whitespace-nowrap transition-colors duration-[120ms]
  active:   bg-gl-primary text-gl-primary-ink font-semibold
  inactive: text-gl-text-muted hover:text-gl-text
```

Form-field variant (lifted segment instead of solid accent):
```
Well:    inline-flex rounded-[10px] border border-gl-border bg-gl-bg-subtle p-1
Segment: rounded-[7px] px-4 py-2 text-[13px] font-medium border
  active:   border-gl-border bg-gl-surface text-gl-text shadow-gl
  inactive: border-transparent text-gl-text-muted
```

Mobile size: `px-2.5 py-[5px] text-[11.5px]`.

### Suggestion chips (multi-select tags)

```
inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-150
focus-visible:ring-2 focus-visible:ring-gl-primary/30 focus-visible:outline-none
  added:   bg-gl-primary text-gl-primary-ink border-transparent cursor-default  (+ IconCheck size 9)
  default: border-gl-border bg-gl-surface text-gl-text-muted hover:border-gl-primary/40 hover:text-gl-text hover:bg-gl-surface-2
  at limit (not added): opacity-40
```
Leading colour dot `size-2 rounded-full`. Use `aria-pressed`.

---

## Badges, pills and chips

| Component | Classes |
|---|---|
| **Type badge** (solid) | `inline-flex items-center rounded-full px-2.5 py-1 text-[11px] leading-none font-semibold tracking-[0.01em] whitespace-nowrap` + `bg-gl-work text-gl-work-ink` **or** `bg-gl-learn text-gl-learn-ink` |
| **Type badge** (soft, previews) | `rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold` + `bg-gl-work-bg text-gl-work` / `bg-gl-learn-bg text-gl-learn` |
| **Threshold pill** | `inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[12px] leading-none font-semibold whitespace-nowrap tabular-nums` + threshold colour (see Foundations). Content: `<span class="font-normal opacity-60">score</span> 8 / 10` |
| **Accent metric pill** (previews) | `bg-gl-primary-soft text-gl-primary inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[12px] font-semibold tabular-nums` with `<span class="text-gl-primary/60 font-normal">score</span>` |
| **Category chip** | `border border-gl-border bg-gl-surface-2 text-gl-text inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap` → dot `size-[7px] rounded-full` · name · `text-gl-text-faint mx-0.5` "/" · child name in `text-gl-text-muted` |
| **Sub-tag** | `border border-gl-border bg-gl-surface text-gl-text-muted rounded-full px-2 py-0.5 text-[11px] font-medium` |
| **Momentum badge** | `bg-gl-warning-soft text-gl-warning inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5` → `IconTrendUp size={12}` · value `font-mono text-[15px] font-bold tabular-nums` · label `text-gl-warning/75 text-[11px] font-semibold` |
| **Announcement pill** | Outer `border border-gl-border bg-gl-surface text-gl-text-muted inline-flex items-center gap-2 rounded-full px-3 py-1 pr-3.5 text-[12px] font-medium` → inner label `bg-gl-primary-soft text-gl-primary rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] uppercase` ("New", "Free") → text in `text-gl-text` → `IconArrow size={12}` |
| **Status pill** (wizard) | `border border-gl-border bg-gl-surface inline-flex items-center gap-2 rounded-full px-3 py-1` → `size-1.5 rounded-full bg-gl-primary` dot → `text-gl-text-muted text-[11px] font-medium` |
| **Stat pill** | `border border-gl-border bg-gl-surface-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5` → value `font-mono text-[15px] font-bold tabular-nums text-gl-primary` (or warning/learn) · label `text-gl-text-muted text-[12px]` |
| **Check bullet** | `bg-gl-primary-soft text-gl-primary inline-flex size-[18px] shrink-0 items-center justify-center rounded-full` + `IconCheck size={10–11}`. Solid variant: `bg-gl-primary text-gl-primary-ink` |
| **Trend chip** | `inline-flex size-4 items-center justify-center rounded` + `bg-gl-primary-soft text-gl-primary` (up) or `bg-gl-danger-soft text-gl-danger` (down), with `IconTrendUp/Down size={11}` |
| **Keyboard hint** | `<kbd class="text-gl-text-faint font-mono text-[11px] font-medium">↵ enter</kbd>` |
| **Avatar initials** | `bg-gl-primary text-gl-primary-ink inline-flex size-[30px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold` (testimonials: `size-[38px]`, swatch background, `color: #0C1A14`) |

### Eyebrow

```tsx
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-gl-text-muted text-[11px] font-bold tracking-[0.12em] uppercase', className)}>
      {children}
    </p>
  );
}
```
Above stats and inside widgets use `text-gl-text-faint text-[10px]`.

---

## Cards

| Card | Classes |
|---|---|
| **Base card** | `border border-gl-border bg-gl-surface shadow-gl rounded-xl p-5` |
| **Form card** | `border border-gl-border bg-gl-surface shadow-gl rounded-2xl p-6 space-y-4` |
| **Feature / problem card** | `border border-gl-border bg-gl-surface shadow-gl hover:shadow-gl-lg rounded-2xl p-7 flex flex-col transition-all duration-[150ms] hover:-translate-y-0.5` |
| **Hero object card** | `border border-gl-border bg-gl-surface shadow-gl-lg rounded-2xl p-7 min-h-[280px] flex flex-col hover:-translate-y-0.5 transition-all duration-[150ms]` |
| **Nested card** | `border border-gl-border bg-gl-surface-2 rounded-xl p-3.5` (or `p-3`, `p-4`) |
| **Showcase panel** | `border border-gl-border-strong bg-gl-surface shadow-gl-hard overflow-hidden rounded-2xl` |
| **List card** | `border border-gl-border bg-gl-surface shadow-gl rounded-xl` with header `border-b border-gl-border px-[22px] py-[18px]` and rows separated by `border-b border-gl-border` (none on last) |
| **Dashed placeholder** | `border border-dashed border-gl-border rounded-xl min-h-[80px] flex items-center justify-center` + `text-gl-text-faint text-[13px]` |
| **CTA container** | `border border-gl-border bg-gl-surface relative overflow-hidden rounded-3xl px-6 py-16 sm:px-10 sm:py-20 text-center` + radial halo layer (see `04`) |

### Icon tile (top of feature cards)

`inline-flex size-11 items-center justify-center rounded-xl mb-[22px]` + tone pair, e.g. `bg-gl-warning-soft text-gl-warning`, icon size 22. Smaller: `size-10`, icon 18.

Rotate tones across a row of three: warning → type-B (learn) → danger, or primary → warning → learn.

### Card anatomy for a "hero object"

The pattern for your product's most important object (in the reference, a log entry):

```
┌─────────────────────────────────────────────┐
│ 14 MAY · TODAY (mono, faint, uppercase)  [score 8 / 10] │   header row: justify-between
│ [Type badge] [● Category / Sub]              │   meta chips: flex-wrap gap-2
│ Title in 22px bold, tracking -0.018em        │   min-h reserves 2 lines
│ Body in 14.5px italic muted, leading 1.65▍   │   blinking caret in previews
│─────────────────────────────────────────────│   border-t border-gl-border pt-3
│ ✓ Saved · just now (primary)      ↵ enter   │   footer
└─────────────────────────────────────────────┘
```

### Stat card

```tsx
<div className="border border-gl-border bg-gl-surface shadow-gl rounded-xl p-5">
  <p className="text-gl-text-faint text-[11px] font-bold tracking-[0.12em] uppercase">{label}</p>
  <div className="text-gl-text mt-3 mb-1.5 flex items-baseline gap-1 text-[42px] leading-none font-bold tracking-[-0.03em] tabular-nums">
    {value}
    {suffix && <span className="text-gl-text-muted text-[18px] font-semibold">{suffix}</span>}
  </div>
  {/* either a trend row */}
  <div className="text-gl-text-muted inline-flex items-center gap-1.5 text-[12px]">
    <TrendChip up /> 3 more than last week
  </div>
  {/* or a sub line: text-[12px] leading-snug text-gl-text-muted (or text-gl-primary for positive) */}
</div>
```

Stats row: `grid grid-cols-2 gap-3.5 lg:grid-cols-5`; a wide card uses `col-span-2 lg:col-span-1`.

### Split stat card (two-part ratio)

Eyebrow → two big numbers left/right (`font-mono text-[24px] font-bold tabular-nums`, coloured `text-gl-work` / `text-gl-learn`, label below `text-[11px] text-gl-text-muted`) → combined bar:
`bg-gl-bg-subtle mt-2 flex h-2.5 overflow-hidden rounded-full` containing two segments `bg-gl-work` (opacity .85) and `bg-gl-learn` (opacity .95) with percentage widths.

---

## Section header (inside the app)

Accent bar · title · extending rule · optional right slot.

```tsx
<div className="mb-6 flex items-center gap-4">
  <div className="flex shrink-0 items-center gap-2.5">
    <div className="bg-gl-primary h-[18px] w-[3px] rounded-full" />
    <h2 className="text-gl-text text-[15px] font-bold tracking-[-0.015em]">{title}</h2>
  </div>
  <div className="border-gl-border min-w-0 flex-1 border-t" />
  {right /* segmented control or outline action button */}
</div>
```

---

## Overlays

### Dialog (confirmation)

```
Backdrop: fixed inset-0 z-[70] bg-gl-bg/60   (click closes)
Panel:    fixed top-1/2 left-1/2 z-[80] w-[400px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2
          rounded-[14px] border border-gl-border bg-gl-surface shadow-gl-lg p-6
Title:    text-gl-text text-[16px] font-bold tracking-[-0.015em]
Body:     text-gl-text-muted mt-2 text-[13.5px] leading-relaxed
Actions:  mt-5 flex justify-end gap-2.5  → Text cancel + Soft danger (or Soft accent)
```
`role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` → title; `Escape` closes.

### Slide-over sheet (create / edit)

```
Backdrop: fixed inset-0 z-50 bg-gl-bg/45 transition-opacity duration-[250ms]  (opacity-0 pointer-events-none when closed)
Panel:    fixed inset-y-0 right-0 z-60 flex w-[480px] max-w-full flex-col
          border-l border-gl-border bg-gl-surface shadow-gl-lg
          transition-transform duration-[280ms] ease-out  translate-x-0 | translate-x-full
Header:   flex items-center justify-between border-b border-gl-border px-6 py-5
          title text-[18px] font-bold tracking-[-0.018em] · subtitle (today's date) text-gl-text-muted mt-1 text-[12.5px]
          close = Icon square button
Body:     flex flex-1 flex-col overflow-y-auto → <form className="flex flex-col gap-[22px] p-6">
Footer:   flex justify-end gap-2.5 border-t border-gl-border px-6 py-4 → Text cancel + Soft accent save
```
Lock body scroll while open; `Escape` closes; submit button uses `form="form-id"` so it can live in the footer. Keep the scroll container **outside** the `<form>` so dropdowns are not clipped.

### Dropdown menu (row actions)

```
Panel: absolute top-full right-0 z-20 mt-1 min-w-[140px] rounded-[9px] border border-gl-border bg-gl-surface shadow-gl p-1
Item:  flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-left text-[13px] font-medium transition-colors hover:bg-gl-bg-subtle
       text-gl-text  (destructive: text-gl-danger), leading icon size 13
```

### Tooltip (charts)

`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-gl-border bg-gl-surface shadow-gl-lg px-3 py-2.5` → title `text-[12px] font-semibold text-gl-text` · summary `text-[12px] text-gl-text-muted mb-2` · legend rows `text-[11px]` with `size-[7px] rounded-[1px]` colour squares. `role="tooltip"`.

### Toasts

`<Toaster position="bottom-right" richColors />` from sonner. Every mutation shows `toast.success('Item deleted')` / `toast.error(message)`. Never show raw error objects.

---

## Lists and rows

### Data row (desktop)

`flex items-center gap-4 px-[22px] py-3.5` inside a row wrapper `group cursor-pointer transition-colors hover:bg-gl-surface-2 border-b border-gl-border`:

1. **Date block** `w-11 shrink-0 text-center` → day `text-[17px] font-bold tracking-[-0.015em] leading-none` · month `mt-[3px] font-mono text-[10px] tracking-[0.06em] uppercase text-gl-text-faint`
2. **Type badge** in a fixed `w-[76px]` column
3. **Content** `min-w-0 flex-1` → meta line (dot + name `text-[13px] font-semibold` + "/" + child `text-[12px] text-gl-text-muted`) · body `text-[13px] leading-[1.5] italic text-gl-text-muted truncate` (remove `truncate` when expanded)
4. **Metric pill**
5. **⋯ menu**

### Data row (mobile)

Stack instead of columns: `flex flex-col gap-2 px-4 py-3.5 sm:hidden` → top row badge ↔ pill + menu · meta line · body with `line-clamp-2`.

### Sidebar list item

`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] text-gl-text-muted hover:text-gl-text transition-colors` → dot `size-2` · name `flex-1 truncate` · count `font-mono text-[11px] text-gl-text-faint`.

### Ranked bar list

Rank `w-4 text-right font-mono text-[11px] text-gl-text-faint` · name row (dot + `text-[13.5px] font-semibold`, count `font-mono text-[13px] font-semibold`) · track `bg-gl-bg-subtle h-2.5 rounded-full` with a proportional fill · meta `mt-1.5 font-mono text-[11px] text-gl-text-faint` justify-between. Rows `flex flex-col gap-5`.

---

## States

### Loading — pulse skeletons

Mirror the real layout with blocks: `bg-gl-border/50 animate-pulse rounded` (sidebar: `bg-gl-border/40 h-[28px] rounded-lg`). Match exact paddings and column widths of the real row so nothing shifts when data arrives. While refetching existing data, dim instead of skeletoning: `transition-opacity duration-200 opacity-60`.

### Error — inline with retry

```tsx
<div className="border border-gl-border bg-gl-surface shadow-gl mb-4 flex items-center justify-between rounded-xl p-5">
  <p className="text-gl-text-muted text-[13px]">Failed to load stats.</p>
  <button className="text-gl-primary hover:text-gl-primary-hover text-[13px] font-semibold underline-offset-2 hover:underline">Retry</button>
</div>
```

### Empty — centred invitation

```tsx
<div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
  <IconEmptyList size={36} className="text-gl-text-faint" />
  <div className="text-gl-text mt-1 text-[18px] font-bold tracking-[-0.015em]">No items yet</div>
  <p className="text-gl-text-muted max-w-[320px] text-[14px] leading-relaxed">Your items will appear here once you add some.</p>
  <button className="text-gl-primary hover:text-gl-primary-hover mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold">
    Add your first item <IconArrowRight size={12} />
  </button>
</div>
```

Filtered-to-nothing: `px-6 py-10 text-center text-[13px] leading-relaxed text-gl-text-muted` "No {filter} items in this period."

### Progress step bar (wizards)

```tsx
<div className="mb-8 flex items-center gap-3">
  <div className="flex gap-1.5">
    {steps.map((_, i) => (
      <div key={i} className={cn('h-1 rounded-full transition-all duration-500', i + 1 <= current ? 'bg-gl-primary w-6' : 'bg-gl-border w-3')} />
    ))}
  </div>
  <span className="text-gl-text-faint text-[11.5px]">
    <span className="text-gl-text-muted font-semibold">{label}</span>
    <span className="font-medium"> · {current} / {total}</span>
  </span>
</div>
```

### Carousel dots (mobile)

`h-1.5 rounded-full transition-all duration-300` · active `bg-gl-primary w-5` · inactive `bg-gl-border hover:bg-gl-text-faint w-1.5`. `role="tab"` + `aria-selected`.

---

## Accessibility baseline

- Semantic elements (`nav`, `main`, `section`, `figure`/`blockquote`, `button` — never clickable `div`s for primary actions).
- Focus: global `:focus-visible` outline in `gl-primary`; links/buttons may add `focus-visible:ring-2 focus-visible:ring-gl-primary`.
- Every input has a `<label>`; errors use `role="alert"`.
- Colour is never the only signal — type badges carry text, pills carry numbers, trends carry arrows.
- Decorative SVGs, glows and floating fragments: `aria-hidden="true"` and `pointer-events-none`.
