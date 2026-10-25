import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultDestination, defaultFileName, downloadsDir, unusedPath } from '../src/download.js'

const tmp: string[] = []
function tempHome(withDownloads: boolean): string {
  const home = mkdtempSync(join(tmpdir(), 'cc-home-'))
  if (withDownloads) mkdirSync(join(home, 'Downloads'))
  tmp.push(home)
  return home
}
afterEach(() => {
  for (const d of tmp.splice(0)) rmSync(d, { recursive: true, force: true })
})

describe('downloadsDir', () => {
  it('is ~/Downloads when it exists', () => {
    const home = tempHome(true)
    expect(downloadsDir(home, '/elsewhere')).toBe(join(home, 'Downloads'))
  })

  it('falls back to the current directory when there is no Downloads folder', () => {
    const home = tempHome(false)
    expect(downloadsDir(home, '/elsewhere')).toBe('/elsewhere')
  })
})

describe('defaultFileName', () => {
  const when = new Date(2026, 9, 25, 20, 28, 19) // 25 Oct 2026 20:28:19 local

  it('names the file after the host and the local time', () => {
    expect(defaultFileName('https://crawlcove.com/', 'csv', when)).toBe('crawlcove-crawlcove.com-2026-10-25-202819.csv')
  })

  it('drops www. and anything a filesystem would reject', () => {
    expect(defaultFileName('https://www.Example.com:8080/x', 'json', when)).toBe(
      'crawlcove-example.com-2026-10-25-202819.json'
    )
    expect(defaultFileName('not a url', 'csv', when)).toBe('crawlcove-site-2026-10-25-202819.csv')
  })
})

describe('unusedPath', () => {
  it('keeps the name when nothing is in the way', () => {
    expect(unusedPath('/d', 'a.csv', () => false)).toBe(join('/d', 'a.csv'))
  })

  it('counts up instead of overwriting', () => {
    const taken = new Set([join('/d', 'a.csv'), join('/d', 'a-2.csv')])
    expect(unusedPath('/d', 'a.csv', (p) => taken.has(p))).toBe(join('/d', 'a-3.csv'))
  })

  it('really checks the disk by default', () => {
    const dir = tempHome(false)
    writeFileSync(join(dir, 'a.csv'), '')
    expect(unusedPath(dir, 'a.csv')).toBe(join(dir, 'a-2.csv'))
  })
})

describe('defaultDestination', () => {
  it('sends CSV typed into a terminal to a file in Downloads (or cwd)', () => {
    const dest = defaultDestination('csv', 'https://crawlcove.com/', true)
    expect(dest.kind).toBe('file')
    if (dest.kind === 'file') {
      expect(dest.path.split(sep).pop()).toMatch(/^crawlcove-crawlcove\.com-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/)
    }
  })

  it('keeps CSV on stdout when piped or redirected, so `> out.csv` and CI still work', () => {
    expect(defaultDestination('csv', 'https://crawlcove.com/', false)).toEqual({ kind: 'stdout' })
  })

  it('leaves JSON on stdout either way', () => {
    expect(defaultDestination('json', 'https://crawlcove.com/', true)).toEqual({ kind: 'stdout' })
    expect(defaultDestination('json', 'https://crawlcove.com/', false)).toEqual({ kind: 'stdout' })
  })
})
