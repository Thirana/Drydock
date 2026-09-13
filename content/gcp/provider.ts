import type { Provider } from "@/lib/content/types";
import { harbour } from "./harbour/lab";

export const gcp: Provider = {
  slug: "gcp",
  name: "Google Cloud",
  summary: "Labs built on Google Cloud.",
  labs: [harbour],
};
