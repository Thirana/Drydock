/**
 * The case study's URLs. Kept apart from the content so client components can
 * link without pulling Harbour's MDX into the bundle.
 *
 *   /harbour                          overview
 *   /harbour/platform                 map (the platform section's index)
 *   /harbour/platform/<page>          ip-plan, components, load-balancing
 *   /harbour/journeys                 every journey
 *   /harbour/journeys/<journey>       one journey (?state=fixed for the fixed design)
 *   /harbour/defects                  the register
 *   /harbour/defects/<id>             one defect, id lower-cased (d3a)
 */
export const harbourHref = "/harbour";
export const platformHref = `${harbourHref}/platform`;
export const journeysHref = `${harbourHref}/journeys`;
export const defectsHref = `${harbourHref}/defects`;

/** The platform section's index page is served at /harbour/platform itself. */
export const PLATFORM_INDEX = "map";

export function platformPageHref(slug: string) {
  return slug === PLATFORM_INDEX ? platformHref : `${platformHref}/${slug}`;
}

export function journeyHref(slug: string) {
  return `${journeysHref}/${slug}`;
}

export function defectHref(id: string) {
  return `${defectsHref}/${id.toLowerCase()}`;
}

/** The overview anchor for the arguments against the textbook answer. */
export const PUSH_BACK_ANCHOR =
  "where-i-would-push-back-on-the-textbook-answer";
