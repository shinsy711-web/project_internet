/**
 * 원고 폴더 스캔 — content/site-a · content/site-b
 *
 * 원본은 데스크톱 content_manuscripts/content 이고 `npm run sync` 로 복사해 온다. 원고는 원본 쪽에서 고친다.
 * 파일 경로가 아니라 프런트매터 `url:` 로 페이지를 찾는다 — 원고 폴더는 `kt/index.md` · `kt/price.md` · `gift.md` 형태가 섞여 있다.
 * `_` 로 시작하는 파일·폴더(_data)와 README 는 페이지가 아니다.
 *
 * ⚠️ node:fs 를 쓴다 — 클라이언트 컴포넌트에서 이 모듈(과 이것을 import 하는 lib/site.ts)을 import 하지 말 것.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { SITE_KEY } from './siteKey'

export type Frontmatter = {
  url: string
  title: string
  h1: string
  description: string
  keywords: string[]
  updated: string
  published: string
}

export type Manuscript = { file: string; rel: string; fm: Frontmatter; raw: string }

const CONTENT_ROOT = join(process.cwd(), 'content')
const SITE_DIR_NAME = SITE_KEY === 'B' ? 'site-b' : 'site-a'
const SITE_DIR = join(CONTENT_ROOT, SITE_DIR_NAME)

function parseFrontmatter(raw: string): Frontmatter {
  const block = (raw.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [, ''])[1] as string
  const get = (key: string) => {
    const m = block.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'))
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
  }
  return {
    url: get('url'),
    title: get('title'),
    h1: get('h1'),
    description: get('description'),
    keywords: get('keywords')
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    updated: get('updated'),
    published: get('published') || get('updated'),
  }
}

function walk(dir: string, acc: string[] = []) {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_') || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (name.endsWith('.md') && name.toLowerCase() !== 'readme.md') acc.push(full)
  }
  return acc
}

const byUrl = new Map<string, Manuscript>()
for (const file of walk(SITE_DIR)) {
  const raw = readFileSync(file, 'utf8')
  const fm = parseFrontmatter(raw)
  if (!fm.url) continue
  const url = fm.url.endsWith('/') ? fm.url : `${fm.url}/`
  const rel = relative(CONTENT_ROOT, file).split(sep).join('/')
  if (byUrl.has(url)) console.warn(`[원고] url ${url} 이 두 파일에 있습니다: ${byUrl.get(url)!.rel} · ${rel} — 뒤의 것을 씁니다`)
  byUrl.set(url, { file, rel, fm: { ...fm, url }, raw })
}

export const manuscriptFor = (path: string) => byUrl.get(path)
export const manuscripts = () => [...byUrl.values()]

/** 원고가 없는 페이지에 안내할 파일 경로 — 원고 폴더 관례(README): A 1단은 <seg>/index.md, B 1단은 <seg>.md, 2단은 <seg>/<leaf>.md */
export function suggestedFile(path: string) {
  const segs = path.split('/').filter(Boolean)
  if (segs.length === 0) return `${SITE_DIR_NAME}/index.md`
  if (segs.length === 1) return SITE_KEY === 'B' ? `${SITE_DIR_NAME}/${segs[0]}.md` : `${SITE_DIR_NAME}/${segs[0]}/index.md`
  return `${SITE_DIR_NAME}/${segs.slice(0, -1).join('/')}/${segs[segs.length - 1]}.md`
}
