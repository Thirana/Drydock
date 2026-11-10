"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { arrowHead } from "../../diagram-defs";
import { Choices, Rich, WidgetNote } from "../ui";
import { WidgetFrame } from "../widget-frame";
import { Result, type Tone } from "./case-explorer";
import { Box, Drawing, T, Wire } from "./draw";

/* Chapter 12.4 · Cloud CDN. */

// ── One response, three cache modes ────────────────────────────────────────

const DEFAULT_TTL = 3600;
const MAX_TTL = 86400;
const CLIENT_TTL = 3600;

type Mode = "CACHE_ALL_STATIC" | "USE_ORIGIN_HEADERS" | "FORCE_CACHE_ALL";

type Resp = {
  k: string;
  url: string;
  type: string;
  /** The origin's Cache-Control header, if it sends one. */
  cc?: string;
  isStatic?: boolean;
  maxAge?: number;
  blocked?: boolean;
  personal?: boolean;
};

const RESPONSES: Resp[] = [
  { k: "Resized photo, no header", url: "/media/rice-640w.jpg", type: "image/jpeg", isStatic: true },
  { k: "Versioned script", url: "/assets/app.3f9c.js", type: "text/javascript", cc: "public, max-age=31536000", isStatic: true, maxAge: 31536000 },
  { k: "Home page, with a header", url: "/index.html", type: "text/html", cc: "public, max-age=300", maxAge: 300 },
  { k: "Home page, no header", url: "/index.html", type: "text/html" },
  { k: "Product list from the API", url: "/api/products", type: "application/json", cc: "no-store", blocked: true },
  { k: "One shopper's orders", url: "/api/orders", type: "application/json", cc: "private", blocked: true, personal: true },
];

function span(seconds: number) {
  if (seconds >= 31536000) return "1 year";
  if (seconds >= 86400) return seconds === 86400 ? "1 day" : `${seconds / 86400} days`;
  if (seconds >= 3600) return seconds === 3600 ? "1 hour" : `${seconds / 3600} hours`;
  return `${seconds / 60} minutes`;
}

type Verdict = { stored: boolean; edge?: number; browser?: number; why: string; tone: Tone };

function decide(r: Resp, mode: Mode): Verdict {
  if (mode === "FORCE_CACHE_ALL") {
    const why = r.personal
      ? "This mode ignores <code>private</code>. The first shopper's orders are stored and <b>handed to the next shopper</b> who asks for the same URL. This is the mistake section 10 is about."
      : r.blocked
        ? "The app said <code>no-store</code> and this mode ignores it. Shoppers see a product list up to an hour old, whatever the app wanted."
        : "This mode ignores the origin's headers. Everything is stored for the <b>default TTL</b>, and browsers are told the <b>client TTL</b>.";
    return { stored: true, edge: DEFAULT_TTL, browser: CLIENT_TTL, why, tone: r.personal ? "fault" : r.blocked ? "warn" : "ok" };
  }
  if (r.blocked)
    return {
      stored: false,
      why: `The origin said <code>${r.cc}</code>, and this mode obeys it. Every request goes to the backend, which is what you want here.`,
      tone: "ok",
    };
  if (mode === "USE_ORIGIN_HEADERS") {
    if (r.maxAge)
      return {
        stored: true,
        edge: r.maxAge,
        browser: r.maxAge,
        why: "The origin said <code>public</code> with a <code>max-age</code>, so it is stored for exactly that long. The three TTL settings do not apply in this mode.",
        tone: "ok",
      };
    return {
      stored: false,
      why: "The origin sent no <code>Cache-Control</code>, and this mode caches only what the origin asks for. Nothing is stored, even though it is a static file.",
      tone: r.isStatic ? "warn" : "ok",
    };
  }
  if (r.maxAge) {
    const edge = Math.min(r.maxAge, MAX_TTL);
    const browser = Math.min(r.maxAge, CLIENT_TTL);
    return {
      stored: true,
      edge,
      browser,
      why:
        edge < r.maxAge
          ? `The origin asked for ${span(r.maxAge)}. The <b>max TTL</b> cuts that to ${span(edge)} at the edge, and the <b>client TTL</b> to ${span(browser)} in browsers. Raise both if you want versioned files kept longer.`
          : `The origin asked for ${span(r.maxAge)}, which is under both caps, so the edge and browsers keep it for ${span(r.maxAge)}.`,
      tone: "ok",
    };
  }
  if (r.isStatic)
    return {
      stored: true,
      edge: DEFAULT_TTL,
      browser: CLIENT_TTL,
      why: "No header from the origin, but the content type is a static one, so it is stored anyway, for the <b>default TTL</b>. This is why a bucket of images works with no setup.",
      tone: "ok",
    };
  return {
    stored: false,
    why: "No header, and HTML is not on the list of static content types. Nothing is stored. To cache a page in this mode, the origin must send <code>Cache-Control</code>.",
    tone: "ok",
  };
}

