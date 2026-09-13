# 04 — Motion and Graphics

Animation vocabulary, reusable motion hooks, and the decorative graphic techniques that give the product its atmosphere. All keyframes and `animate-*` utilities are defined in `theme.css`.

---

## Motion principles

| Rule | Value |
|---|---|
| Distance | Small: 8–12px for UI, 22–24px for headlines and scroll reveals |
| Micro-interactions | 120–150ms, `ease-out` |
| Panel transitions | 250–300ms |
| Content swaps | 260–600ms fade out → swap → fade in |
| Ambient loops | 5–6.5s per cycle; never faster |
| Entrance curve | `cubic-bezier(0.22, 1, 0.36, 1)` (fast start, soft landing) |
| Pop curve | `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot) — use sparingly |
| Bar-fill curve | `cubic-bezier(0.34, 1.2, 0.64, 1)` (gentle overshoot) |
| Reduced motion | Honour `prefers-reduced-motion` (handled globally in `theme.css`) |

**Never animate layout-affecting properties on loops.** Animate `opacity`, `transform`, `stroke-dashoffset`, and bar `width` only. Reserve space (`min-h-*`, stacked grid cells) so changing content never shifts the page.

---

## Animation utilities

| Utility | Animation | Use |
|---|---|---|
| `animate-fade-up` | 12px lift + fade, 0.4s ease | Small elements entering |
| `animate-fade-up-lg` | 22px lift + fade, 1s entrance curve | Headline lines |
| `animate-fade-in` | Fade, 0.25s | Overlays, backdrops |
| `animate-slide-in-right` | From `translateX(100%)`, 0.28s | Sheets (alternative to transition classes) |
| `animate-scale-in` | From `scale(.78)` + fade, 0.55s pop curve | One emphasised word in the H1 |
| `animate-glow-pulse` | Teal ring pulse, 2.8s infinite | A single "live" number (e.g. streak) |
| `animate-arc-draw` | Stroke draw on a 270° arc, 1.1s | First paint of an arc gauge |
| `animate-expand-x` | `scaleX(0 → 1)` from left, 0.65s | Progress bars on first paint |
| `animate-tab-progress` | `scaleX(0 → 1)` over 5s linear | Auto-advance indicator under active tab |
| `animate-cursor-blink` | 1s `steps(2)` blink | Typing caret |
| `animation-delay-100` … `-800` | Delays in 100ms steps | Staggering |

`tw-animate-css` also provides `animate-in fade-in-0 slide-in-from-bottom-1/2 duration-200/300` — used for list items appearing and wizard step changes (combine with `key={step}` to replay).

### Hover and press

| Element | Effect |
|---|---|
| Cards that invite interaction | `hover:-translate-y-0.5 hover:shadow-gl-lg transition-all duration-[150ms]` |
| Testimonials | `transition-transform duration-200 hover:-translate-y-0.5` |
| `GlButton` | `active:scale-[0.97]`, background alpha step on hover, 120ms |
| Rows | `hover:bg-gl-surface-2 transition-colors` |
| Links / nav | colour change only, 150ms |
| Chevrons | `rotate-180`, 150ms (select) / 300ms (FAQ) |

---

## Headline reveal (three beats)

```tsx
<h1 className="... text-[52px] sm:text-[64px] lg:text-[78px] leading-[1.02] tracking-[-0.035em] font-bold">
  <span className="animate-fade-up-lg inline-block">
    <span className="bg-gradient-to-r from-[#2EB8A0] to-[#7DDFD0] bg-clip-text text-transparent">Opening phrase</span>{' '}
    word
  </span>
  <br />
  <span className="animate-fade-up-lg animation-delay-500 inline-block">
    second line ending in{' '}
    <span className="text-gl-primary animate-scale-in animation-delay-800">keyword</span>.
  </span>
</h1>
```

Beat 1 (0ms): line one rises. Beat 2 (500ms): line two rises. Beat 3 (800ms): the keyword pops.

---

## Scroll reveal — `FadeIn`

Wrap each section header and each section body. Stagger the body by 130ms after the header.

```tsx
// hooks/use-in-view.ts
import { useEffect, useRef, useState } from 'react';

