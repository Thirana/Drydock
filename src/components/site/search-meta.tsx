/**
 * What a search result shows for this page: its title and where it sits.
 * Read by Pagefind at build time; not indexed as text and never displayed.
 */
export function SearchMeta({ title, where }: { title: string; where: string }) {
  return (
    <>
      <span hidden data-pagefind-ignore data-pagefind-meta="title">
        {title}
      </span>
      <span hidden data-pagefind-ignore data-pagefind-meta="where">
        {where}
      </span>
    </>
  );
}
