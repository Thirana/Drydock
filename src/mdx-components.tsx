import type { MDXComponents } from "mdx/types";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import {
  AddressBlock,
  AddressBlocks,
  Caption,
  Column,
  Columns,
  Hero,
  Lede,
  Note,
  PhaseTag,
  Status,
} from "@/components/mdx/primitives";

// Global MDX components. Most elements are styled by `.gl-prose` in
// globals.css; h2 and tables need markup of their own. Track-specific
// components (map, register, …) are bound to their data by the view page.
const components: MDXComponents = {
  h2: ({ children }) => (
    <div className="mt-12 mb-6 flex items-center gap-4 first:mt-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          aria-hidden="true"
          className="bg-gl-primary h-[18px] w-[3px] shrink-0 rounded-full"
        />
        <h2 className="text-gl-text text-[15px] font-bold tracking-[-0.015em] text-balance">
          {children}
        </h2>
      </div>
      <div
        aria-hidden="true"
        className="border-gl-border min-w-0 flex-1 border-t"
      />
    </div>
  ),
  table: (props) => (
    <div className="border-gl-border bg-gl-surface shadow-gl my-6 overflow-x-auto rounded-xl border">
      <table
        {...props}
        className="w-full min-w-[560px] border-collapse text-left text-[13.5px]"
      />
    </div>
  ),
  AddressBlock,
  AddressBlocks,
  Caption,
  Column,
  Columns,
  Hero,
  Lede,
  Note,
  PhaseTag,
  SeverityBadge,
  Status,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