// Fires once when the element is 80px inside the viewport, so the animation
// starts when the element is meaningfully visible, not barely peeking in.
export function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView] as const;
}
```

```tsx
// components/common/fade-in.tsx
'use client';
import { useInView } from '@/hooks/use-in-view';

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0px)' : 'translateY(24px)',
        transition: `opacity 560ms ease-out ${delay}ms, transform 560ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
```

Usage: `<FadeIn>{header}</FadeIn><FadeIn delay={130}>{content}</FadeIn>`.

---

## Fade cycle — rotating widget values

Makes static marketing widgets feel alive. The value only changes while invisible.

```ts
// hooks/use-hero-cycle.ts
import { useEffect, useRef, useState } from 'react';

export function useFadeCycle<T>(items: readonly T[], displayMs: number, fadeMs: number) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimer.current = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, fadeMs);
    }, displayMs);
    return () => {
      clearInterval(interval);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [items.length, displayMs, fadeMs]);

  return { current: items[index], visible };
}
```

Apply with `className="transition-opacity duration-[500ms]" style={{ opacity: visible ? 1 : 0 }}` on the **number only**. Let bars and arcs transition continuously to the new value via CSS (`width 1.4s cubic-bezier(0.34,1.2,0.64,1)`, `stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)`).

Use **different, non-multiple intervals** per widget (e.g. 5500 / 6000 / 6500ms) so they never change in unison.

---

## Typewriter — hero object card

```ts
export function useTypewriter(text: string, charDelayMs = 16): string {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, charDelayMs);
    return () => clearInterval(timer);
  }, [text, charDelayMs]);
  return displayed;
}
```

Hero card phase machine: **typing** (`body.length × 24ms + 80ms`) → **reading** (hold 3500ms) → **fading** (600ms opacity out) → advance to next sample and back to typing. The header, chips, title and body fade together; the card footer ("✓ Saved · just now") stays visible. Reserve height with `min-h-[58px]` on the title and `min-h-[72px]` on the body.

Caret after the text:

```tsx
<span className="bg-gl-primary animate-cursor-blink ml-0.5 inline-block h-[13px] w-px translate-y-[2px]" aria-hidden="true" />
```

---

## Auto-advancing tabs

- Active index drives a `setTimeout(5000)` keyed on the index — clicking restarts it.
- Separate `active` (pill highlight) from `displayed` (rendered panel) so the old panel fades out (260ms) before the new one fades in.
- Progress bar under the active pill uses `animate-tab-progress` (5s, same as the interval). Remount it on change so it restarts.

---

## Ambient glows

Radial gradients on a `pointer-events-none absolute` layer behind content (`z-0`, content `relative z-10`). Always `aria-hidden="true"`.

| Where | Gradient |
|---|---|
| Landing hero halo (full width, 1100px tall) | `radial-gradient(70% 45% at 50% 0%, rgba(111,200,160,.16) 0%, transparent 65%)`, `radial-gradient(45% 35% at 50% 25%, rgba(242,234,211,.04) 0%, transparent 80%)`, `linear-gradient(to bottom, transparent 55%, var(--gl-bg) 100%)` |
| Bottom CTA card | `radial-gradient(55% 70% at 50% 0%, rgba(111,200,160,.13) 0%, transparent 70%)`, `radial-gradient(40% 50% at 50% 100%, rgba(111,200,160,.07) 0%, transparent 70%)` |
| Brand side panel corner orb | 560×560 `rounded-full` at `-top-40 -left-40`: `radial-gradient(circle, rgba(46,184,160,.09) 0%, transparent 65%)` |
| Behind a form | `radial-gradient(ellipse 70% 55% at 50% 40%, rgba(46,184,160,.04), transparent)` |

**Rule:** glows sit at the top or corner of a region, fade to transparent well before the edges, and never exceed 16% opacity. The last layer of a page-level halo fades back into `--gl-bg` so there's no visible seam.

### Edge fades

- Horizontal scroller hint: `pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gl-bg to-transparent sm:hidden`.
- Connector lines: `linear-gradient(to right, transparent, var(--gl-border) 12%, var(--gl-border) 88%, transparent)`.

---

## Product-preview graphics

The core graphic language. Instead of illustrations, render **small, static, real-looking pieces of the product**.

### Rules

