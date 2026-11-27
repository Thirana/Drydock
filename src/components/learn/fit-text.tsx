"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Keeps every text inside course drawings within its box. Drawing text is
 * sized for reading (see `legible`); the few texts that then outgrow their
 * box, their zone, or the gap before the next text on their line shrink just
 * enough to fit, never below FLOOR units; a label meant to cross a zone's
 * line gets a ring of page colour; and a free text
 * (a caption or a label outside any box) that runs past the drawing's edge
 * wraps onto more lines, the drawing growing to hold them. Runs again when a
 * widget changes what it draws, and once the web fonts have loaded.
 *
 * Renders nothing: it fits the drawings inside its parent element.
 */

/** Smallest size a fitted text may take, in drawing units. */
const FLOOR = 11;
/** Room kept between a text and its box edge, in drawing units. */
const PAD = 6;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxesOf(svg: SVGSVGElement, vb: DOMRect) {
  const boxes: Box[] = [];
  // Boxes are `rect.n`; zones, blocks, chart bands and the like are not.
  for (const r of svg.querySelectorAll<SVGRectElement>("rect.n")) {
    if (r.closest("defs")) continue;
    const b = r.getBBox();
    if (b.width > 24 && b.height > 16 && b.width < vb.width * 0.9)
      boxes.push({ x: b.x, y: b.y, w: b.width, h: b.height });
  }
  return boxes;
}

/** A text's box in the drawing's own units, transforms included. */
function bboxOf(svg: SVGSVGElement, t: SVGTextElement): Box {
  const b = t.getBBox();
  const ctm = t.getCTM();
  const root = svg.getCTM();
  if (!ctm || !root) return { x: b.x, y: b.y, w: b.width, h: b.height };
  const m = root.inverse().multiply(ctm);
  const p1 = new DOMPoint(b.x, b.y).matrixTransform(m);
  const p2 = new DOMPoint(b.x + b.width, b.y + b.height).matrixTransform(m);
  return { x: p1.x, y: p1.y, w: p2.x - p1.x, h: p2.y - p1.y };
}

function anchorOf(t: SVGTextElement) {
  return getComputedStyle(t).textAnchor;
}

