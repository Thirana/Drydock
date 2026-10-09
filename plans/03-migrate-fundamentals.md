# Step 3 - Migrate the fundamentals course

## Status: ✅ done 2026-10-06 - all 35 chapters (0-34) and all 74 widgets published

### Done

- **All chapters 0-34 converted and published** (every part). Ticked in `ledger.md`. No `<Todo>` left.
- **All 74 widgets built**, in `src/components/learn/widgets/`:
  - `bits.tsx` CidrBar, AndGrid, BitCell/BitRow · `same-net.tsx` SameNet · `addr-find.tsx` AddrFind · `bytes.tsx` HexLine, HexDump, HexGrid, IpAnatomy, OctetCards, PlaceValue, SizeCompare, MacAnatomy/MacBytes, VpcSlots
  - `request-trip.tsx` Journey, Envelope · `calculators.tsx` IpConv, CidrCalc, MacDecode · `office.tsx` OfficeMap
  - `local-delivery.tsx` HopExplorer, ArpFan, ArpSim, NatLookup · `quiz.tsx` LayerQuiz, Verdict
  - `routing.tsx` RouteHops, LpmBits, LpmTool, TraceSim, LatCalc · `headers.tsx` HeaderLayout, ByteDump, Ipv4Header, TcpHeader, UdpHeader, Ipv4Dump, SynDump, UdpDump, UdpBuild
  - `transport.tsx` UdpSim, MssCalc, BdpCalc, SlideWin · `seq.tsx` SeqDrawing, SeqDiagram, SeqToggle, TcpLife, SeqSimulator, MultiSeqDrawing · `charts.tsx` LineChart, Chart, CwndSim
  - `dns-mail.tsx` DnsWalk, DnsSim, MxFlow, DkimFlow, MailSim · `web.tsx` Waterfall, DhCalc, CertSim, RtSim, WsHeader, WsDump
  - `setup-security.tsx` DoraInspect, LeaseSim, NtpCalc, CorsSim, OriginCmp, TunnelBuilder · `ipv6-ports.tsx` V6Tool, EuiTool, V6Header, BindSim · `devices.tsx` NetSim
  - `capstone.tsx` ConnectFlow, JoinFlow, LbSim, XffSim, TimeoutChain, E2eJourney, E2eModel, CurlTime
  - Shared: `widget-frame.tsx`, `field.tsx` (`short`/`long` widths), `ui.tsx` (KeyValues, Steps, Outcome, Choices, Select, Action, WidgetNote)
  - Helpers in `src/lib/net/`: `ipv4.ts`, `bytes.ts`, `mac.ts`, `ipv6.ts`
- **Static layouts** in `src/components/learn/blocks.tsx`: Cols/Col, Tags, Sketch, Equation, Part, Segments/Seg, Hops/Hop, Range/RangePart, Fields/Field, Annotated/Line. Registered in `mdx.tsx`.
- **Data** extracted from the notes into `widgets/data/fundamentals.json` (SEQSETS, LIFE, SIMS, QZ, QL, R3T, RH, TR, DNSL, DNSZ, DORA, JN, JLINKS, JS, LBSH), types in `data/types.ts`.
- Checks pass: `node doc/tools/check-mdx.mjs` (36 of 36 chapters compile, incl. GCP 0), `npm run typecheck`, `npx eslint src content`, `npm run build` (static export, all 35 fundamentals chapter pages prerendered).

### Decisions and rules learned this step