1. Build previews from the same tokens and component recipes as the real UI — they must look like screenshots, not drawings.
2. Use realistic, specific sample content (dates, numbers, short sentences), not lorem ipsum.
3. Scale down: previews use the smaller ends of the type scale (`text-[9px]`–`[14px]`) and `p-3.5`–`p-5`.
4. Keep them non-interactive; decorative copies get `aria-hidden="true"`.
5. Never fetch data for a preview.

### Where each preview appears

| Location | Preview |
|---|---|
| Hero bento | Hero object card (typewriter), momentum number, arc gauge, split bars, ranked category bars |
| Feature tabs | One preview per capability: object card, grouped list of nested cards, analytics card (stat trio + SVG area chart + split bars) |
| How it works | Mini list, mini object, stat trio + ramping bars, each between `border-y` rules inside the step card |
| Live preview | Full dashboard rendered with the real presentational components and fixed data |
| Auth brand panel | Mini hero object card (`rounded-xl p-5 shadow-gl`) |
| Onboarding brand panel | Step-specific widget stacks (groups, sub-tags with tinted chips, mini dashboard) |
| Bottom CTA | Stat pills |

### Inline SVG area chart (preview)

```tsx
const data = [22, 38, 30, 52, 44, 64, 58, 78];
const max = 80, w = 400, h = 88;
const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - (v / max) * h]);
const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const area = `${line} L${w},${h} L0,${h} Z`;

<svg viewBox={`0 0 ${w} ${h}`} className="block h-[88px] w-full" preserveAspectRatio="none" aria-hidden="true">
  <path d={area} fill="var(--gl-primary)" opacity="0.12" />
  <path d={line} fill="none" stroke="var(--gl-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 0} fill="var(--gl-primary)" />)}
</svg>
```

Header above it: label `text-[11px] font-medium text-gl-text-muted` ↔ change `font-mono text-[11px] font-semibold text-gl-primary` "↗ +28%".

---

## Floating fragments (auth form background)

Behind the auth form on large screens, scatter ~20 tiny pieces of product UI at **30% opacity** with slight rotations. This fills the empty dark space with brand texture without competing with the form.

```tsx
<div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" style={{ opacity: 0.3 }} aria-hidden="true">
  <div className="absolute top-[6%] left-[4%] -rotate-2">
    <div className="border-gl-border bg-gl-surface shadow-gl w-[160px] rounded-xl border p-4">
      <p className="text-gl-text-faint text-[9px] font-bold tracking-[0.13em] uppercase">Current streak</p>
      <p className="text-gl-warning mt-1 text-[36px] leading-none font-bold tabular-nums">12</p>
      <p className="text-gl-warning mt-0.5 text-[11px] font-semibold">day streak</p>
    </div>
  </div>
  <div className="absolute top-[10%] right-[5%] rotate-2">
    <span className="bg-gl-primary-soft text-gl-primary rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold">9 / 10</span>
  </div>
  {/* …more fragments… */}
</div>
```

### Composition guide

- **Mix sizes:** 5–7 mini cards (150–205px wide: stat, split, object, weekly bars) plus 10–14 loose chips (type badges, metric pills, category chips, mono date stamps, "Saved · just now").
- **Keep the centre clear:** fragments hug the left and right edges (`left-[3–6%]`, `right-[3–5%]`) plus a top-centre and bottom-centre card (`left-1/2 -translate-x-1/2`). The form column (`max-w-md`) sits in the empty middle.
- **Rotations** between `-rotate-2` and `rotate-3`, alternating direction between neighbours.
- **Positions in percentages** so the arrangement scales with the viewport.
- Only on `lg+`; the mobile form stays clean.

---

## Showcase accents

- **Hard shadow panel** (`border-gl-border-strong shadow-gl-hard`) — one per page, around the most important product showcase. The off-white offset shadow is the brand's signature detail against the soft dark UI.
- **Giant faint numerals** (`font-mono text-[28px] font-bold text-gl-border`) for step numbers — they read as texture, not content.
- **Accent bar** (`h-[18px] w-[3px] rounded-full bg-gl-primary`) before in-app section titles.
- **Left accent rule** (`border-l-2 border-gl-primary pl-4`) on revealed answers and callouts.
