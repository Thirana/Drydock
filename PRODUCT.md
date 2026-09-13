# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Engineers learning cloud networking and security** — cloud and platform engineers working through GCP networking (self-study, certification prep) who learn best by reasoning about realistic failures rather than reading reference docs.
- **People evaluating the author's work** — hiring managers, peers and clients reading Drydock as a portfolio piece that shows how the author thinks about architecture, sequencing and trade-offs.

## Product Purpose

Drydock publishes cloud architectures that are deliberately broken, and walks through fixing them step by step. Each lab is one fictional platform with every defect planted on purpose; the point is not the architecture but the reasoning about what is wrong, why it is wrong, and what order the fixes have to happen in.

Success is a reader who can see a defect that is not obvious from a diagram, confirm it with a real command, and explain why it has to be fixed before or after another one.

## Positioning

The order of the fixes is the argument. Drydock does not stop at a list of findings: defects block each other, and a phase rail walks the whole platform through the remediation sequence so the map, packet journeys and defect badges change as each phase lands. Every defect carries the command that detects it, the concept it teaches, what blocks it, the before and after, and the change that closes it.

## Operating Context

- Content hierarchy and URLs: provider → lab → track → view (e.g. `/gcp/harbour/network/map`).
- The one published lab today is **Harbour**, a fictional marketplace platform on Google Cloud, with a **Network** track made of seven views: About, Map, IP plan, Components, Load balancing, Packet journeys, Defects.
- Readers explore interactively: overlays on the map, a phase rail from "as found" (phase 0) through the remediation phases, journeys traced hop by hop, and a defect register ordered by phase.
- Commands are real `gcloud` invocations meant to be read and adapted, not run against a real system.

## Capabilities and Constraints

- **Fully static:** the site is a static export with no backend, accounts, databases or server-side features. Anything that needs a server is out of scope.
- **Free, no sign-up:** everything is open to read; no paywall, email gate or login.
- **Scope:** Google Cloud only. Planned growth is more tracks for Harbour (e.g. IAM) and possibly more GCP labs; other providers are not planned.
- **Not a template:** Harbour is not a production template, a best-practice reference, or an audit of any real system. Names, addresses and identifiers are invented.
- **Terminology:** provider, lab, track, view; defect (IDs like D1, D3a), severity (critical, high, medium, low), phase, "as found", phase rail, packet journey, hop, defect register, remediation sequence.
- **Open fact:** the About page says "Fifteen problems" while the Harbour network model currently registers 17 defects (D3 is split into D3a and D3b, among others). Reconcile before copy work repeats either number.

## Brand Commitments

- Name: **Drydock**. Tagline: "Deliberately broken cloud architectures, and how to fix them step by step."
- Lab disclaimer: "Harbour is fictional. The shape is real."
- Voice: one author, first person, with opinions — including disagreeing with textbook answers where a given system warrants it.

## Evidence on Hand

- The Harbour network track content in `content/gcp/harbour/network/`: 17 defects with detection and remediation commands, 7 phases (0–6), 6 packet journeys, component sheets, load balancer chains, and the About page's "where I would push back" trade-offs.
- No testimonials, user or reader counts, press, ratings, endorsements or case studies exist. Future work must not invent them.

## Product Principles

1. **Sequence over lists.** Show why the order matters, not just what is wrong.
2. **Verifiable, not asserted.** Every finding is backed by a command that surfaces it and a check that confirms the fix.
3. **Realistic, never prescriptive.** Defects are the reasonable shortcuts real projects accumulate; the lab is a way to reason, not a template to copy.
4. **Opinionated and honest.** Name trade-offs and disagree with standard advice where the system warrants it.
5. **Open and frictionless.** Static, free and readable without an account.
