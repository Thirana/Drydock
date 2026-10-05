"use client";

import { useId, useState } from "react";
import {
  intToIp,
  ipError,
  ipToInt,
  networkOf,
  parsePrefix,
} from "@/lib/net/ipv4";
import { BitRow } from "./bits";
import { Field, FieldError } from "./field";
import { WidgetFrame } from "./widget-frame";

/** Same network or not? The check a sender makes before every packet. */
export function SameNet({
  a: initialA,
  b: initialB,
  prefix: initialPrefix,
  wide,
}: {
  a: string;
  b: string;
  prefix: string;
  wide?: boolean;
}) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [prefixText, setPrefixText] = useState(initialPrefix);
  const errorId = useId();

  const errorA = ipError(a);
  const errorB = ipError(b);
  const prefix = parsePrefix(prefixText);
  const error =
    (errorA && `Sender IP: ${errorA}`) ||
    (errorB && `Target IP: ${errorB}`) ||
    (prefix === undefined
      ? "The prefix must be a number from 0 to 32."
      : undefined);

  return (
    <WidgetFrame wide={wide} label="Same network or not?">
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        <Field
          label="Sender IP"
          value={a}
          onChange={setA}
          invalid={!!errorA}
          describedBy={errorId}
        />
        <Field
          label="Target IP"
          value={b}
          onChange={setB}
          invalid={!!errorB}
          describedBy={errorId}
        />
        <Field
          label="Sender's prefix"
          value={prefixText}
          onChange={setPrefixText}
          invalid={prefix === undefined}
          describedBy={errorId}
          inputMode="numeric"
          short
        />
      </div>
      <div className="mt-6" aria-live="polite">
        {error ? (
          <FieldError id={errorId}>{error}</FieldError>
        ) : (
          <Result a={ipToInt(a)!} b={ipToInt(b)!} prefix={prefix!} />
        )}
      </div>
    </WidgetFrame>
  );
}

function Result({ a, b, prefix }: { a: number; b: number; prefix: number }) {
  const na = networkOf(a, prefix);
  const nb = networkOf(b, prefix);
  const same = na === nb;
  return (
    <>
      <div className="min-w-[700px] space-y-2" aria-hidden="true">
        {[
          ["sender AND mask", na],
          ["target AND mask", nb],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="grid grid-cols-[124px_auto_minmax(120px,1fr)] items-center gap-3"
          >
            <span className="text-ink-muted font-mono text-[12.5px]">
              {label}
            </span>
            <BitRow value={value as number} prefix={prefix} split />
            <span className="text-ink font-mono text-[14px] font-bold">
              {intToIp(value as number)}
            </span>
          </div>
        ))}
      </div>
      <p className="border-rule text-ink mt-5 border-t pt-4 text-[16.5px] leading-[1.55] font-semibold text-pretty">
        {same
          ? `Same network (${intToIp(na)}/${prefix}). Send directly: ARP for ${intToIp(b)}.`
          : `Different networks (${intToIp(na)} vs ${intToIp(nb)}). Send to the default gateway (in GCP this is ${intToIp(na + 1)}).`}
      </p>
    </>
  );
}
