---
target: the home page
total_score: 22
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 3
target_identity: "file:/Users/thiranaembuldeniya/Documents/Personals/drydock/src/app/page.tsx"
target_fingerprint: "sha256:a95dd164b7669f3de052ee2b1e0379a296803693d545b9145d2257750bd0f2c3"
target_path: /Users/thiranaembuldeniya/Documents/Personals/drydock/src/app/page.tsx
timestamp: 2026-09-13T12-27-20Z
slug: src-app-page-tsx
closed: true
---
Method: dual-agent (A: isolated design-review agent · B: isolated detector/evidence agent)
Note: no rendered-browser inspection; Chrome absent and headless Brave hung / had no display. Source + curl'd SSR HTML only. No in-page detector overlay.

# Critique: Home page (src/app/page.tsx)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Hero current-phase name in faint sage (hero-map.tsx:94); spotlight cycles with no position indicator |
| 2 | Match System / Real World | 3 | "Free and fully static" is dev jargon; "6 phases" next to a 7-step rail (0–6) |
| 3 | User Control and Freedom | 2 | Spotlight types and cycles forever, no pause (spotlight-card.tsx:23-48, WCAG 2.2.2); no header nav below md |
| 4 | Consistency and Standards | 2 | One destination, five labels; teal used for closed states where DESIGN.md says sage |
| 5 | Error Prevention | 3 | featured undefined → hero + header links to #how-it-works, which isn't rendered |
| 6 | Recognition Rather Than Recall | 3 | Phase rail shows bare numbers below lg (hero-map.tsx:150) |
| 7 | Flexibility and Efficiency | n/a | Single-scroll marketing page; tour tabs already keyboard-navigable |
| 8 | Aesthetic and Minimalist Design | 2 | Three competing motion loops; "order matters" argued three times |
| 9 | Error Recovery | 2 | FadeIn SSRs opacity:0 (fade-in.tsx:22); no-JS = blank below hero |
| 10 | Help and Documentation | 2 | No prerequisites, author, or start-here guidance |
| **Total** | | **22/36** | **Acceptable (61%)** |

## Design Specificity Verdict

LLM: content specific, skeleton interchangeable (announcement pill, gradient-word H1, two CTAs, three trust checks, product shot, three icon-tile cards, tab tour, numbered steps, card grid, glowing CTA box). Identical centred section intros flatten hierarchy. Specific: hero map 17 open → all closed; model-cropped problem previews; register-fed spotlight. Missed: page not ordered as the remediation sequence; Diagram Frame / Command Block signatures unused; no first-person voice; healthy end-state map buried at 30% opacity.

Detector: 34 findings. gradient-text ×1 (page.tsx:109, real, agrees with LLM). design-system-color ×5: two #000 mask stops (page.tsx:37, hero-map.tsx:22) false positive; three rgba(111,200,160,…) halos undocumented as tokens. design-system-font-size ×28: mostly responsive steps (false positives); real drift = 9.5/10px labels in 7 places below 11px label role; button 14px vs DESIGN.md frontmatter's 15px body mapping (DESIGN.md imprecise). Contrast: faint sage 3.12:1 on bg, 2.89:1 on surface (fails large text); step numerals 1.24:1.

## Overall Impression

The hero map makes "the order is the argument" something you watch. Everything around it is a well-built template that could sell any dev tool. Biggest opportunity: make the page itself enact the sequence, in a voice that clearly belongs to someone.

## What's Working

1. Hero map: real phase scrubber, callouts flip to "closed in phase N", pause control, reduced-motion aware (hero-map.tsx:54-57,102).
2. Every number and preview derived from the model (featured.ts); nothing invented; optional previews degrade cleanly.
3. Headline copy and TrackTour tab a11y (roving tabindex, aria-controls, arrow keys).

## Priority Issues

[P1] Gradient text + double emphasis in H1 (page.tsx:109-119). Breaks Solid Emphasis Rule; flagged by both LLM and detector. Fix: "Broken" in chalk ink, solid teal only on "order". Command: /impeccable typeset

[P1] No author, no opinion; reads as template. Half the audience evaluates the author; PRODUCT.md commits to first-person opinionated voice. Fix: first-person line linking to About push-back instead of trust checks; hero map in Diagram Frame; fold one-card Labs grid into closing CTA; consider page ordered as the fix sequence. Command: /impeccable shape

[P1] Counts and claims contradict. "6 phases" vs 7-step rail; "explored 6 ways" vs 7 views; 17 defects vs About "Fifteen problems" (about.mdx:72); "New lab"/"Explore cloud platforms" imply multiple labs. Fix: reconcile About count, "6 remediation phases", drop "New" and plural, one label per destination. Command: /impeccable clarify

[P2] Colour semantics drift. Closed/passing in teal (hero-map.tsx:220,260,268; track-tour.tsx:247; spotlight-card.tsx:101); teal as category dot (page.tsx:295) and decorative tile (page.tsx:385); rust "High risk" on a phase (page.tsx:331). Fix: sage for closed/passing, ochre for risk, neutral category dots. Command: /impeccable colorize

[P2] Readability and robustness. Faint sage (2.89–3.12:1) on must-read labels (hero-map.tsx:94,146; track-tour.tsx:357; spotlight-card.tsx:61; page.tsx:292,412); 9.5–10px labels; spotlight auto-advance without pause; FadeIn invisible without JS. Fix: weathered sage, ≥11px, pause/stop on hover+focus, visible by default and hide only after hydration. Command: /impeccable harden

## Persona Red Flags

Jordan: no explanation of phase rail or assumed GCP knowledge; five differently named CTAs to one place; "fully static" meaningless.
Riley: no-JS blank below hero; featured undefined → dead #how-it-works links; IP plan/About tour tabs show placeholder (track-tour.tsx:375); footer year frozen at build (site-footer.tsx:44).
Casey: no header nav below md (site-header.tsx:35); hero map cropped without callouts below lg; seven ~30px phase buttons; tour tabs hidden-scrollbar horizontal scroll; 168px bypass preview unreadable.
Hiring manager (90s): polished but template-like; no name, links, or "I"; opinions buried in About.

## Minor Observations

- rounded-xl = 24px turns 40–44px icon tiles into near-circles (page.tsx:71); 24px wells inside 16px cards (page.tsx:229, spotlight-card.tsx:82,90, track-tour.tsx:78,278).
- Lab card track chips on same surface as card (lab-card.tsx:34), One Rung violation.
- Spotlight is a typewriter card, contradicting DESIGN.md's last Don't; doc or component is wrong. Typed symptom italic.
- "Find it" preview is a 10.5px muted pre (page.tsx:389), not a Command Block.
- Hero pill count (page.tsx:100) and "closed in phase N" (hero-map.tsx:276) not mono.
- Hero renders desktop + mobile ArchitectureDiagram together (hero-map.tsx:161-177); five full SVG diagrams on page.
- "01/02/03" numerals at 1.24:1 (page.tsx:457) are template decoration.
- Halo glow colours hardcoded rgba, not documented.

## Questions to Consider

- If the order of the fixes is the argument, why doesn't the page scroll as the fix sequence?
- What would the page lose by saying "I" once above the fold?
- With one lab, do a "Labs" grid and a "New lab" pill tell the truth?
