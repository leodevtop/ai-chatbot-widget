import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Renders markdown string to sanitized HTML.
 * @param md The markdown string to render.
 * @returns The sanitized HTML string.
 */
export function renderMarkdown(md: string): string {
  const rawHtml = marked.parse(md);
  return DOMPurify.sanitize(rawHtml as string);
}
