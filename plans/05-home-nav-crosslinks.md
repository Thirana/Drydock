# Step 5 - Home page, navigation, course pages, Harbour as capstone

**Status: done 2026-10-09.** What shipped, and where it differs from the plan below:

- **Decisions (author):** hero is the tagline ("Learn how networks work. Then fix one that doesn’t."), button "Start with chapter 1", ghost "Jump to GCP". Home keeps a short Harbour section; the long walkthrough (As found, Find, Order, Fix) moved to the lab page `/gcp/harbour`. Header CTA is "Start learning" (fundamentals ch 1), not shown inside `/learn`. Labs is a new `/labs` page.
- **Home:** hero + learning path (`src/components/learn/path.tsx`: `LearningPath`, `CourseParts`), a live `SameNet` from ch 4, both courses' parts, Harbour (HeroMap score + D-x in three steps + Open Harbour / register). "Every angle" and "Start at move 0" were dropped: the lab page already lists the views.
- **Cross-links:** `learn?: ChapterRef[]` on each Harbour defect (`content/gcp/harbour/network/model/defects.ts`, 31 refs to GCP sections by heading text). `src/lib/content/crosslinks.ts` resolves them (build fails on an unknown chapter): `lessonsByDefect` → "Learn it" row in the register; `practiceFor` → "See it broken" block at the end of each linked chapter. Heading anchors come from `src/lib/content/heading-id.ts`, shared with the chapter `h2`.
- **"Builds on"** was already there per section (`<Recalls>`), so no chapter-level line was added.
- **Harbour views** get "New to this? Learn it first in Networking on GCP" under the lead (course chosen by provider slug).
- **Pager:** after GCP 18.2 the next move is Harbour.
- **Header:** current section marked (ink, blue underline); track pages now use the main links too (the view strip already names the lab).
- **Footer:** Learn, Labs, Tracks columns; tagline under the wordmark. `lab-card.tsx` and `section-intro.tsx` deleted (unused).
- **Metadata:** `site.ts` has `tagline` + new description; root `openGraph`; chapters get `openGraph` type article. **Sitemap not done:** it needs the site's absolute URL, which is not known yet.
- Section-level links were checked once with a script; a renamed `##` heading breaks its anchor silently.

Size: L. Runs after both courses exist, so the home page shows real content. Run `/impeccable` for the home page (Persuade opening) and the course index pages (Read).

## 1. The learning path as the site's spine

The site already has a strong device: the **score**, a line of numbered moves. Use it at the largest scale too:

```
1. Networking fundamentals     2. Networking on GCP          3. Fix a broken platform
   35 chapters · from one         24 chapters · how Google      Harbour · 17 defects,
   request to TCP, DNS, TLS       Cloud really does it          fixed in order
```

This line appears on the home page and on `/learn`, and it is the order in the pager (fundamentals 34 → GCP 0 → Harbour).

## 2. Home page (rewrite of `src/app/page.tsx`)

Keep the visual world. Proposed order:

1. **Hero** - new headline and lead about learning networking end to end and then fixing a broken platform. Same type scale, one ink button ("Start with chapter 1"), one ghost link ("Jump to GCP"). The author writes the copy; propose 2-3 options, in first person, " - " not em dashes.
2. **The path** - the three-move line above, each move linking to its course or lab.
3. **A taste of a chapter** - one real widget running live (suggestion: `samenet` or `cidrcalc` from chapter 3/4) with a short caption and a link into the chapter. This shows on the first visit what the courses feel like.
4. **What is in the courses** - the parts of both courses as two ruled lists (part name + chapter count), not cards.
5. **Prove it on Harbour** - a condensed version of today's home content: the score (`HeroMap`) and "Follow D-x from finding to fix". Move the longer walkthrough sections (As found, Find, Order, Fix, Every angle) to the Harbour lab page, or keep a shorter version here. Decide with the author.
6. Footer.

## 3. Navigation

- **Top bar:** Fundamentals · GCP · Labs, then search (step 6) and theme toggle. Current section in ink with the blue underline, matching the view strip.
- **`/learn`** - the path plus both courses' part lists.
- **`/learn/<course>`** - course index: lead, "Continue" (step 6), parts with chapters as numbered rows, the Kadé reference first.
- **`/labs` or `/#labs`** - list of labs (Harbour today). A `/labs` page is cleaner now that the home page has more to say. `/gcp` provider page stays and links there.
- Harbour pages get a quiet line under the view strip: "New to this? Learn it in Networking on GCP".

## 4. Cross-links between Harbour and the courses

- Add `teaches?: { course: string; chapter: string; section?: string }[]` to Harbour defects (`content/gcp/harbour/network/model/defects.ts`). Fill it by matching each defect's `concept` to GCP chapters (for example firewall scoping → 5.1 "The scoping trap"; IAP → 6.1; Cloud NAT → 7; Private Service Connect → 9; Cloud Run ingress → 10; LB/XFF → 12.1).
- **Defect register:** show "Learn it: GCP 5.1 Firewall rules" in the opened row.
- **Chapter page:** the "Practise this" block lists the Harbour defects that point at this chapter ("See it broken: D4 in Harbour"). Derive it from the defects, so the links are written once.
- **"Builds on"** under GCP chapter titles, from the `<Ch course="fundamentals">` references collected in step 4.

## 5. Metadata

Site description and `site.ts` updated to the new tagline. Per-chapter titles/descriptions, Open Graph text, and a static `sitemap.xml` (Next can generate it at build time in export mode; check the Next 16 docs).

## Done when

The home page, `/learn`, both course pages, `/labs` and the header reflect the three-stage guide. Every Harbour defect links to at least one chapter, and those chapters link back.
