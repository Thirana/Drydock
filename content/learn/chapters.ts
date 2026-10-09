// Chapter text for every course. Imported only by the chapter route.
import type { ChapterLoaders } from "@/lib/content/types";
import { chapters as fundamentals } from "./fundamentals/chapters";
import { chapters as gcp } from "./gcp/chapters";

export const chapterText: Record<string, ChapterLoaders> = { fundamentals, gcp };
