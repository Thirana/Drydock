import type { Lab } from "@/lib/content/types";
import { network } from "./network/track";

export const harbour: Lab = {
  slug: "harbour",
  title: "Harbour",
  summary:
    "A fictional marketplace platform running on GCP, built deliberately wrong.",
  disclaimer: "Harbour is fictional. The shape is real.",
  tracks: [network],
};
