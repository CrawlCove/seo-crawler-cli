/** A redirect chain is 2+ hops. A single redirect (old URL -> canonical new URL) is normal and not flagged. */
const REDIRECT_CHAIN_MIN_HOPS = 2;
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
export function summarizeChecks(result) {
    let brokenLinks = 0;
    let missingTitles = 0;
    let noindex = 0;
    let redirectChains = 0;
    const linkedBroken = new Set();
    for (const page of result.pages)
        for (const href of page.brokenInternalLinks)
            linkedBroken.add(href);
    for (const page of result.pages) {
        brokenLinks += page.brokenInternalLinks.length;
        const failed = page.fetchError !== null || (page.statusCode !== null && page.statusCode >= 400);
        if (failed && !linkedBroken.has(page.url))
            brokenLinks += 1;
        const ok = page.statusCode !== null && page.statusCode >= 200 && page.statusCode < 300;
        if (ok && (!page.title || page.title.trim() === ''))
            missingTitles += 1;
        if (ok && page.robotsMeta !== null && /noindex/.test(page.robotsMeta))
            noindex += 1;
        if (page.redirectHops >= REDIRECT_CHAIN_MIN_HOPS)
            redirectChains += 1;
    }
    return { brokenLinks, missingTitles, noindex, redirectChains };
}
const CHECK_TO_SUMMARY_KEY = {
    'broken-links': 'brokenLinks',
    'missing-titles': 'missingTitles',
    noindex: 'noindex',
    'redirect-chains': 'redirectChains'
};
/**
 * Whether the crawl should exit non-zero: true when the total count across
 * every selected `failOn` category is >= threshold.
 */
export function shouldFail(summary, failOn, threshold) {
    const total = failOn.reduce((sum, check) => sum + summary[CHECK_TO_SUMMARY_KEY[check]], 0);
    return total >= threshold;
}
