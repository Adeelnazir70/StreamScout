const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
};

/** TVMaze summaries come as HTML (<p>, <b>, <i>). We only need plain text. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return '';
  }
  return html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, entity => ENTITIES[entity] ?? entity)
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** "2008 – 2013", "2019 – now", or "" when the show has no premiere date. */
export function formatYears(show: {
  premiered: string | null;
  ended: string | null;
  status: string;
}): string {
  if (!show.premiered) {
    return '';
  }
  const start = show.premiered.slice(0, 4);
  if (show.ended) {
    const end = show.ended.slice(0, 4);
    return start === end ? start : `${start} – ${end}`;
  }
  return show.status === 'Running' ? `${start} – now` : start;
}
