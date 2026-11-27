import { readdirSync } from "node:fs";
import path from "node:path";

const fileCache = new Map<string, string | undefined>();

/**
 * A chapter's MDX file, relative to the repository root: chapters are stored
 * as `<number>-<slug>.mdx`, so the slug alone finds it. Build time only.
 */
export function chapterFile(course: string, chapter: string) {
  const key = `${course}/${chapter}`;
  if (fileCache.has(key)) return fileCache.get(key);
  const dir = path.join("content", "learn", course, "chapters");
  const pattern = new RegExp(
    `^[\\d.]+-${chapter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.mdx$`,
  );
  const name = readdirSync(path.join(process.cwd(), dir)).find((f) =>
    pattern.test(f),
  );
  const file = name && path.posix.join(dir.split(path.sep).join("/"), name);
  fileCache.set(key, file);
  return file;
}
