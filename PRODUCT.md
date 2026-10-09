# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences:

- **People learning networking from zero** - developers and new engineers who use networks every day without knowing what happens to a request. The fundamentals course assumes no background and follows one request from a laptop to a server.
- **Engineers learning cloud networking and security** - cloud and platform engineers working through GCP networking (self-study, certification prep) who learn best by reasoning about realistic failures rather than reading reference docs.
- **People evaluating the author's work** - hiring managers, peers and clients reading Drydock as a portfolio piece that shows how the author thinks about architecture, sequencing, teaching and trade-offs.

## Product Purpose

Drydock is a networking learning guide in three stages:

1. **Networking fundamentals** - how a request leaves a laptop and crosses the internet: addressing, local delivery, routing, transport, DNS, HTTP, TLS and the boxes in the middle.
2. **Networking on GCP** - the same ideas inside a Google Cloud project: VPCs, routing, firewalls, private access, egress, load balancing, hybrid, observability and governance.
3. **Labs** - cloud architectures that are deliberately broken, and how to fix them step by step. Each lab is one fictional platform with every defect planted on purpose; the point is the reasoning about what is wrong, why it is wrong, and what order the fixes have to happen in.

The courses teach; the labs test. Success is a reader who can explain what a packet does at each hop, then see a defect that is not obvious from a diagram, confirm it with a real command, and explain why it has to be fixed before or after another one.

## Positioning

Learn it, then fix it. The courses follow one small company, Kadé, through every chapter, so each idea lands on addresses the reader has already seen, and most chapters carry an interactive figure to try the idea by hand. The labs then hand the reader a platform built wrong.

Inside a lab, the order of the fixes is the argument. Drydock does not stop at a list of findings: defects block each other, and a phase rail walks the whole platform through the remediation sequence so the map, packet journeys and defect badges change as each phase lands. Every defect carries the command that detects it, the concept it teaches, what blocks it, the before and after, and the change that closes it - and links back to the chapter that teaches the concept.

## Operating Context

- Content hierarchy and URLs:
  - Courses: course → part → chapter → section, at `/learn/<course>/<chapter>` (e.g. `/learn/fundamentals/subnet-masks`, `/learn/gcp/egress-and-cloud-nat`).
  - Labs: provider → lab → track → view (e.g. `/gcp/harbour/network/map`).
- **Networking fundamentals:** 35 chapters (0-34) in six parts - Start here; Addressing and local delivery; Layers, routing and transport; Application protocols; Network building blocks; Putting it together.
- **Networking on GCP:** 24 chapters (0-18.2, some split as 5.1 and 5.2) in seven parts - Start here; Foundations; Controlling access; Leaving and reaching privately; The front door; Growing out; Running it.
- Chapter 0 of each course is the Kadé reference: the story, the map and the address book every chapter uses.
- The one published lab is **Harbour**, a fictional marketplace platform on Google Cloud, with a **Network** track made of seven views: About, Map, IP plan, Components, Load balancing, Packet journeys, Defects.
- Readers explore interactively: calculators, simulators, byte dumps and quizzes inside chapters; in the lab, overlays on the map, a phase rail from "as found" (phase 0) through the remediation phases, journeys traced hop by hop, and a defect register ordered by phase.
- Commands are real (`gcloud`, `dig`, `ip route`, `curl`...) and meant to be read and adapted, not run against a real system.

## Capabilities and Constraints

- **Fully static:** the site is a static export with no backend, accounts, databases or server-side features. Anything that needs a server is out of scope. Per-reader conveniences (theme, last chapter read) live in the browser only.
- **Free, no sign-up:** everything is open to read; no paywall, email gate or login.
- **Scope:** the fundamentals course is provider-neutral, with its cloud examples on Google Cloud. The GCP course and the labs are Google Cloud only. Planned growth is more tracks for Harbour (e.g. IAM) and possibly more GCP labs; other providers are not planned.
- **Not a template:** Kadé and Harbour are fictional. Neither is a production template, a best-practice reference, or an audit of any real system. Names, addresses and identifiers are invented; public addresses use documentation ranges.
- **Terminology:** course, part, chapter, section, figure (a static drawing), widget (an interactive figure), Kadé; provider, lab, track, view; defect (IDs like D1, D3a), severity (critical, high, medium, low), phase, "as found", phase rail, packet journey, hop, defect register, remediation sequence.
- Harbour has 17 defects (D3 is split into D3a and D3b); the About page and the home page say so.

## Brand Commitments

- Name: **Drydock**. Tagline: "Learn how networks work. Then fix one that doesn’t." (adopted 2026-10-05; in `src/config/site.ts` since the courses shipped). The previous tagline, "Deliberately broken cloud architectures, and how to fix them step by step.", now describes the labs.
- Lab disclaimer: "Harbour is fictional. The shape is real."
- Course story: Kadé, a small online grocery shop in Colombo. The reader is its backend engineer.
- Voice: one author with opinions - first person in the site's own pages and the labs, including disagreeing with textbook answers where a given system warrants it; second person ("you") inside the courses, where the reader plays Kadé's engineer.
- Copy uses a spaced hyphen (" - "), never an em dash.

## Evidence on Hand

- The Harbour network track content in `content/gcp/harbour/network/`: 17 defects with detection and remediation commands, 7 phases (0-6), 6 packet journeys, component sheets, load balancer chains, and the About page's "where I would push back" trade-offs.
- The two courses (being migrated into `content/learn/`): 59 chapters, about 115k words, 63 static diagrams, ~350 tables, ~250 code blocks and ~158 distinct interactive widgets.
- No testimonials, user or reader counts, press, ratings, endorsements or case studies exist. Future work must not invent them.

## Product Principles

1. **Sequence over lists.** Show why the order matters - in a fix and in a lesson - not just what is wrong or what exists.
2. **Verifiable, not asserted.** Every finding is backed by a command that surfaces it and a check that confirms the fix; every concept can be tried by hand in a widget or a real command.
3. **One story, real addresses.** Teach with one consistent fictional company and concrete addresses, never abstract placeholders.
4. **Realistic, never prescriptive.** Defects are the reasonable shortcuts real projects accumulate; the lab is a way to reason, not a template to copy.
5. **Opinionated and honest.** Name trade-offs and disagree with standard advice where the system warrants it.
6. **Open and frictionless.** Static, free and readable without an account.
