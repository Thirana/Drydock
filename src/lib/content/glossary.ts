import fs from "node:fs";
import path from "node:path";
import { headingId } from "./heading-id";
import { chapterHref, courses, isPublished } from "./learn";

/**
 * The glossary is collected from the chapters at build time: every `<Term>`,
 * with the sentence that introduces it, quoted as written. Nothing is written
 * twice, so the glossary cannot drift from the courses.
 */

export interface GlossaryEntry {
  term: string;
  /** The sentence the term first appears in, as plain text. */
  sentence: string;
  /** "Fundamentals 4" */
  where: string;
  chapter: string;
  /** The section that introduces it. */
  href: string;
}

const CONTENT = path.join(process.cwd(), "content/learn");
const TERM = /<Term>(.*?)<\/Term>/g;

/** MDX line → reading text: tags and Markdown marks out, words kept. */
function plain(line: string) {
  return line
    .replace(/^\s*(?:[-*]|\d+\.|\|)\s+/, "")
    .replace(/\{["'`](.*?)["'`]\}/g, "$1")
    .replace(/<\/?[A-Za-z][^>]*>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/(^|\s)\*(\S[^*]*\S|\S)\*/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

/** The sentence (or table cell) of a plain line that holds the term. */
function sentenceWith(line: string, term: string) {
  const cells = line.trim().startsWith("|")
    ? line.split("|").map(plain)
    : [plain(line)];
  const text = cells.find((c) => c.includes(term)) ?? plain(line);
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/);
  const at = sentences.findIndex((s) => s.includes(term));
  if (at < 0) return text;
  // A short sentence ("The result is a frame.") needs the one before it.
  const found =
    at > 0 && (sentences[at] ?? "").length < 70
      ? `${sentences[at - 1]} ${sentences[at]}`
      : (sentences[at] ?? text);
  // A sentence that leads into a list keeps reading past the quote.
  return found.replace(/:$/, " …");
}

function chapterFile(course: string, slug: string) {
  const dir = path.join(CONTENT, course, "chapters");
  const file = fs.readdirSync(dir).find((f) => f.endsWith(`-${slug}.mdx`));
  return file && path.join(dir, file);
}

let cache: GlossaryEntry[] | undefined;

/** Every term, first appearance only, sorted A to Z. */
export function glossary(): GlossaryEntry[] {
  if (cache) return cache;
  const seen = new Map<string, GlossaryEntry>();

  for (const course of courses)
    for (const chapter of course.chapters) {
      if (!isPublished(chapter)) continue;
      const file = chapterFile(course.slug, chapter.slug);
      if (!file) continue;
      const href = chapterHref({ course, chapter });
      let section: string | undefined;

      for (const line of fs.readFileSync(file, "utf8").split("\n")) {
        if (line.startsWith("## ")) section = line.slice(3).trim();
        for (const match of line.matchAll(TERM)) {
          const term = plain(match[1] ?? "");
          const key = term.toLowerCase();
          if (!term || seen.has(key)) continue;
          seen.set(key, {
            term,
            sentence: sentenceWith(line.replace(TERM, "$1"), term),
            where: `${course.short} ${chapter.num}`,
            chapter: chapter.title,
            href: section ? `${href}#${headingId(section)}` : href,
          });
        }
      }
    }

  const sortKey = (t: string) => t.replace(/^[^A-Za-z0-9]+/, "");
  cache = [...seen.values()].sort((a, b) =>
    sortKey(a.term).localeCompare(sortKey(b.term), "en", {
      sensitivity: "base",
      numeric: true,
    }),
  );
  return cache;
}

/** The letter an entry files under: A-Z, or "#" for numbers and symbols. */
export function letterOf(term: string) {
  const first = term.replace(/^[^A-Za-z0-9]+/, "")[0]?.toUpperCase() ?? "#";
  return /[A-Z]/.test(first) ? first : "#";
}
