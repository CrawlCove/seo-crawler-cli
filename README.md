<a href="https://crawlcove.com/download?utm_source=github&utm_medium=readme&utm_campaign=seo-crawler-cli"><img src="https://raw.githubusercontent.com/CrawlCove/.github/main/banners/seo-crawler-cli.svg" width="1200" alt="seo-crawler-cli: Crawl a site from a script or CI. Checks status codes, redirect chains, titles, meta descriptions, H1s, canonicals, noindex and broken links, and fails the build on regressions." /></a>

# seo-crawler-cli

An **SEO crawler CLI** for scripts and CI. One command crawls a site and checks status codes, redirect chains, titles, meta descriptions, H1s, canonicals, noindex and broken internal links, then exits non-zero when the checks you choose find something. The command it installs is `crawlcove`.

<img src="docs/demo.svg" width="980" alt="Terminal recording: crawling the SEO test site finds 2 broken links, 1 missing title and 1 noindex page, and exits 1">

*Recorded from a real run against [seo-test-site](https://github.com/CrawlCove/seo-test-site), a public site with 54 planted SEO problems that you can crawl too.*

## Quick start

```sh
npx github:CrawlCove/seo-crawler-cli https://crawlcove.github.io/seo-test-site/ --file crawl.json
```

```
crawlcove: 80 page(s) crawled. broken links: 2, missing titles: 1, noindex: 1, redirect chains: 0. 1 URL(s) skipped because robots.txt disallows them.
```

The exit code is `1` because the crawl found problems, so the same line fails a CI job. `crawl.json` holds one record per page (status, title, meta description, H1 count, canonical, robots meta, broken links).

## Install

Straight from GitHub (Node 18+):

```sh
# one-off, nothing installed:
npx github:CrawlCove/seo-crawler-cli https://example.com

# global command, from a release tarball:
npm install -g https://github.com/CrawlCove/seo-crawler-cli/archive/refs/tags/v1.2.0.tar.gz
crawlcove --version
```

The tarball form is deliberate: `npm install -g github:CrawlCove/seo-crawler-cli`
looks like it works on npm 10 but leaves a dangling symlink into npm's cache
(a non-global `npm install github:CrawlCove/seo-crawler-cli` is fine). The npm
package `crawlcove` is coming; once it is published, `npm install -g crawlcove`
and `npx crawlcove crawl https://example.com` will work too.

## Usage

```sh
crawlcove crawl <url> [options]     # `crawl` is the default command, so `crawlcove <url>` works too

Options:
  -o, --output <format>   json or csv (default: json)
  --file <path>           write output to this path ("-" forces stdout)
  --max-pages <n>         stop after crawling this many pages (default: 100)
  --concurrency <n>       simultaneous requests (default: 4)
  --timeout <ms>          per-request timeout in milliseconds (default: 15000)
  --ignore-robots         crawl URLs that robots.txt disallows (only for sites you own or are authorised to crawl)
  --fail-on <checks>      comma-separated: broken-links, missing-titles, noindex, redirect-chains, or "none"
                          (default: all four)
  --threshold <n>         exit non-zero once the selected checks total this many issues (default: 1)
```

Where the result goes: JSON prints to stdout. CSV typed into a terminal is
saved to your Downloads folder as `crawlcove-<host>-<date>-<time>.csv` and the
path is printed, so `crawlcove crawl https://example.com -o csv` leaves a file
ready to open in a spreadsheet. CSV that is piped or redirected
(`-o csv > out.csv`, a script, CI) still streams to stdout; `--file <path>`
picks the location and `--file -` forces stdout.

Exit codes: `0` clean, `1` the selected `--fail-on` checks reached `--threshold`,
`2` usage error or robots.txt disallowed the start URL itself (nothing was fetched).

To fail a CI build only on broken links and tolerate everything else:

```sh
crawlcove crawl https://staging.example.com --fail-on broken-links --threshold 1
```

## robots.txt

The crawler fetches `/robots.txt` before anything else and never requests a
URL it disallows. Skipped URLs are listed under `robotsBlocked` in the output
and counted on stderr. It honours a `User-agent: crawlcove-cli` group if you
publish one, otherwise the `*` group. A missing robots.txt (404) allows
everything; a server error (5xx) or unreachable origin allows nothing, the
same defaults as the Crawl Cove desktop app. `--ignore-robots` turns this off
for sites you own (a staging host behind a blanket `Disallow: /`, for example).

Requests identify themselves as `crawlcove-cli/<version> (+https://crawlcove.com/open-source/crawlcove-cli)`,
so a site owner who finds the string in an access log can read what it does.

## Output

JSON output is one object per crawled page (see
[crawlcove-export-spec](https://github.com/CrawlCove/seo-crawl-export-spec) for
the full field reference; this CLI's field names match it where it checks the
same thing). CSV output is the same data as RFC 4180 CSV.

## Limitations (v1)

- Noindex detection reads only the `<meta name="robots">` tag, not the
  `X-Robots-Tag` response header.
- Follows same-origin links only, with no scoping to a URL prefix yet.
- Ignores `Crawl-delay`; use `--concurrency 1` on sites that ask for one.

## Works with CrawlCove

This CLI shares its checks and output shape with [Crawl Cove](https://crawlcove.com/?utm_source=github&utm_medium=seo-crawler-cli), a desktop SEO crawler. Use this CLI for scripted, scheduled, or CI crawls; open the same site in the desktop app for the full visual report, historical tracking, and Search Console integration.

This repo has its own page on crawlcove.com: [Crawl Cove CLI](https://crawlcove.com/open-source/crawlcove-cli?utm_source=github&utm_medium=seo-crawler-cli), with the guide to running an SEO audit from the terminal at [https://crawlcove.com/blog/seo-audit-from-the-terminal](https://crawlcove.com/blog/seo-audit-from-the-terminal?utm_source=github&utm_medium=seo-crawler-cli).

## Related tools

<!-- related:start, kept in step by CrawlCove/.github scripts/related.mjs -->
| Repo | What it does |
|---|---|
| [seo-audit-action](https://github.com/CrawlCove/seo-audit-action) | Crawl a staging or preview URL on every pull request. Fails the check on broken links, missing titles, noindex and redirect chains, with the details as a PR comment. |
| [seo-mcp-server](https://github.com/CrawlCove/seo-mcp-server) | Crawl a site, list SEO issues, inspect pages and find broken links from inside Claude, Cursor and other AI assistants. |
| [claude-seo-plugin](https://github.com/CrawlCove/claude-seo-plugin) | Seven SEO skills for Claude Code backed by a real site crawl: audits, broken links, redirects, titles and fixes, from a chat. |
| [seo-chrome-extension](https://github.com/CrawlCove/seo-chrome-extension) | On-page SEO checker with an AI visibility report: which AI crawlers can read the page, snippet blocks, llms.txt and extractability. Nothing leaves the browser. |
| [xml-sitemap-validator](https://github.com/CrawlCove/xml-sitemap-validator) | Check a sitemap or sitemap index against the sitemaps.org protocol and search engine limits. Flags bad URLs, lastmod dates and cross-host entries. |
| [robots-txt-tester](https://github.com/CrawlCove/robots-txt-tester) | Fetch and lint a robots.txt, test which URLs each crawler may fetch and see the deciding line. Fails deploys that block the site. |
| [redirect-chain-checker](https://github.com/CrawlCove/redirect-chain-checker) | Follow every hop of a URL's redirects and flag chains, loops, HTTPS downgrades, meta refreshes and redirects to error pages. |
| [hreflang-checker](https://github.com/CrawlCove/hreflang-checker) | Validate the hreflang tags on a page or across a whole XML sitemap, including self-reference, x-default and return tags. |
| [schema-markup-validator](https://github.com/CrawlCove/schema-markup-validator) | Check every schema.org node on a page against the required and recommended properties for rich results. |
| [seo-test-site](https://github.com/CrawlCove/seo-test-site) | A deliberately broken SEO test site with every planted problem and its expected finding listed, for testing any SEO crawler. |
| [seo-crawl-export-spec](https://github.com/CrawlCove/seo-crawl-export-spec) | An open format for site crawl data: JSON Schema and CSV column reference, with a real sample export and a validator script. |
| [seo-crawl-export-js](https://github.com/CrawlCove/seo-crawl-export-js) | Load, query and convert site crawl data in JavaScript and TypeScript, with typed pages, issues by type and status filters. |
| [screaming-frog-export-converter](https://github.com/CrawlCove/screaming-frog-export-converter) | Turn an SEO Spider internal_all.csv into the open JSON crawl export format, with a report of which columns carried over. |
| [seo-audit-google-sheets](https://github.com/CrawlCove/seo-audit-google-sheets) | An Apps Script add-on that turns a site crawl export into an audit workbook: pages, issues by type, pages by status and title and meta flags. |
| [wordpress-seo-connector](https://github.com/CrawlCove/wordpress-seo-connector) | Bulk-apply fixes from the Crawl Cove desktop crawler to Yoast SEO, Rank Math, SEOPress or AIOSEO, with a change log and one-click revert. |
<!-- related:end -->

## License

MIT, see [LICENSE](LICENSE).
