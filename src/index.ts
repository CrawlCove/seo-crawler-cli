/** Library entry point. Use it to script against the crawler directly instead of through the CLI. */
export { crawlSite, DEFAULT_CRAWL_OPTIONS, DEFAULT_USER_AGENT, SeedBlockedByRobotsError, type CrawlOptions } from './crawl.js'
export { loadRobots, type RobotsRules } from './robots.js'
export { summarizeChecks, shouldFail } from './checks.js'
export { toJson, toCsv } from './output.js'
export type { CrawlResult, PageResult, FailOnCheck, CheckSummary } from './types.js'
export { ALL_FAIL_ON_CHECKS } from './types.js'
export { defaultDestination, defaultFileName, downloadsDir, unusedPath } from './download.js'
