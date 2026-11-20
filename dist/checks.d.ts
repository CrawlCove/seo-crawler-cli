import type { CheckSummary, FailOnCheck, PageResult } from './types.js';
export type { CheckSummary } from './types.js';
/**
 * Count each category's issues across a crawl's pages.
 *
 * A broken link is counted ONCE: a link from a crawled page to a URL that failed
 * counts on the linking page, and the failed page itself only adds one when no
 * crawled page links to it (the seed, or a URL found only in the sitemap).
 * Before 1.2.0 both were counted, so one dead link read as "broken links: 2".
 * Missing titles and noindex count only pages that answered 2xx: an error page's
 * title or robots meta (a 404 template with noindex, say) says nothing about a
 * page you want indexed, and the dead link is already counted.
 */
export declare function summarizeChecks(result: {
    pages: readonly PageResult[];
}): CheckSummary;
/**
 * Whether the crawl should exit non-zero: true when the total count across
 * every selected `failOn` category is >= threshold.
 */
export declare function shouldFail(summary: CheckSummary, failOn: readonly FailOnCheck[], threshold: number): boolean;
