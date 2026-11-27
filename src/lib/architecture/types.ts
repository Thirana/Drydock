/**
 * The architecture-lab content model.
 *
 * A lab is a deliberately broken architecture plus the ordered sequence of
 * phases that repairs it. Only the "as found" state is authored: the state at
 * any later phase is derived by applying the `applies` patches of every defect
 * closed at or before that phase (see `state.ts`).
 */

/**
 * Who a box on a drawing belongs to, in the case study's key: teal is your
 * VPC, plum is run by Google, amber is firewall and access rules. No hue is
 * the outside world.
 */
export type Owner = "teal" | "plum" | "amber";

export type Severity = "critical" | "high" | "medium" | "low";
export type RiskLevel = "high" | "medium" | "low";

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
}

/** How a box sits on the map, as a closed defect can change it. */
interface BoxLook {
  /** Who it belongs to. */
  hue?: Owner;
  /** It is the defect: drawn in red until a patch clears it. */
  fault?: boolean;
  /** Not built yet, or cannot exist yet: a dashed outline. */
  ghost?: boolean;
  /** Exists but is not in use: faded. */
  dim?: boolean;
}

/** A scope drawn as a container: org policy, VPC, region, subnet, tenant. */
export interface ArchGroup extends Box, BoxLook {
  /** A compartment inside a region (a subnet): filled and solid, not dashed. */
  panel?: boolean;
  layers?: string[];
  defects?: string[];
}

/** A component drawn as a box. */
export interface ArchNode extends Box, BoxLook {
  layers?: string[];
  defects?: string[];
}

/** What a closed defect changes about a box. */
export interface BoxPatch extends BoxLook {
  sub?: string;
}

/**
 * How a path is drawn: `ok` is traffic that is allowed and arrives, `broken`
 * a path that should not exist, `idle` one that is not built or not in use.
 */
export type EdgeState = "ok" | "broken" | "idle";

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
  /** What travels the path, as the component sheets list it. */
  label?: string;
  /** Where the map draws the label, centred; without it the map leaves it off. */
  labelAt?: Point;
  /** Defaults to `ok`. */
  state?: EdgeState;
  layers: string[];
  /** Removed once this defect is closed. */
  closedBy?: string;
  /** Only exists once this defect is closed. */
  opensWith?: string;
  /** Redrawn once this defect is closed. */
  changedBy?: { defect: string; state: EdgeState };
}

/**
 * A connection as found that the map does not draw, because it would cross
 * half the map: the component atlas shows it alongside the map's edges.
 */
export interface ArchLink {
  from: string;
  to: string;
  /** What travels it. */
  label: string;
  /** Defaults to `ok`. */
  state?: EdgeState;
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

/** A place in a course: a chapter by slug, and optionally one of its `##` sections by its heading. */
export interface ChapterRef {
  course: string;
  chapter: string;
  section?: string;
}

export interface Defect {
  id: string;
  title: string;
  /** The concept or module that closes it. */
  topic: string;
  phase: number;
  severity: Severity;
  blockedBy: string[];
  /** Course sections that teach what this defect gets wrong, the main one first. */
  learn?: ChapterRef[];
  symptom: string;
  /** What it can cause while it stays open, one consequence per entry. */
  impact: string[];
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
  /** The packet as this hop leaves it. The packet card holds the last one shown. */
  packet?: Packet;
}

/** What a packet looks like at one point on its journey. */
export interface Packet {
  /** Source address, as whoever receives it sees it. */
  from: string;
  /** Destination address and port. */
  to: string;
  /** What else matters about it here: the protocol, a header, TLS. */
  carries?: string;
}

export interface Journey {
  /** Its URL: /harbour/journeys/<slug>. */
  slug: string;
  title: string;
  shortTitle: string;
  /** Why this flow matters, before the first hop. */
  intro: string;
  /** How it ends: as found, and with every defect closed. */
  outcome: { found: string; fixed: string };
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
  /** Defaults to plum: the chain's objects are run by Google. */
  hue?: Owner;
  defects?: string[];
}

export interface LoadBalancerLane {
  label: string;
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
  extras: (Box & { hue?: Owner; defects?: string[] })[];
  wires: Point[][];
  annotations: { x: number; y: number; lines: string[] }[];
  initialSelection: string;
  details: Record<string, LoadBalancerDetail>;
  /** Where to look when something breaks. */
  symptoms?: LoadBalancerSymptom[];
}

export interface LoadBalancerSymptom {
  symptom: string;
  /** Where to look, in words. */
  where: string;
  /** The link to look at, when it is one on the chain. */
  link?: string;
  /** The usual cause; `code` in backticks. */
  cause: string;
}

/** A subnet of the region block, drawn as the /24 squares it covers. */
export interface PlanSubnet {
  name: string;
  /** Inside the region's /16, from /16 to /24. */
  cidr: string;
  /** Not created yet: drawn as the defect it is. */
  missing?: boolean;
  defects?: string[];
}

/** A range beside the region block, drawn as a box. */
export interface PlanRange {
  cidr: string;
  label: string;
  /** Who it belongs to; none is outside Harbour. */
  hue?: Owner;
}

/** The IP plan: one region block in detail, the other ranges in brief. */
export interface AddressPlan {
  region: { name: string; cidr: string; subnets: PlanSubnet[] };
  others: PlanRange[];
}

export interface ArchitectureModel {
  /** Accessible name for the diagram. */
  name: string;
  viewBox: { width: number; height: number };
  overlays: Overlay[];
  groups: ArchGroup[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** Connections the map leaves off; the component atlas draws them. */
  links?: ArchLink[];
  phases: Phase[];
  componentSections: readonly string[];
  componentSheets: Record<string, ComponentSheet>;
  defects: Defect[];
  journeys: Journey[];
  loadBalancer: LoadBalancerChain;
  addressPlan?: AddressPlan;
}

/** What the map needs to draw itself at any phase - the model without its prose. */
export type MapModel = Pick<
  ArchitectureModel,
  "name" | "viewBox" | "groups" | "nodes" | "edges"
> & {
  defects: Pick<Defect, "id" | "phase" | "applies">[];
};