/** Pick a response and a cache mode: is it stored, and for how long? */
export function CdnDecide() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("CACHE_ALL_STATIC");
  const r = RESPONSES[index];
  const v = decide(r, mode);
  const words = v.stored
    ? `Stored at the edge for ${span(v.edge!)}. Browsers keep it for ${span(v.browser!)}.`
    : "Not stored. Every request goes to the origin.";
  return (
    <WidgetFrame wide label="What does Cloud CDN do with this response?">
      <Choices label="Response" value={index} onChange={setIndex} options={RESPONSES.map((x, i) => ({ value: i, label: x.k }))} />
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-ink-muted text-[14px]">Cache mode</span>
        <Choices
          label="Cache mode"
          value={mode}
          onChange={setMode}
          options={(["CACHE_ALL_STATIC", "USE_ORIGIN_HEADERS", "FORCE_CACHE_ALL"] as const).map((m) => ({ value: m, label: m }))}
        />
      </div>
      <div className="mt-4 space-y-3" aria-live="polite">
        <Drawing h={132} label={`${r.url} with ${r.cc ? `Cache-Control ${r.cc}` : "no Cache-Control header"} under ${mode}: ${words}`}>
          <Box x={16} y={16} w={330} h={100} c="blue" />
          <T x={30} y={40} k="t">{`origin sends ${r.url}`}</T>
          <T x={30} y={66}>{`Content-Type: ${r.type}`}</T>
          <T x={30} y={90} k={r.cc ? "s" : "f"}>{r.cc ? `Cache-Control: ${r.cc}` : "no Cache-Control header"}</T>

          <Wire x1={346} y1={66} x2={417} y2={66} c={v.stored ? "green" : undefined} dash={!v.stored} />
          <Box x={420} y={16} w={240} h={100} c={v.stored ? (v.tone === "fault" ? "red" : "purple") : undefined} className={v.stored ? undefined : "off"} />
          <T x={434} y={40} k="t">edge cache</T>
          <T x={434} y={66} bold>{v.stored ? `keeps it ${span(v.edge!)}` : "does not keep it"}</T>
          <T x={434} y={90} k="f">{v.stored ? "then asks the origin again" : "passes it through"}</T>

          <Wire x1={660} y1={66} x2={721} y2={66} c={v.stored ? "green" : undefined} />
          <Box x={724} y={16} w={220} h={100} />
          <T x={738} y={40} k="t">browser</T>
          <T x={738} y={66} bold>{v.stored ? `keeps it ${span(v.browser!)}` : r.personal ? "this shopper only" : "does not keep it"}</T>
          <T x={738} y={90} k="f">{v.stored ? "no request at all" : "as the origin said"}</T>
        </Drawing>
        <Result tone={v.tone}>
          <b>{words}</b>
        </Result>
        <p className="text-ink-body max-w-[72ch] text-[16px] leading-[1.6] text-pretty">
          <Rich text={v.why} />
        </p>
      </div>
      <WidgetNote>The TTL settings here are the defaults: default TTL 1 hour, max TTL 1 day, client TTL 1 hour.</WidgetNote>
    </WidgetFrame>
  );
}

// ── The cache key ──────────────────────────────────────────────────────────

type KeyMode = "all" | "w" | "none";

const ASKS = [
  { query: "?fmt=webp", w: "webp" },
  { query: "?fmt=webp&utm_source=mail", w: "webp" },
  { query: "?fmt=webp&utm_source=insta", w: "webp" },
  { query: "?fmt=avif", w: "avif" },
];
const PATH = "/media/rice-640w.jpg";
const NAME: Record<string, string> = { webp: "WebP", avif: "AVIF" };

