import type { MDXComponents } from "mdx/types";
import { isValidElement, type ReactNode } from "react";
import { SeverityBadge } from "@/components/architecture/severity-badge";
import {
  AddressBlock,
  AddressBlocks,
  Argument,
  Arguments,
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
/** Plain text of a React node, for building heading anchors. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return `${node}`;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

/** "Where I would push back" → "where-i-would-push-back". */
function slugOf(node: ReactNode) {
  return textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const components: MDXComponents = {
  h2: ({ children }) => (
    <h2
      id={slugOf(children)}
      className="dd-head text-ink border-rule mt-20 mb-6 max-w-[760px] scroll-mt-24 border-t pt-10 text-[30px] first:mt-0 first:border-t-0 first:pt-0 sm:text-[34px]"
    >
      {children}
    </h2>
  ),
  table: (props) => (
    <div className="my-8 overflow-x-auto">
      <table
        {...props}
        className="w-full min-w-[640px] border-collapse text-left"
      />
    </div>
  ),
  AddressBlock,
  AddressBlocks,
  Argument,
  Arguments,
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
