/**
 * The architecture-lab content model.
 *
 * A lab is a deliberately broken architecture plus the ordered sequence of
 * phases that repairs it. Only the "as found" state is authored: the state at
 * any later phase is derived by applying the `applies` patches of every defect
 * closed at or before that phase (see `state.ts`).
 */

/** Semantic colour roles. Resolved to CSS custom properties at render time. */
export type Tone =
  | "edge"
  | "compute"
  | "data"
  | "private"
  | "danger"
  | "external"
  | "line"
  | "lineStrong";

export type Severity = "critical" | "high" | "medium" | "low";
export type RiskLevel = "high" | "medium" | "low";
export type NodeKind = "compute" | "data" | "edge" | "ext" | "net";

/** Box side an edge attaches to: left, right, top, bottom. */
export type Side = "l" | "r" | "t" | "b";

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
}

/** A focus filter on the map. `all` and `defects` have special handling. */
export interface Overlay {
  key: string;
  label: string;
  tone?: Tone;
}

/** A scope drawn as a container: org policy, VPC, region, subnet, tenant. */
export interface ArchGroup extends Box {
  tone: Tone;
  dashed?: boolean;
  /** Planned or not built yet. */
  dim?: boolean;
  layers?: string[];
  defects?: string[];
}

/** A component drawn as a box. */
export interface ArchNode extends Box {
  kind: NodeKind;
  dim?: boolean;
  layers?: string[];
  defects?: string[];
}

/** What a closed defect changes about a box. */
export interface BoxPatch {
  sub?: string;
  tone?: Tone;
  dashed?: boolean;
  dim?: boolean;
}

export interface EdgePatch {
  tone?: Tone;
  dashed?: boolean;
  dim?: boolean;
}

export interface ArchEdge {
  from: string;
  to: string;
  fromSide: Side;
  toSide: Side;
  /** Offset along the side, from the box's top/left. Defaults to the midpoint. */
  fromOffset?: number;
  toOffset?: number;
  /** Explicit waypoints. Without them the edge is routed orthogonally. */
  via?: Point[];
  label?: string;
  tone: Tone;
  dashed?: boolean;
  dim?: boolean;
  layers: string[];
  /** Drawn as a defective path in the defects overlay. */
  defect?: boolean;
  /** Removed once this defect is closed. */
  closedBy?: string;
  /** Only exists once this defect is closed. */
  opensWith?: string;
  /** Restyled once this defect is closed. */
  changedBy?: { defect: string; set: EdgePatch };
}

export interface Phase {
  number: number;
  name: string;
  goal: string;
  /** Why the phase sits where it does in the sequence. */
  rationale?: string;
  changes: string;
  prerequisites: string;
  risk: string;
  riskLevel?: RiskLevel;
  verify: string;
}

export interface Fact {
  label: string;
  value: string;
}

/** The explanation behind one box on the map. Keyed by box id. */
export interface ComponentSheet {
  section: string;
  purpose: string;
  facts: Fact[];
}

export interface Defect {
  id: string;
  title: string;
  /** The concept or module that closes it. */
  topic: string;
  phase: number;
  severity: Severity;
  blockedBy: string[];
  symptom: string;
  explanation: string;
  concept: string;
  /** Command(s) that surface the finding. */
  detection: string;
  before: string;
  after: string;
  /** Command(s) that close it. */
  remediation: string;
  /** Box id → what changes on the map once this defect is closed. */
  applies: Record<string, BoxPatch>;
}

export interface JourneyHop {
  /** Box this hop highlights. Omitted for commentary hops. */
  at?: string;
  /** Shown only while this defect is open. */
  whileOpen?: string;
  /** Shown only once this defect is closed. */
  afterClosed?: string;
  where: string;
  what: string;
  why: string;
  fails?: boolean;
  fixedBy?: string;
}

export interface Journey {
  title: string;
  shortTitle: string;
  summary: string;
  path: string[];
  context?: string[];
  /** Once this defect closes, the `*After` variants replace the originals. */
  switchAt?: string;
  summaryAfter?: string;
  pathAfter?: string[];
  contextAfter?: string[];
  noteAfter?: string;
  hops: JourneyHop[];
}

export interface LoadBalancerLink {
  id: string;
  label: string;
  sub: string;
  defects?: string[];
}

export interface LoadBalancerLane {
  label: string;
  tone: Tone;
  links: LoadBalancerLink[];
}

export interface LoadBalancerDetail {
  title: string;
  subtitle: string;
  position: string;
  rows: Fact[];
  note?: string;
}

/** The proxy load balancer drawn link by link, at its own scale. */
export interface LoadBalancerChain {
  viewBox: { width: number; height: number };
  /** Lanes are laid out on a grid: one row per lane, one column per link. */
  grid: {
    x: number;
    y: number;
    columnStep: number;
    rowStep: number;
    cellWidth: number;
    cellHeight: number;
  };
  lanes: LoadBalancerLane[];
  /** Free-positioned boxes outside the grid. */
  extras: (Box & { tone: Tone; defects?: string[] })[];
  wires: { tone: Tone; points: Point[] }[];
  annotations: { x: number; y: number; lines: string[] }[];
  initialSelection: string;
  details: Record<string, LoadBalancerDetail>;
}

export interface ArchitectureModel {
  /** Accessible name for the diagram. */
  name: string;
  viewBox: { width: number; height: number };
  overlays: Overlay[];
  groups: ArchGroup[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  phases: Phase[];
  componentSections: readonly string[];
  componentSheets: Record<string, ComponentSheet>;
  defects: Defect[];
  journeys: Journey[];
  loadBalancer: LoadBalancerChain;
}
