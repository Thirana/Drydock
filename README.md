# Drydock

Deliberately broken cloud architectures, and how to fix them step by step. Built with Next.js (App Router) and MDX, exported as a fully static site.

## Commands

```bash
npm run dev        # local development at http://localhost:3000
npm run build      # static export to out/
npm run start      # serve out/ locally
npm run lint
npm run typecheck
npm run format
```

## How content is organised

URLs follow the content hierarchy: **provider → lab → track → view**.

| URL                        | Level    | Example                                     |
| -------------------------- | -------- | ------------------------------------------- |
| `/gcp`                     | provider | Google Cloud                                |
| `/gcp/harbour`             | lab      | One fictional platform                      |
| `/gcp/harbour/network`     | track    | One concern of that platform (network, IAM) |
| `/gcp/harbour/network/map` | view     | One page of a track                         |

```
content/                         everything an author touches
  index.ts                       registered providers
  gcp/
    provider.ts
    harbour/
      lab.ts                     lab metadata + its tracks
      network/
        track.ts                 heading, meta, views (order = nav order)
        model/                   typed data behind the diagrams
          nodes.ts groups.ts edges.ts overlays.ts
          phases.ts defects.ts journeys.ts
          components.ts load-balancer.ts
          showcase.ts            landing page pins + mobile crop (optional)
          index.ts               assembles + validates the model
        views/*.mdx              the prose of each page

src/
  app/                           routes; generic, driven by the registry
  components/architecture/       map, journeys, defect register, LB chain
  components/mdx/                content primitives (Lede, Note, …)
  components/layout/             track navigation and view rendering
  lib/architecture/              pure logic: types, phase state, geometry, validation
  lib/content/                   registry lookups and URL helpers
  mdx-components.tsx             components available in every MDX file
```

### The architecture model

Only the **as found** state is authored. The state at any later phase is derived: each defect names the phase that closes it and an `applies` patch describing what changes on the map. Journeys mark hops with `whileOpen` / `afterClosed` so they update as the phase rail moves.

`validateArchitecture` checks every cross-reference (edges, journeys, defect patches, component sheets) when the track loads, so a typo fails `npm run dev` / `npm run build` instead of rendering a broken diagram.

### Writing views

Views are MDX. Track-bound components are injected by the page, so an MDX file never imports data:

```mdx
## Packet journeys

<Lede>Six flows traced hop by hop.</Lede>

<JourneyExplorer />
```

Available everywhere: `Hero`, `Lede`, `Note`, `Caption`, `Columns`/`Column`, `AddressBlocks`/`AddressBlock`, `Status`, `PhaseTag`, `SeverityBadge`, and GitHub-flavoured tables.
Available in architecture tracks: `MapExplorer`, `JourneyExplorer`, `DefectRegister`, `LoadBalancerExplorer`, `ComponentSheets`, `PhaseSequence`, `DefectTag`.

## Styling

The UI follows the design system in `design-system/` (dark only, forest-charcoal surfaces, one teal accent, Inter + Geist Mono), implemented with Tailwind CSS v4.

- **Tokens** live in `src/app/globals.css` and are exposed as `gl-*` utilities (`bg-gl-surface`, `text-gl-text-muted`, `shadow-gl`, …). Don't hardcode hex colours in components; the only exceptions are decorative gradients and glows.
- **Diagram colours** are semantic tones (`edge`, `compute`, `data`, `private`, `danger`, …) mapped onto the palette as `--tone-*` variables in `globals.css`. Retune the diagrams there, not in the data.
- **Long-form MDX** is styled by `.gl-prose`. Interactive components opt out with `not-prose` and style themselves.
- **Shared UI** is in `src/components/ui` (buttons, icons, logo, controls, typography, `FadeIn`). Marketing pages use `src/components/site/page-shell.tsx`, and track pages use the app shell in `src/app/[provider]/[lab]/[track]/layout.tsx`.
- Motion honours `prefers-reduced-motion`, in CSS and in the JS-driven preview loops.

## Adding content

- **A view** — add `views/<slug>.mdx` and list it in `track.ts`.
- **A track** (e.g. IAM for Harbour) — add `harbour/iam/track.ts` and list it in `lab.ts`. A track with a different data shape adds its own optional model to `Track` in `src/lib/content/types.ts`, plus a matching MDX component factory.
- **A lab** — add `<provider>/<lab>/lab.ts` and list it in `provider.ts`.
- **A provider** — add `<provider>/provider.ts` and list it in `content/index.ts`.

Routes are generated from the registry, so none of these need changes under `src/app`.
