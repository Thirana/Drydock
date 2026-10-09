# Step 4 - Migrate the GCP course

## Status: ✅ done 2026-10-06 - all 24 chapters (0-18.2) and all 84 widgets published

### Done

- **All chapters converted** with `doc/tools/convert.py gcp …` and published. Ticked in `ledger.md`. No `<Todo>` left.
- **All 84 widgets built**, in `src/components/learn/widgets/gcp/` (the converter's `GCP_WIDGETS` table maps each `data-fig` name; the GCP `dnswalk` is `GcpDnsWalk`, not the fundamentals one):
  - `case-explorer.tsx`: the shared engine (`CaseExplorer`: cases, "What if", drawing, takeaway, folded config), `Chain` (a request through boxes, with optional replies), `Result` (ok / warn / fault / plain), `Config`.
  - `draw.tsx`: `Box`, `Zone`, `T`, `Wire`, `Mark`, `Caps`, `Drawing`, `Timeline` - the notes' colour names map to the GCP legend in one place (`boxHue`, `wireHue`).
  - `kit.tsx`: `Examples`, `Check`, `GroupLabel`, `Table`, `StepNav`, `Runbook`, `CheckList`, `Phases`.
  - `foundations.tsx` (ch 1-4) PktWalk, ScopeQuiz, SubnetGrid, ExpCheck, IpFate, RouteEx, RoutePick
  - `access.tsx` (ch 5.1-6.2) StatefulEx, RuleEx, FwWalk, LayerEx, LayerWalk, ObjEx, SshCheck
  - `private.tsx` (ch 7-10) NatCalc, DnsOrder, SplitEx, GcpDnsWalk, TtlEx, DnsHybrid, PrivOverview, PgaEx, PsaEx, PscEx, SqlCutover, RunPaths
  - `frontdoor.tsx` (ch 11-12.2) LbDecoder, LbGlobal, LbL7L4, LbTree, ProxyEx, LbChain, UrlMapTool, HcEx, DeployEx, XffEx, ArmorEx, MigOverview, HealEx, ScaleEx, UpdateEx, MigChain
  - `cloudflare.tsx` (ch 13) CfOverview, CfMigrate, CfRecords, TlsModes, OriginLock, CfCache, CfErrors
  - `growing.tsx` (ch 14-15) VpcOptions, PeeringEx, SharedVpc, HybridPaths, VpnParts, BgpEx, FailoverEx, MtuBar, VpnFlows
  - `running.tsx` (ch 16.1-16.2) ObsMap, LbEntry, FlowCover, LogCost, QueryBook, DashMock, UptimeEx, AlertWin, ConnTest, Incidents, Rollout
  - `governance.tsx` (ch 17) DriftModel, GovHier, OrgPolEx, Constraints, Guardrails, IamFlow, VpcScEx, IacFlow, GovRollout
  - `capstone.tsx` (ch 18.1-18.2) Cap1, Cap2 (one `Journey`: request path, return path, break it), Quiz1, Quiz2, FinalMap
- **Data** that the notes keep as literals is in `widgets/data/gcp.json` (PKTWALK, SCOPE, IPFATE, QUERYBOOK, INCIDENTS, CONNTEST, CONSTRAINTS, GUARD_LAYERS, GUARDRAILS, CAP1, CAP2, QUIZ1, QUIZ2), built by `doc/tools/gcp-json.py`. Data the notes build in code is written out in the widget files.
- Checks pass: `node doc/tools/check-mdx.mjs` (59 of 59 chapters), `npm run typecheck`, `npx eslint src content`, `npm run build` (all 24 GCP chapters prerendered).

### Decisions and rules learned this step

- **Port behaviour, not code.** Tables, step strips, verdicts, runbooks and checklists that the notes drew in SVG are HTML now (they wrap on a phone and read at body size). Drawings stay SVG, 960 units wide; frames that hold them use the full column (`WidgetFrame wide`), text-only widgets keep 760px.
- **Selection is blue** (`.n.cur`, `.w.cur`): the hop being described, the part a tab picked. The notes used orange for this.
- **Results** follow the Plain Verdict Rule: a drawn tick in ink when it works, "!" for a warning, a red cross only when something is stopped, refused or lost. Green and yellow result bars are gone.
- **Highlighter** (`.n.mark`, solid) for warnings and for "this is new"; the notes' yellow.
- **Cloudflare is ink** (chapter 0's legend says networks outside GCP are ink), even where the notes drew it orange; the final map and the journeys follow that too. Cloudflare's own "orange cloud / grey cloud" words in prose stay.
- **No emoji or unicode stand-ins for icons** (the notes' padlocks, bells, clouds, warning signs): words, or the drawn tick and cross.
- **Category colours removed** where they were not the legend (template versions v1/v2, prod/staging projects, dashboard series, rollout phases): labels and weight carry them.
- Quiz options are shuffled in a fixed order per question so the static page and the browser agree.
- Prose that named a colour a widget no longer uses is reworded in `doc/tools/fix-gcp.py` (chapters 1-18.2, idempotent) and `doc/tools/fix-gcp-00.py` (chapter 0).

### Visual check

- Every GCP widget seen on desktop (1000px) and at 375px through a temporary review page (deleted). Chapters 1, 4, 5.1 and 8 also checked as full pages.
- Fixes from that pass: the route explorer's small drawings became HTML; highlighter boxes made solid; legend, label and note positions moved where they overlapped (ScaleEx, OriginLock, FlowCover, DriftModel, IacFlow); lane notes in StatefulEx get a halo.
- At phone width, drawings and wide tables scroll inside their frame, as in the fundamentals course.
- Not looked at closely as full pages: chapters 2, 3, 5.2-7 and 9-18.2 (their widgets were all checked). Step 7's review covers them.

### Tools added (`doc/tools/`, gitignored)

- `gcp-data.mjs widget…` - prints the literal data inside a GCP widget (variables and literal arguments to the shared engines)
- `gcp-json.py` - builds `widgets/data/gcp.json` from a SPEC table
- `gcp-static-svg.mjs name` - renders a static drawing builder (used for the final map, then converted with the chapter converter)
- `fix-gcp.py` - hand edits for chapters 1-18.2

## Differences from the fundamentals course

- **Minified widget code.** Use the Prettier-formatted `doc/extract/gcp/widgets.js` from step 0, and lean on the running source page to understand behaviour. Port behaviour, not code line by line.
- **Lots of `gcloud`.** Most `<pre>` blocks are commands. Render them with the existing `CommandBlock` (wrapping, hanging indent, `keyFlags` highlighting where a fix flag is obvious). Each chapter ends with "Commands in this chapter" → `<Commands>`.
- **Chapter numbers like 5.1 / 12.2.** `num` is a string; slugs never contain the number. The pager and rail show `5.1`.
- **References to the fundamentals course** ("Network notes ch 33") → `<Ch course="fundamentals" n={33} />`. Collect these per chapter to show "Builds on" (step 5).
- **"Back to Kadé"** sections close most chapters. Keep them as normal numbered sections. They are where Harbour cross-links fit best (step 5).

## Widget families (GCP)

- **Example steppers ("pick a case, see the outcome"):** `statefulex`, `ruleex`, `objex`, `layerex`, `routeex`, `splitex`, `ttlex`, `pscex`, `psaex`, `pgaex`, `proxyex`, `armorex`, `hcex`, `deployex`, `xffex`, `scaleex`, `healex`, `updateex`, `peeringex`, `bgpex`, `failoverex`, `uptimeex`, `orgpolex`, `vpcscex`, `expcheck`. These probably share one engine: build a generic `<CaseExplorer cases={…} />` first, then each widget is mostly data.
- **Overview and structure maps:** `privoverview`, `migoverview`, `cfoverview`, `obsmap`, `govhier`, `lbtree`, `lbchain`, `migchain`, `runpaths`, `hybridpaths`, `vpnparts`, `vpnflows`, `sharedvpc`, `vpcoptions`, `dnsorder`, `dnshybrid`, `finalmap`, `lbglobal`, `lbl7l4`, `subnetgrid`, `mtubar`
- **Walkthroughs (step through a packet or a decision):** `pktwalk`, `fwwalk`, `layerwalk`, `dnswalk` (shared with fundamentals if the same), `cap1`, `cap2`, `sqlcutover`, `cfmigrate`, `rollout`, `govrollout`
- **Calculators and decoders:** `addrfind`, `natcalc`, `routepick`, `lbdecoder`, `urlmaptool`, `logcost`, `ipfate`, `tlsmodes`, `originlock`
- **Ops mock-ups (logs, dashboards, alerts):** `lbentry`, `flowcover`, `querybook`, `dashmock`, `alertwin`, `conntest`, `incidents`, `cfrecords`, `cferrors`, `cfcache`
- **Governance:** `constraints`, `guardrails`, `driftmodel`, `iamflow`, `iacflow`
- **Quizzes and checks:** `scopequiz`, `sshcheck`, `quiz1`, `quiz2`

Before porting, put the GCP diagram style next to Harbour's map. Where a GCP widget draws the same things as Harbour (load balancer chain, VPC with subnets), reuse Harbour's diagram components (`architecture-diagram`, `load-balancer-diagram`) instead of a second drawing style.

## Parts

Start here (0) · Foundations (1-4) · Controlling access (5.1-6.2) · Leaving and reaching privately (7-10) · The front door (11-13) · Growing out (14-15) · Running it (16.1-18.2).

## Done when

All 24 GCP rows in `ledger.md` are ticked, no `<Todo>` remains, and every `gcloud` block renders through `CommandBlock`.