function keyOf(ask: (typeof ASKS)[number], mode: KeyMode) {
  return mode === "all" ? PATH + ask.query : mode === "w" ? `${PATH}?fmt=${ask.w}` : PATH;
}

const KEY_TAKE: Record<KeyMode, string> = {
  all: "The default. The two links from the mail and Instagram campaigns ask for the same WebP image, but their URLs differ, so each is stored separately and each costs a trip to <code>kade-media</code>. Nothing is wrong, the cache is just used badly.",
  w: "Only <code>fmt</code> changes the file, so only <code>fmt</code> goes in the key. The three WebP requests share one entry, and the AVIF one gets its own. Fewer misses, and every shopper gets the right file.",
  none: "One entry for everything. The first request stored the WebP image, so the browser that asked for AVIF <b>gets WebP</b>. Leaving out a parameter that changes the response serves the wrong thing.",
};

/** Four requests for one image: how many cache entries does each key make? */
export function CdnKey() {
  const [mode, setMode] = useState<KeyMode>("all");
  const keys = ASKS.map((a) => keyOf(a, mode));
  const entries = [...new Set(keys)];
  const row = (i: number) => 14 + i * 56;
  const wrong = (i: number) => mode === "none" && ASKS[i].w !== ASKS[0].w;
  const anyWrong = ASKS.some((_, i) => wrong(i));
  return (
    <WidgetFrame wide label="Four requests, one image: the cache key">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-ink-muted text-[14px]">The key includes</span>
        <Choices
          label="Query string in the key"
          value={mode}
          onChange={setMode}
          options={[
            { value: "all", label: "the whole query string" },
            { value: "w", label: "only fmt" },
            { value: "none", label: "no query string" },
          ]}
        />
      </div>
      <div className="mt-4 space-y-3" aria-live="polite">
        <Drawing h={row(ASKS.length) + 2} label={`Four requests for ${PATH} make ${entries.length} cache ${entries.length === 1 ? "entry" : "entries"}`}>
          {ASKS.map((ask, i) => {
            const first = keys.indexOf(keys[i]);
            const y = row(i) + 22;
            const hue = wrong(i) ? "fault" : "green";
            return (
              <g key={ask.query}>
                <Box x={16} y={row(i)} w={400} h={44} c={wrong(i) ? "red" : undefined} />
                <T x={30} y={row(i) + 27} bold>{PATH + ask.query}</T>
                {first === i ? (
                  <line className="w green" x1={416} y1={y} x2={577} y2={y} markerEnd={arrowHead("green")} />
                ) : (
                  // Joins the trunk of the entry it shares, at the request above it.
                  <path className={cn("w", hue)} d={`M416 ${y} H496 V${row(keys.lastIndexOf(keys[i], i - 1)) + 22}`} />
                )}
              </g>
            );
          })}
          {entries.map((key) => {
            const i = keys.indexOf(key);
            const size = NAME[ASKS[i].w];
            return (
              <g key={key}>
                <Box x={580} y={row(i)} w={364} h={44} c="purple" />
                <T x={594} y={row(i) + 19} bold>{key}</T>
                <T x={594} y={row(i) + 36} k="f" size={11.5}>{`holds the ${size} image`}</T>
              </g>
            );
          })}
        </Drawing>
        <Result tone={anyWrong ? "fault" : mode === "all" ? "warn" : "ok"}>
          <b>
            4 requests · {entries.length} cache {entries.length === 1 ? "entry" : "entries"} · {entries.length} {entries.length === 1 ? "trip" : "trips"} to the origin
            {anyWrong ? " · 1 shopper gets the wrong file" : ""}
          </b>
        </Result>
        <p className="text-ink-body max-w-[72ch] text-[16px] leading-[1.6] text-pretty">
          <Rich text={KEY_TAKE[mode]} />
        </p>
      </div>
      <WidgetNote>Left: what shoppers ask for. Right: what the edge stores. Requests that join one line share one stored copy.</WidgetNote>
    </WidgetFrame>
  );
}
