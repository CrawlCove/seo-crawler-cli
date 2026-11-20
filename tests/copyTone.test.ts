import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// House style: no em dashes in anything a user reads. The package.json
// description becomes the npm listing, src/ strings print in --help, and src/
// comments ship in dist/*.d.ts. npm never lets a version be republished, so a
// dash that reaches a release stays on npm for good.
const ROOT = new URL('..', import.meta.url).pathname

function tsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsFiles(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : []
  )
}

describe('copy tone', () => {
  const files = [join(ROOT, 'package.json'), join(ROOT, 'README.md'), join(ROOT, 'CHANGELOG.md'), ...tsFiles(join(ROOT, 'src'))]

  it.each(files.map((f) => [f.slice(ROOT.length), f]))('%s has no em dash', (_name, file) => {
    const hits = readFileSync(file, 'utf8')
      .split('\n')
      .map((line, i) => ({ line: i + 1, text: line }))
      .filter((l) => l.text.includes('—') || l.text.includes('&mdash;'))
    expect(hits).toEqual([])
  })
})