- **Fundamentals colour legend is by layer** (the notes say so): plum application, amber transport, **green IP (source blue)**, teal link. In a drawing with blue boxes, source-green boxes are drawn in ink. Fundamentals figures get **no automatic key** (`legend: {}`); a figure passes `labels` when it needs one. GCP keeps its place legend.
- Prose colour words are renamed by the converter (orange→amber, purple→plum, cyan→teal, blue→green). Sentences that describe the source page itself, or colours a widget no longer uses, are reworded in `doc/tools/fix-fundamentals.py` (idempotent; re-run after any reconversion).
- **No category colours** in widgets: header fields, byte dumps and per-connection bars are neutral with labels; hues only for the legend's meanings. Red only for broken (lost, dropped, refused, failing check); a differing bit uses the highlighter, quiz answers use The Plain Verdict Rule.
- **Never add content** in widgets: captions and copy come from the notes (reword only what refers to colours or the old page).
- Converter fixes made: inline styles map the notes' CSS variables to `--dd-*`; attributes with quotes become JSX expressions; `course.ts` uses plain string literals; `.m.chg` keeps bold; collision check only looks at boxes (`rect.n`), not zones.

### Visual check

- Every widget seen in a browser on desktop and at 375px (light and dark), through a temporary review page (now deleted). Chapters 0-12, 15, 16, 20 also checked as full pages.
- Fixes from that pass: wide fields (`Field long`), header layout min width 760 and smaller names for 1-2 bit fields, byte-dump labels spill only into the same field, XffSim protocol row in sans, timing bars (E2eModel, CurlTime) fit a phone and show only the end ticks there, ch 20 "together: 180 Mbit/s" label moved above the router box.
- At phone width, wide drawings (sequence diagrams, network maps) and wide tables scroll sideways inside the widget frame, the same as chapter tables. No page-level overflow.
- Not looked at closely as full pages: 13, 14, 17-19, 21-34 (prose and tables use the same components as checked chapters). Step 7's review covers them.

### Tools added (all in `doc/tools/`, gitignored)

- `convert.py` (`--dry-run`, `--figures-only`, `--force`, `--index-only`), `fix-fundamentals.py`, `fix-gcp-00.py`
- `widget-src.py fundamentals <name>...` - prints a source widget's builder and wiring code
- `widget-data.mjs fundamentals <CONST>...` - evaluates the notes' data constants to JSON
- `check-mdx.mjs` - compiles every course chapter
- `crop-png.py in.png out.png top height` - crops tall screenshots (macOS `sips` offsets are unreliable)
- Screenshots: Playwright's headless shell honours phone widths; start `npx next dev -p 3123` first (a dev server on 3000 blocks a second one).


Size: XL. 35 chapters, 74 distinct widgets. Work **one part per PR** (6 PRs), converting prose and porting that part's widgets together so every PR is complete. Tick chapters in `ledger.md` as they land.

## 1. The converter (`doc/tools/convert.py`, built in step 2)

Usage, from the repo root:

```
python3 doc/tools/convert.py fundamentals 1 2 3            # convert chapters (skips existing MDX)
python3 doc/tools/convert.py fundamentals 3 --force         # overwrite the MDX and figures
python3 doc/tools/convert.py fundamentals 3 --figures-only  # redo drawings, keep a hand-edited MDX
python3 doc/tools/convert.py --index-only                   # regenerate course.ts only
```

It always regenerates both `course.ts` files, so a chapter is published as soon as its MDX exists. It prints `REVIEW:` lines for everything a human must check. Known review items:

- **Blue boxes** default to green (server) in the fundamentals; check each (e.g. "IP header" in ch 1, "Google edge" in ch 12, the layer boxes in ch 11 are not servers).
- **Layer-coloured drawings** (encapsulation in ch 1, 11, 15, 18...): pass `labels` to `<Figure>` so the key says "TCP", "IP" and so on instead of the course legend.
- **Cross-references:** "ch N" is linked within the current course. Tables or sentences that point into the other course need `course="fundamentals"` added by hand (as done in GCP 0's "Recall first" column).
- **Text crossing a box** in drawings: fix the coordinates in `figures/NN-slug.tsx` by hand.
- **Unmapped markup** (fundamentals: `card`, `duo`, `pbar`, `hop`/`hops`/`harrow`, `pkt`, `fbox`, code highlighting spans `kw`/`cm`/`str`/`fn` inside `pre`, `part`, `big-eq`, `small`, `h4`...): add a mapping to the converter before converting the part that uses it, rather than hand-editing many chapters. New widgets go in its `WIDGETS` table.
- Never run Prettier on course MDX (it is ignored on purpose).
- **"Try it yourself" tables become `<TryIt>` items automatically** (bullets over a command box; GCP "Commands in this chapter" too). Rows with several commands or GUI steps get a "Steps" bullet with the original sentence; check those read well.
- **Hand edits after conversion** belong in a small rerunnable script next to the converter, like `doc/tools/fix-gcp-00.py`, so a later `--force` reconversion does not lose them.

Original plan for the converter, kept for reference:

Converts an extracted chapter (`doc/extract/fundamentals/*.html`) into a first-draft MDX file plus a figures TSX file. Its output is a draft, not final - every chapter gets a human read afterwards.

| Source markup | Becomes |
| --- | --- |
| `<p class="eyebrow">` | dropped (part + number come from `course.ts`) |
| `<h1>`, `<p class="lead">` | `title` and `lead` in `course.ts` |
| `<h2 id><span class="n">01</span>Title` | `## Title` (numeral is automatic; keep the id as an explicit anchor) |
| `<h2>` with `··` | `## Summary` / `## Try it yourself` (unnumbered) |
| `<p>`, `<code>`, `<b>`, `<em>`, lists | Markdown |
| `<span class="term">x</span>` | `<Term>x</Term>` |
| `<div class="key" style="--k:var(--blue)"><b>T</b><p>…` | `<Key title="T">…</Key>` |
| `<div class="note">` | `<Note>` |
| `<div class="fig"><svg class="d">…` | a named component in `figures/NN-slug.tsx` (`class`→`className`, `marker-end`→`markerEnd`, `url(#ah-orange)`→role marker, `purple/cyan/green/orange/blue`→`client/net/server/request/info`); MDX gets `<Figure><MaskDecision /></Figure>` |
| colour classes in drawings | `purple`→`client`, `cyan`→`net`, `green`→`server`, `orange`→`request`, `red`→`fault`, `blue`→`net` (network part) or no class; `a-<c>`→`w <role>`; `url(#ah-<c>)`→`url(#dd-ah-<role>)`; `rx="10"`→`rx="2"`; `c-<c>` on text → `l` (or dropped when the text is `s`) |
| `<div class="fig wide">` | `<Figure wide>` |
| `<div class="fig" data-fig="x" data-a="…">` | `<X a="…" />` with an import at the top of the MDX; unknown widgets become `<Todo widget="x" />` so nothing is silently lost |
| `<table class="tbl">` | GFM table if every cell is simple; otherwise `<Table>` JSX |
| `<div class="rows" style="--cols:…">` | `<Rows cols="…">` |
| `<span class="pill green">` | role-coloured text label (no pill) |
| `<span class="c-orange">` | `<Role r="request">` |
| `<span class="os">` | `<Os>` inside `<TryIt>` |
| `<pre>` | fenced code block, or `<CommandBlock>` for shell commands |
| "chapter 3", "ch 3" in prose | `<Ch n={3}>chapter 3</Ch>` (regex pass + manual check) |
| `—` / `–` | ` - ` / `-` |

Add a **collision check**: estimate each text's box from its font size and character count and flag any text that crosses a rect edge or a zone border (DESIGN.md: text never crosses a box edge). Some source drawings already overlap (e.g. 27. DHCP: "with giaddr = 172.16.2.1" sits inside the router box) - fix those by hand while converting.

Add a check to the converter: it prints every class or tag it did not map. Zero unknowns before a chapter is accepted.

## 2. Widget foundation (first PR of this step)

Shared pieces every family uses, in `src/components/learn/widgets/`:

- `widget-frame.tsx` - hairline frame, optional title/caption, horizontal-scroll handling, `aria-live` output region.
- `controls` - reuse `ToggleChip`, `SegmentedControl`, `Button`; add `Stepper` (back / step / play / reset, keyboard: ←/→/space) honouring reduced motion.
- `ip-input.tsx` - validated text input with inline error (source `ip()` / `cidr()` parsers move to `src/lib/net/ipv4.ts`).
- `bit-row.tsx`, `byte-grid.tsx`, `hex-dump.tsx` - the bits-and-bytes visuals (32 cells with octet gaps, network/host colouring).
- `seq-diagram.tsx` - the source's `multiSeq` / `seqdiag`: lanes + arrows with role colours, used by ~10 widgets in both courses.
- `diagram.tsx` - SVG primitives (`Node`, `Wire`, `Label`) that match step 1's classes, for widgets that draw.

Port the pure logic first into `src/lib/net/*.ts` (ipv4/cidr/mask maths, MAC/OUI, hex, checksums, TCP seq/ack, cwnd, DNS walk data) and give it small unit tests if a test runner is added; otherwise keep it pure so it can be checked by hand.

## 3. Widget families (fundamentals)

Port in the order of the parts. Each widget is a client component (`"use client"`) whose props are the source `data-*` attributes.

- **Bits and bytes (static or light input):** `cidrbar`, `andgrid`, `placevalue`, `ipanatomy`, `macanatomy`, `hexgrid`, `hexline`, `hexdump`, `envelope`, `sizecompare`, `vpcslots`, `lpmbits`, `ipv4hdr`, `ipv4dump`, `tcphdr`, `syndump`, `udphdr`, `udpdump`, `v6hdr`, `wshdr`, `wsdump`
- **Calculators (input → answer):** `ipconv`, `cidrcalc`, `samenet`, `macdecode`, `lpmtool`, `latcalc`, `msscalc`, `bdpcalc`, `dhcalc`, `ntpcalc`, `euitool`, `v6tool`, `udpbuild`, `curltime`
- **Sequence diagrams:** `seqdiag`, `seqtoggle`, `seqsim`, `connectflow`, `tcplife`, `mxflow`, `dkimflow`, `joinflow`
- **Simulators (state + step/play):** `journey`, `officemap`, `hopexplorer`, `arpfan`, `arpsim`, `natlookup`, `routehops`, `tracesim`, `udpsim`, `slidewin`, `cwndsim`, `chart`, `dnssim`, `dnswalk`, `leasesim`, `dorainspect`, `waterfall`, `rtsim`, `certsim`, `corssim`, `origincmp`, `mailsim`, `tunnelbuilder`, `bindsim`, `netsim`, `lbsim`, `timeoutchain`, `xffsim`, `e2ejourney`, `e2emodel`
- **Quizzes:** `layerquiz`

(Each name appears in `ledger.md` next to the chapters that use it.)

For each widget: read `figs.x` + `inits.x` in `doc/extract/fundamentals/widgets.js`, run the source page to see the behaviour, rebuild in React with Drydock controls and role colours, and check keyboard use, 375px width, both themes and reduced motion.

## 4. Per-part checklist (repeat 6 times)

1. Run the converter on the part's chapters.
2. Read each MDX against the source page: wording unchanged except dashes and cross-links; fix anything the converter flattened.
3. Port the part's widgets (reuse earlier families).
4. Replace every `<Todo>`; `grep -r "<Todo" content/learn` must be empty for the part.
5. Build, lint, typecheck; look at every chapter at 375px and 1440px, light and dark.
6. Tick the chapters in `ledger.md`.

Parts and rough weight: Start here (1 ch) · Addressing and local delivery (ch 1-10, heavy: 30 widgets) · Layers, routing and transport (ch 11-21, heaviest: TCP simulators) · Application protocols (ch 22-29) · Network building blocks (ch 30-32) · Putting it together (ch 33-34).

## Done when

All 35 fundamentals rows in `ledger.md` are ticked and no `<Todo>` remains.
