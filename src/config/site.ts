/**
 * Where the site is served, for absolute URLs (link previews, the sitemap).
 * `NEXT_PUBLIC_SITE_URL` wins - set it once there is a custom domain. On
 * Vercel the production domain comes from its build-time environment, so
 * previews still point at production. Locally it is the dev server.
 */
function siteUrl() {
  const set = process.env.NEXT_PUBLIC_SITE_URL;
  if (set) return set.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

// Product identity, used in metadata, the logo lockup and the footer.
export const site = {
  url: siteUrl(),
  name: "Drydock",
  tagline: "Learn how networks work. Then fix one that doesn’t.",
  /** The public source, for "Suggest an edit" links. */
  repo: { url: "https://github.com/Thirana/Drydock", branch: "main" },
  description:
    "A networking guide in three steps: how networks work, how Google Cloud does it, then a platform built wrong on purpose, to fix in order.",
};
