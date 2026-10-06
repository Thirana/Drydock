"use client";

import { useState } from "react";
import { IconCheck, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import data from "./data/fundamentals.json";
import { Action } from "./ui";
import { WidgetFrame } from "./widget-frame";

/*
 * Quizzes answer in words, never in green and red (DESIGN.md, The Plain
 * Verdict Rule): "Correct" or "Not quite", a drawn icon, and the reason.
 */

/** A verdict line: a drawn icon, the word, and why. */
export function Verdict({ right, answer, why }: { right: boolean; answer?: string; why?: string }) {
  return (
    <p className="text-ink-body mt-2 flex gap-2 text-[15px] leading-[1.5] text-pretty">
      <span className="text-ink mt-[5px] shrink-0" aria-hidden="true">
        {right ? <IconCheck size={11} /> : <IconX size={10} />}
      </span>
      <span>
        <b className="text-ink">{right ? "Correct." : `Not quite: it is ${answer}.`}</b>
        {why && <> {why}</>}
      </span>
    </p>
  );
}

const QZ = data.QZ as [string, string, string][];
const QL = data.QL as Record<string, string>;

/** Which layer does each protocol or device belong to? */
export function LayerQuiz({ wide }: { wide?: boolean }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const done = Object.keys(answers).length;
  const right = Object.entries(answers).filter(([i, a]) => QZ[+i][1] === a).length;
  return (
    <WidgetFrame wide={wide} label="Layer quiz">
      <ol className="space-y-4">
        {QZ.map(([name, correct, why], i) => {
          const a = answers[i];
          return (
            <li key={name} className="border-rule border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-ink min-w-[120px] font-mono text-[15px] font-semibold">{name}</span>
                <span className="flex flex-wrap gap-1.5" role="group" aria-label={`Layer of ${name}`}>
                  {Object.entries(QL).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      disabled={a !== undefined}
                      onClick={() => setAnswers((x) => ({ ...x, [i]: k }))}
                      aria-pressed={a === k}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-1.5 rounded-[2px] border px-2.5 text-[14px] transition-colors",
                        a === undefined && "border-rule-strong text-ink hover:border-ink hover:bg-sunk cursor-pointer",
                        a !== undefined && k === correct && "border-ink bg-ink text-ground font-semibold",
                        a !== undefined && k === a && k !== correct && "border-ink text-ink line-through",
                        a !== undefined && k !== a && k !== correct && "border-rule text-ink-faint",
                      )}
                    >
                      {a !== undefined && k === correct && <IconCheck size={10} />}
                      {label}
                    </button>
                  ))}
                </span>
              </div>
              <div aria-live="polite">
                {a !== undefined && <Verdict right={a === correct} answer={QL[correct]} why={why || undefined} />}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <p className="text-ink-muted text-[14.5px]">
          Score: {right} / {done} answered, of {QZ.length}.
        </p>
        <Action onClick={() => setAnswers({})}>Start over</Action>
      </div>
    </WidgetFrame>
  );
}
