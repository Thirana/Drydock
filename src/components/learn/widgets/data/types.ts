/** Shapes of the data extracted from the course notes (see doc/tools/widget-data.mjs). */

/** One row of a two-lane sequence diagram. */
export interface SeqRow {
  /** "r": left to right, "l": right to left, "note": a line of text across. */
  d: "r" | "l" | "note";
  t: string;
  /** Source colour of the arrow (orange by default). */
  c?: string;
  /** A second line under the label. */
  s?: string;
  /** The arrow never arrives. */
  lost?: boolean;
  /** Connection state on the left (client) and right (server) after this row. */
  cs?: string;
  ss?: string;
  /** For step-through diagrams: what this step means. */
  x?: string;
}

export type SeqSet = [left: string, right: string, rows: SeqRow[]];

export interface SeqSim {
  n: string;
  rows: SeqRow[];
  x: string;
}

/** A routing table row: destination, next hop, interface, note. */
export type RouteRow = [string, string, string, string];

export interface RouteHop {
  t: string;
  tb: RouteRow[];
  /** Index of the chosen row. */
  w: number;
  dec: string;
  fs: string;
  fd: string;
  ps: string;
  pd: string;
  ttl: string;
}

export interface TraceHop {
  c: string;
  ip: string | null;
  rtt?: string[];
  dest?: boolean;
}
