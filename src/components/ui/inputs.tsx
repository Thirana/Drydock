"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { IconCheck, IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/*
 * The site's own form controls, in place of the browser's: a dropdown, a
 * checkbox and a slider. Square (2px), flat, hairlines and ink; blue only for
 * focus and the thing being pressed.
 */

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A choice from a list, opened under its field. Follows the "select-only
 * combobox" pattern: focus stays on the field, arrows move through the list,
 * Enter or Space picks, Escape closes, letters jump to a match. The list sits
 * in the top layer, so a scrolling widget frame never clips it.
 */
export function Dropdown<T extends string>({
  value,
  onChange,
  options,
  label,
  labelledBy,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  /** An accessible name, when no visible label names the field. */
  label?: string;
  /** The id of a visible label. */
  labelledBy?: string;
  className?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-${i}`;
  const fieldRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const [active, setActive] = useState(selectedIndex);
  const selected = options[selectedIndex];

  function show(at = selectedIndex) {
    setActive(at);
    setOpen(true);
  }

  function choose(i: number) {
    const option = options[i];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
  }

  /** The next option, after the active one, whose label starts with `key`. */
  function match(key: string, from: number) {
    const k = key.toLowerCase();
    for (let step = 1; step <= options.length; step++) {
      const i = (from + step) % options.length;
      if (options[i].label.toLowerCase().startsWith(k)) return i;
    }
    return -1;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1;
    const { key } = event;
    if (key.length === 1 && key !== " " && /\S/.test(key)) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const i = match(key, open ? active : selectedIndex);
      if (i < 0) return;
      event.preventDefault();
      if (open) setActive(i);
      else show(i);
      return;
    }
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        event.preventDefault();
        show();
      } else if (key === "Home" || key === "End") {
        event.preventDefault();
        show(key === "Home" ? 0 : last);
      }
      return;
    }
    if (key === "ArrowDown") setActive((a) => Math.min(last, a + 1));
    else if (key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (key === "Home" || key === "PageUp") setActive(0);
    else if (key === "End" || key === "PageDown") setActive(last);
    else if (key === "Enter" || key === " ") choose(active);
    else if (key === "Escape") {
      // Close only the list, not an expanded figure or dialog around it.
      event.stopPropagation();
      setOpen(false);
    } else if (key === "Tab") {
      setOpen(false);
      return;
    } else return;
    event.preventDefault();
  }

  // Lift the list into the top layer and keep it pinned under the field.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    const list = listRef.current;
    if (!open || !field || !list) return;
    const place = () => {
      const r = field.getBoundingClientRect();
      list.style.minWidth = `${r.width}px`;
      const h = list.offsetHeight;
      const below = window.innerHeight - r.bottom;
      const up = below < h + 12 && r.top > below;
      list.style.top = `${up ? r.top - h - 4 : r.bottom + 4}px`;
      list.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - list.offsetWidth - 8))}px`;
    };
    list.showPopover?.();
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  // Keep the active option in view as the arrows move through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-i="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  return (
    <>
      <div
        ref={fieldRef}
        role="combobox"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-label={label}
        aria-labelledby={labelledBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        className={cn(
          "bg-ground text-ink inline-flex h-11 min-w-[220px] cursor-pointer items-center justify-between gap-3 rounded-[2px] border px-3 text-[15px] transition-colors duration-150 select-none",
          open ? "border-ink" : "border-rule-strong hover:border-ink-faint",
          className,
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <IconChevronDown
          size={12}
          className={cn(
            "text-ink-muted transition-transform duration-200",
            open && "text-ink rotate-180",
          )}
        />
      </div>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          popover="manual"
          aria-label={label}
          aria-labelledby={labelledBy}
          // Keep focus on the field, so a click on the list is not a blur.
          onMouseDown={(event) => event.preventDefault()}
          className="bg-ground text-ink-body border-ink inset-auto m-0 max-h-[min(320px,50vh)] max-w-[calc(100vw-16px)] overflow-y-auto rounded-[2px] border p-1 text-[15px]"
        >
          {options.map((o, i) => {
            const isSelected = i === selectedIndex;
            return (
              <li
                key={o.value}
                id={optionId(i)}
                data-i={i}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(i)}
                onMouseMove={() => i !== active && setActive(i)}
                className={cn(
                  "grid min-h-10 cursor-pointer grid-cols-[14px_minmax(0,1fr)] items-center gap-x-2.5 rounded-[2px] py-2 pr-4 pl-2.5 leading-[1.35]",
                  i === active && "bg-sunk text-ink",
                  isSelected && "text-ink font-semibold",
                )}
              >
                <span aria-hidden="true">
                  {isSelected && <IconCheck size={12} />}
                </span>
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/** A box to tick, with its words; the whole line is the target. */
export function Checkbox({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group/cb text-ink-body relative flex cursor-pointer items-center gap-2.5 text-[15px]",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="border-rule-strong bg-ground text-ground group-hover/cb:border-ink peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-accent grid size-[18px] shrink-0 place-items-center rounded-[2px] border transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-solid [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <IconCheck size={12} />
      </span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}

/** A value along a range: a ruled track filled in ink up to a square handle. */
export function Slider({
  id,
  min,
  max,
  step,
  value,
  onChange,
  className,
}: {
  id?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      style={{ "--dd-fill": `${fill}%` } as CSSProperties}
      className={cn("dd-range", className)}
    />
  );
}
