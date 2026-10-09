/** The anchor a chapter's `##` heading gets: "The scoping trap" → "the-scoping-trap". */
export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