/** Undo an earlier pass, so a re-fit starts from the authored state. */
function reset(svg: SVGSVGElement) {
  svg.querySelector(":scope > g[data-fit-layer]")?.remove();
  for (const t of svg.querySelectorAll<SVGTextElement>("text[data-fit]")) {
    t.style.fontSize = t.dataset.fitSize ?? "";
    t.style.visibility = "";
    for (const k of [
      "paint-order",
      "stroke",
      "stroke-width",
      "stroke-linejoin",
    ])
      t.style.removeProperty(k);
    delete t.dataset.fit;
    delete t.dataset.fitSize;
  }
  const h = svg.dataset.fitHeight;
  if (h) {
    const vb = svg.viewBox.baseVal;
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${h}`);
    delete svg.dataset.fitHeight;
  }
}

function mark(t: SVGTextElement) {
  if (t.dataset.fit) return;
  t.dataset.fit = "1";
  t.dataset.fitSize = t.style.fontSize;
}

/** A ring of page colour, so a line the text crosses breaks behind it. */
function halo(t: SVGTextElement) {
  mark(t);
  t.style.setProperty("paint-order", "stroke");
  t.style.setProperty("stroke", "var(--dd-ground)");
  t.style.setProperty("stroke-width", "6px");
  t.style.setProperty("stroke-linejoin", "round");
}

/** Shrink a text so it stays between `left` and `right`. */
function shrink(t: SVGTextElement, b: Box, left: number, right: number) {
  const anchor = anchorOf(t);
  const cx = b.x + b.w / 2;
  const f =
    anchor === "middle"
      ? Math.min((right - cx) / (b.w / 2), (cx - left) / (b.w / 2))
      : anchor === "end"
        ? (b.x + b.w - left) / b.w
        : (right - b.x) / b.w;
  if (!(f > 0) || f >= 1) return;
  const size = parseFloat(getComputedStyle(t).fontSize);
  mark(t);
  t.style.fontSize = `${Math.max(FLOOR, Math.floor(size * f * 10) / 10)}px`;
}

/**
 * Break a free text into lines no wider than `width`; returns the lines added
 * and the wrapped copy. The copy is drawn in a layer of its own and the
 * original hidden, so React's nodes are never rewritten.
 */
function wrap(svg: SVGSVGElement, t: SVGTextElement, width: number) {
  // Only plain texts at the drawing's top level of transforms.
  if (t.children.length) return null;
  const root = svg.getCTM();
  const ctm = t.getCTM();
  if (root && ctm && (root.e !== ctm.e || root.f !== ctm.f || root.a !== ctm.a))
    return null;
  const words = (t.textContent ?? "").split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const ns = "http://www.w3.org/2000/svg";
  let layer = svg.querySelector<SVGGElement>(":scope > g[data-fit-layer]");
  if (!layer) {
    layer = document.createElementNS(ns, "g");
    layer.dataset.fitLayer = "1";
    layer.setAttribute("aria-hidden", "true");
    svg.append(layer);
  }
  const copy = t.cloneNode(false) as SVGTextElement;
  copy.removeAttribute("data-fit");
  layer.append(copy);
  mark(t);
  t.style.visibility = "hidden";
  const x = t.getAttribute("x") ?? "0";
  let line = document.createElementNS(ns, "tspan");
  line.setAttribute("x", x);
  copy.append(line);
  let lines = 1;
  for (const word of words) {
    const before = line.textContent ?? "";
    line.textContent = before ? `${before} ${word}` : word;
    if (before && line.getComputedTextLength() > width) {
      line.textContent = before;
      line = document.createElementNS(ns, "tspan");
      line.setAttribute("x", x);
      line.setAttribute("dy", "1.3em");
      line.textContent = word;
      copy.append(line);
      lines++;
    }
  }
  return { added: lines - 1, copy };
}

function fit(svg: SVGSVGElement) {
  reset(svg);
  const vb = svg.viewBox.baseVal;
  if (!vb || !vb.width) return;
  const boxes = boxesOf(svg, vb);
  const zones = [...svg.querySelectorAll<SVGRectElement>("rect.zone")].map(
    (r) => {
      const b = r.getBBox();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    },
  );
  const texts = [...svg.querySelectorAll<SVGTextElement>("text")].flatMap(
    (t) => {
      if (!t.textContent?.trim()) return [];
      try {
        return [{ t, b: bboxOf(svg, t) }];
      } catch {
        return [];
      }
    },
  );
  let bottom = vb.y + vb.height;

  for (const { t, b } of texts) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const inside = (r: Box, x: number) =>
      x >= r.x && x <= r.x + r.w && cy >= r.y && cy <= r.y + r.h;
    const smallest = (rs: Box[]) => rs.sort((p, q) => p.w * p.h - q.w * q.h)[0];
    // What holds the text: its box, else the zone it starts in, else the
    // drawing itself.
    const own = smallest(boxes.filter((r) => inside(r, cx)));
    const zone = own
      ? undefined
      : smallest(zones.filter((r) => inside(r, b.x + 1)));
    const frame = own ?? zone;
    let left = frame ? frame.x + PAD : vb.x + 2;
    const right = frame ? frame.x + frame.w - PAD : vb.x + vb.width - 2;
    // Columns: a text keeps clear of the next text on its line, always.
    let column = Infinity;
    if (anchorOf(t) === "start")
      for (const o of texts) {
        const oy = o.b.y + o.b.h / 2;
        if (
          o.t !== t &&
          o.b.x > b.x + 4 &&
          Math.abs(oy - cy) < Math.min(b.h, o.b.h) / 2
        )
          column = Math.min(column, o.b.x - 8);
      }
    left = Math.min(left, b.x);
    if (b.x + b.w > column + 0.5) {
      shrink(t, b, left, Math.min(right, column));
      continue;
    }
    if (b.x + b.w <= right + 0.5 && b.x >= left - 0.5) continue;

    if (own) {
      shrink(t, b, left, right);
      continue;
    }
    if (zone) {
      // A small overrun is a zone label that grew; a large one is a label on
      // a wire meant to cross the zone's line, and stays as drawn.
      if ((right - b.x) / b.w >= 0.85) shrink(t, b, left, right);
      else halo(t);
      continue;
    }
    // A free sentence too long for the drawing wraps; a short label shrinks.
    const room = right - Math.max(b.x, vb.x + 2);
    const wrapped = b.w > room * 1.25 ? wrap(svg, t, room) : null;
    if (wrapped?.added) {
      const after = bboxOf(svg, wrapped.copy);
      bottom = Math.max(bottom, after.y + after.h + 6);
    } else shrink(t, b, left, right);
  }

  if (bottom > vb.y + vb.height + 0.5) {
    svg.dataset.fitHeight = String(vb.height);
    svg.setAttribute(
      "viewBox",
      `${vb.x} ${vb.y} ${vb.width} ${Math.ceil(bottom - vb.y)}`,
    );
  }
}

export function FitText() {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    let frame = 0;
    let fitting = false;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        fitting = true;
        for (const svg of host.querySelectorAll<SVGSVGElement>(".dd-fig svg"))
          fit(svg);
        // Our own edits come back as mutations; ignore those.
        observer.takeRecords();
        fitting = false;
      });
    };
    const observer = new MutationObserver(() => {
      if (!fitting) run();
    });
    // First pass before paint, so most texts never show unfitted.
    for (const svg of host.querySelectorAll<SVGSVGElement>(".dd-fig svg"))
      fit(svg);
    observer.observe(host, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    void document.fonts?.ready.then(run);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <span ref={ref} hidden />;
}
