import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { DesktopHint } from "@/components/site/desktop-hint";
import { site } from "@/config/site";
import "./globals.css";

// Chosen for legibility first: distinct letterforms (I/l/1, O/0) matter when
// the page is full of IDs, ranges and commands. Loaded from the files
// themselves (Fontsource) rather than by name from Google: Next has no stored
// measurements for these new families, but it can take them from the files to
// size the fallback font to match, so text does not shift when they arrive.
const atkinson = localFont({
  src: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-atkinson",
  display: "swap",
});

const atkinsonMono = localFont({
  src: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-mono/files/atkinson-hyperlegible-mono-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-atkinson-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: { siteName: site.name, type: "website" },
  // The preview image (opengraph-image.tsx) shown wide, not as a thumbnail.
  twitter: { card: "summary_large_image" },
};

/**
 * Runs before paint, so nothing jumps: the theme the reader picked with the
 * toggle, else dark (the system's setting is deliberately not consulted), and
 * whether they hid the chapter rail.
 */
const PREFS_SCRIPT = `try{var d=document.documentElement,s=localStorage;if(s.getItem("dd-theme")==="light")d.dataset.theme="light";if(s.getItem("dd-rail")==="hidden")d.dataset.rail="hidden"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Dark unless the reader chose light; in the HTML itself, so it holds
      // without JavaScript too.
      data-theme="dark"
      suppressHydrationWarning
      className={`${atkinson.variable} ${atkinsonMono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        {children}
        <DesktopHint />
        {/* Vercel's visit counts and page-speed measurements: no cookies,
            nothing sent outside a Vercel deployment. Both are switched on
            in the project's dashboard. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
