# Drydock

Learn how networks work. Then fix one that doesn't.

A networking guide in three steps: a fundamentals course (35 chapters), a course on networking in Google Cloud (24 chapters), and Harbour, a platform built wrong on purpose to fix in order. Built with Next.js (App Router) and MDX, exported as a fully static site.

## Commands

```bash
npm run dev        # local development at http://localhost:3000
npm run build      # static export to out/, then the Pagefind search index
npm run start      # serve out/ locally
npm run lint
npm run typecheck
npm run format
```

## How content is organised

Courses follow **course → part → chapter → section**:

| URL                                | Level    | Example                            |
| ---------------------------------- | -------- | ---------------------------------- |
| `/learn`                           | path     | Both courses, then the labs        |
| `/learn/fundamentals`              | course   | Parts and chapters                 |
| `/learn/fundamentals/subnet-masks` | chapter  | One chapter; `##` are sections     |
| `/learn/glossary`                  | glossary | Every `<Term>`, collected at build |

Labs follow **provider → lab → track → view** (`/labs` lists them all):

| URL                        | Level    | Example                                     |
| -------------------------- | -------- | ------------------------------------------- |
| `/gcp`                     | provider | Google Cloud                                |
| `/gcp/harbour`             | lab      | One fictional platform                      |
| `/gcp/harbour/network`     | track    | One concern of that platform (network, IAM) |
| `/gcp/harbour/network/map` | view     | One page of a track                         |

```
content/                         everything an author touches
  learn/
    index.ts                     the courses, in reading order
    chapters.ts                  every chapter's MDX (imported by the chapter route only)
    <course>/
      course.ts                  parts + chapter metadata (title, lead, minutes)
      chapters.ts                slug → MDX loader
      chapters/NN-slug.mdx       the chapter text
      figures/NN-slug.tsx        the chapter's static drawings
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
          showcase.ts            landing page pins, reveals, mobile crop (optional)
          index.ts               assembles + validates the model
        views/*.mdx              the prose of each page

src/
  app/                           routes; generic, driven by the registry
  components/learn/              chapter page, rail, MDX vocabulary, figures
  components/learn/widgets/      the interactive widgets; chapters import them from lazy.tsx
  components/architecture/       map, journeys, defect register, LB chain
  components/mdx/                content primitives (Lede, Note, …)
  components/layout/             track navigation and view rendering
  lib/architecture/              pure logic: types, phase state, geometry, validation
  lib/content/                   registry lookups, URL helpers, cross-links, glossary
  lib/net/                       pure helpers behind the widgets (IPv4, IPv6, MAC, bytes)
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

### Courses and labs link to each other

Each Harbour defect lists the course sections that teach it (`learn` in `defects.ts`). The register shows them as "Learn it", and each linked chapter ends with "See it broken", listing the defects that point at it. Both come from that one list (`src/lib/content/crosslinks.ts`).

## Styling

The design system is `DESIGN.md` ("The Annotated Score": off-white page, ink, one blue for current and followable, red only for faults, Atkinson Hyperlegible, hairlines, no cards), implemented with Tailwind CSS v4. Product context is in `PRODUCT.md`.

- **Tokens** live in `src/app/globals.css` (`--dd-*`, exposed as Tailwind colours such as `text-ink-muted`, `bg-sunk`, `text-fault`). Don't hardcode hex colours in components.
- **Course drawings and widgets** may use the four drawing hues (plum, teal, green, amber), named by each course's `legend`; chrome never does. Lab diagrams stay in ink tones (`--tone-*`), with red for defects.
- **Long-form MDX** is styled by `.gl-prose`. Interactive components opt out with `not-prose` and style themselves.
- **Shared UI** is in `src/components/ui` (buttons, icons, logo, controls, typography, `FadeIn`). Marketing pages use `src/components/site/page-shell.tsx`, and track pages use the app shell in `src/app/[provider]/[lab]/[track]/layout.tsx`.
- Motion honours `prefers-reduced-motion`, in CSS and in the JS-driven preview loops.

## Adding content

- **A chapter** - add `chapters/NN-slug.mdx` (and `figures/NN-slug.tsx` for drawings), list it in `course.ts` and `chapters.ts`. Import widgets from `@/components/learn/widgets/lazy` so the chapter ships only its own.

- **A view** - add `views/<slug>.mdx` and list it in `track.ts`.
- **A track** (e.g. IAM for Harbour) - add `harbour/iam/track.ts` and list it in `lab.ts`. A track with a different data shape adds its own optional model to `Track` in `src/lib/content/types.ts`, plus a matching MDX component factory.
- **A lab** - add `<provider>/<lab>/lab.ts` and list it in `provider.ts`.
- **A provider** - add `<provider>/provider.ts` and list it in `content/index.ts`.

Routes are generated from the registry, so none of these need changes under `src/app`.
