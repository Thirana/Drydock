# Step 0 - Extract the sources into workable files

**Status: done 2026-10-05.** Re-run any time with `python3 doc/tools/extract.py` (from the repo root). It exits non-zero and prints `PROBLEM:` lines if a chapter has no ledger slug or a widget has no builder.

Notes for later steps:
- GCP widgets are minified: the builders object is `y` and the wiring object is `w` in `doc/extract/gcp/widgets.js`. Many GCP builders are `() => ""` stubs; the real work is in `w.<name>(el, dataset)`.
- Fundamentals: builders are `figs.<name>(dataset)`, wiring is `inits.<name>(el, dataset)`.
- `index.json` per chapter: `num, title, slug, file, part, partName, lead, sections[{id,title}], counts{svg,tables,pre,h2}, widgets[{name, attrs}]`. Steps 3, 4 and 7 (coverage) read it.

Size: S. Output lives in `doc/extract/` (gitignored, temporary, deleted in step 7).

## Why

The sources are two single-file apps. The GCP file stores its chapters gzip+base64 inside `<script id="tplz" type="text/plain">`, and its widget code is minified. Every later session needs readable, per-chapter input, and nobody should have to decode the files again.

## Do

1. Write `doc/tools/extract.py` (or `.mjs`). It should:
   - read both HTML files;
   - for the GCP file, decode `script#tplz` (`base64 → gunzip`) to get the `<template class="chapter">` markup;
   - write one file per chapter: `doc/extract/<course>/<num>-<slug>.html` (slugs from `doc/plan/ledger.md`), keeping the `data-*` attributes;
   - write `doc/extract/<course>/widgets.js`: the `figs`/`inits` script, run through Prettier so the minified GCP code is readable;
   - write `doc/extract/<course>/styles.css`: the source CSS, for reference while porting widget visuals;
   - write `doc/extract/<course>/index.json`: `[{ num, title, part, partName, slug, widgets: [{ name, attrs }] }]`.
2. Keep both original HTML files untouched until step 7. They are also the visual reference: open them in a browser side by side with the new pages.

## Part names (from the sources' `SECTIONS`)

- Fundamentals: 0 Start here · 1 Addressing and local delivery · 2 Layers, routing and transport · 3 Application protocols · 4 Network building blocks · 5 Putting it together
- GCP: 0 Start here · 1 Foundations · 2 Controlling access · 3 Leaving and reaching privately · 4 The front door · 5 Growing out · 6 Running it

## Done when

- Every chapter row in `ledger.md` has a matching extracted HTML file.
- `widgets.js` for each course is readable, and each widget name in `index.json` has a `figs` (and possibly `inits`) entry in it.
