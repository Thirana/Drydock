import type { Box, Point, Side } from "./types";

/** Point on a box side, `offset` along it (defaults to the midpoint). */
export function anchor(box: Box, side: Side, offset?: number): Point {
  const ox = offset ?? box.w / 2;
  const oy = offset ?? box.h / 2;
  switch (side) {
    case "l":
      return { x: box.x, y: box.y + oy };
    case "r":
      return { x: box.x + box.w, y: box.y + oy };
    case "t":
      return { x: box.x + ox, y: box.y };
    case "b":
      return { x: box.x + ox, y: box.y + box.h };
  }
}

/** Orthogonal route between two anchors, bending once or twice. */
export function orthogonalRoute(
  p1: Point,
  p2: Point,
  fromSide: Side,
  toSide: Side,
): Point[] {
  const hStart = fromSide === "l" || fromSide === "r";
  const hEnd = toSide === "l" || toSide === "r";
  const points = [p1];
  if (hStart && hEnd) {
    const mx = (p1.x + p2.x) / 2;
    points.push({ x: mx, y: p1.y }, { x: mx, y: p2.y });
  } else if (!hStart && !hEnd) {
    const my = (p1.y + p2.y) / 2;
    points.push({ x: p1.x, y: my }, { x: p2.x, y: my });
  } else if (hStart) {
    points.push({ x: p2.x, y: p1.y });
  } else {
    points.push({ x: p1.x, y: p2.y });
  }
  points.push(p2);
  return points;
}

export function pathData(points: Point[]) {
  return points.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
}

/** Midpoint of the longest horizontal segment, if it is long enough for a label. */
export function labelPosition(points: Point[], minLength = 40): Point | null {
  let best: Point | null = null;
  let bestLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    if (Math.abs(a.y - b.y) >= 1) continue;
    const length = Math.abs(a.x - b.x);
    if (length > bestLength) {
      bestLength = length;
      best = { x: (a.x + b.x) / 2, y: a.y };
    }
  }
  return best && bestLength > minLength ? best : null;
}
