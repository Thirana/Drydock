---
target: the home page
total_score: 25
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
target_identity: "file:/Users/thiranaembuldeniya/Documents/Personals/drydock/src/app/page.tsx"
target_fingerprint: "sha256:b97e762aa56697c363225da4164d6b2daf4f2f3a22f4d15f32cc77db81bb2056"
target_path: /Users/thiranaembuldeniya/Documents/Personals/drydock/src/app/page.tsx
timestamp: 2026-09-13T13-26-41Z
slug: src-app-page-tsx
---
Method: dual-agent (A: isolated design-review agent · B: isolated detector/evidence agent)
Note: no rendered-browser inspection (no automation tool, Chrome absent, headless Brave hangs). Source + current static build out/index.html. No in-page overlay.

# Critique: Home page (src/app/page.tsx), second run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Open count, rail, chapter marker show state; Now/Fixed well doesn't change tone (register-entry.tsx:55-60) |
| 2 | Match System / Real World | 3 | IAP/WAF/run.app/ingress unexplained; "ingress is left at all" reads broken; "+2" has no unit |
| 3 | User Control and Freedom | 3 | Pause works; rust pings keep pulsing while paused (animate-ping not tied to running) |
| 4 | Consistency and Standards | 2 | Teal word in 7 headings incl. "healthy" (contradicts Passed Means Sage); two large hero primaries; "Open Harbour" ×3 |
| 5 | Error Prevention | 3 | Optional data degrades; Order renders a thin card when followed defect has no dependencies |
| 6 | Recognition Rather Than Recall | 3 | Following D6 helps; As found introduces D1 without context |
| 7 | Flexibility and Efficiency | 3 | Chapter anchors, keyboard tabs, deep links |
| 8 | Aesthetic and Minimalist Design | 2 | ~9 hero elements; D6 title ×4; Healthy repeats hero end frame; ~10 desktop screens, 20+ mobile |
| 9 | Error Recovery | 3 | No content hidden without JS; tour fallback copy wrong for data-less diagram views |
| 10 | Help and Documentation | n/a | Landing page, no task needing help |
| **Total** | | **25/36** | **Acceptable (69%)** |

## Design Specificity Verdict

LLM: now mostly authored for Drydock (headline, model-driven hero walkthrough, D6 real commands, dependency/sequence panels, sage-at-Healthy chapter marker). Remaining generic frame: hero pill/H1/lead/two CTAs/trust checks/product shot; feature-tab tour; teal word per heading. Missed: author opinions only linked; Healthy doesn't bookend the As found crop; drydock metaphor only in logo.

Detector: 5 design-system-font-size findings; 4 false positives (responsive base sizes page.tsx:93 ×2, page.tsx:215, section-intro.tsx:23); 1 real (faint Eyebrow 10px, typography.tsx:20). Missed 10.5px severity badge (severity-badge.tsx:21) and command label (command-block.tsx:16). Mechanical: headings, 8 anchors, 14 aria refs clean; one hard shadow; no gradient text; bug: chapter pill label renders "undefined. Next chapter: As found" (chapter-marker.tsx:109); 4 diagrams share one aria-label; SVGs ~125KB of 181KB non-script HTML; faint text on footer column headings, command labels, lab card eyebrow (2.89:1 at 10px). Dropped false LLM claim: footer says "© 2026 Drydock", not "Drydock Labs".

## Overall Impression

Real step up; argument now made through the product and rust → ochre → sage reads. Biggest remaining problem is content choice: Order proves "order matters" with D6, which waits on nothing, while D1 (waits on D2, D6, D9) is the obvious example. Fix that and put one of the author's opinions on the page.

## What's Working

1. Evidence not illustration: hero walkthrough, crop, dependency panel, register entry, tour previews all model-driven; pausable, reduced-motion aware, polite live region only while paused.
2. Now/Fixed register entry shows the real --ingress=all state and the real gcloud run services update fix.
3. Robust rendering: no JS-hidden content, optional data drops cleanly, Labs fallback, all semantic colour pairs pass AA.

## Priority Issues

[P1] Order chapter makes its case with a defect that waits on nothing. Lead "Nothing has to land before it"; one "Waits for it" row; no reason D6 sits in phase 3. Fix: centre Order on most-blocked defect (D1 ← D2, D6, D9) with D6 as a blocker, or select followed defect requiring blockers and dependents; add why D6 is phase 3. Command: /impeccable clarify then /impeccable shape

[P1] Author still nearly invisible. One muted 15px first-person line; leads in product voice; push-back link keyed to heading text. Fix: one real trade-off from about.mdx as first-person aside; first-person leads; stronger author line; explicit About anchor id. Command: /impeccable bolder, /impeccable clarify

[P2] Pacing: tour interrupts story; ending repeats hero; mobile finale map scrolls sideways; D6 title ×4. Fix: move tour after Healthy or fold into lab row; Healthy = As found bypass crop at final phase in sage; reuse single-SVG focus crop. Command: /impeccable layout, /impeccable distill

[P2] Too many CTAs and too much teal. Two large hero primaries; teal word in 7 headings; "healthy" teal vs Passed Means Sage; teal stat values vs Signal Rule (DESIGN.md contradiction). Fix: "Explore the full map" as text link; teal emphasis limited or "healthy" sage; "+2 closed"; resolve stat-pill rule. Command: /impeccable quieter, /impeccable colorize

[P2] Motion, screen-reader and small-label gaps. Pings pulse while paused; diagrams share one name; chapter pill label ships "undefined"; 10.5px command/severity labels and 10px faint Eyebrow break 11px floor (DESIGN.md severity spec says 10.5px); footer column headings faint. Fix: gate ping on running; state-aware diagram labels; build pill label only when current exists; raise to 11px and fix DESIGN.md; footer headings weathered sage. Command: /impeccable harden

## Persona Red Flags

Jordan: jargon unexplained; "ingress is left at all" parses broken; three hero actions; "Every angle" opaque.
Riley: tour fallback says "prose and tables" for data-less diagram views; defect with no dependencies → one-row card; no bypass → wide problem list; push-back link depends on heading text.
Casey: callouts hidden below lg and legend below sm (unlabelled rust dashes); map ~1.5 screens down; floating pill lacks safe-area inset and can cover command block ends; finale map and tour map preview scroll sideways.
Hiring manager: headline and map land fast; no opinion on page, no link to who Thirana is; payoff ~10 screens down.

## Minor Observations

- "None of the defects are obvious from a picture" beside a picture highlighting one.
- "The map, journeys and badges update as it lands" but toggling Fixed changes nothing else on this page.
- Fixed state well could take a sage edge.
- Riskiest verify text contains --troubleshoot rendered as prose.
- Tour tab icon squares 16px (DESIGN.md says 12px icon tiles); chain links 16px inside 16px panel.
- Header "Labs" lands on a lab row repeating the hero CTA.

## Questions to Consider

- If order is the argument, why follow the one defect that waits on nothing?
- What would you lose by deleting "Every angle"?
- If the "I'm Thirana" line disappeared, would a hiring manager notice?
