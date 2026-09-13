/**
 * 원고(content/site-a|site-b/**.md) → 렌더 구조. 빌드 타임에만 돈다.
 *
 * 원고 형식 (content/README.md)
 *   프런트매터   url · title · h1 · description · keywords · updated
 *   `# H1`       (프런트매터 h1 이 우선)
 *   `<!-- hero -->` 다음 첫 문단 = 히어로 리드. `[라벨](#상담)` 한 줄 = 히어로 CTA 버튼 라벨
 *   `<!-- 유형 -->` + `## H2 {#앵커}`   유형: definition · table · detail · list-ul · list-ol · caution · trust · tool · qa · faq · cta · related
 *   마크다운 표 + 바로 아래 `*이탤릭 한 줄*` = caption
 *   `> 인용`     참고 박스
 *   `[라벨](/경로/)` 한 줄 = 버튼 링크 (tool 섹션)
 *   `---` 이후   본문 끝 (최종 수정일 줄 — 화면에는 프런트매터 updated 로 나간다)
 *   그 밖의 `<!-- … -->` 는 작성 메모라 렌더하지 않는다
 *
 * ⚠️ 표 숫자가 원고에 직접 들어 있다 — 시트 운영규칙 1(숫자는 마스터 데이터에서만)과 다르다.
 *    감사 스크립트는 WARN 으로 표시만 하고, plans.csv 연동은 다음 단계다.
 */
import { manuscriptFor } from './manuscripts'
import type { SectionType } from './pages'

export type Span =
  | { t: 'text'; v: string }
  | { t: 'strong'; v: string }
  | { t: 'em'; v: string }
  | { t: 'code'; v: string }
  | { t: 'link'; v: string; href: string }

export type Block =
  | { t: 'p'; spans: Span[] }
  | { t: 'ul'; items: Span[][]; cards?: boolean }
  | { t: 'ol'; items: Span[][] }
  | { t: 'h3'; v: string }
  | { t: 'table'; head: string[]; rows: string[][]; caption: string }
  | { t: 'note'; spans: Span[] }
  | { t: 'link'; label: string; href: string }

export type DocSection = { heading: string; type: SectionType; anchor?: string; blocks: Block[] }

export type Doc = {
  path: string
  /** content/ 기준 원고 파일 경로 */
  file: string
  title: string
  h1: string
  description: string
  updated: string
  published: string
  lead: Span[] | null
  /** 히어로 `[라벨](#상담)` 의 라벨 */
  ctaLabel: string
  /** `<!-- 측정 도구 임베드 -->` 가 있으면 히어로에 측정 버튼 자리 */
  heroTool: boolean
  sections: DocSection[]
  /** 원고에 숫자째 들어 있는 표 개수 (운영규칙 1 감사용) */
  mdTables: number
}

const TYPES: Record<string, SectionType> = {
  definition: '정의',
  table: '비교표',
  detail: '상세',
  'list-ul': '목록 UL',
  'list-ol': '목록 OL',
  caution: '주의사항',
  trust: '신뢰',
  tool: '도구',
  qa: 'Q&A',
  faq: 'FAQ',
  cta: 'CTA',
  related: '관련문서',
}

/** 유형 주석이 없는 `##` 는 제목으로 추정 */
function inferType(heading: string, anchor?: string): SectionType {
  if (anchor === '상담' || /상담/.test(heading)) return 'CTA'
  if (/자주\s*묻는/.test(heading)) return 'FAQ'
  if (/함께\s*보면/.test(heading)) return '관련문서'
  if (/란\s*[?？]\s*$/.test(heading)) return '정의'
  return '상세'
}

const INLINE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*\s][^*]*)\*/g

function spans(raw: string): Span[] {
  const out: Span[] = []
  let last = 0
  for (const m of raw.matchAll(INLINE)) {
    const i = m.index ?? 0
    if (i > last) out.push({ t: 'text', v: raw.slice(last, i) })
    if (m[1] !== undefined) out.push({ t: 'link', v: m[1], href: m[2] })
    else if (m[3] !== undefined) out.push({ t: 'strong', v: m[3] })
    else if (m[4] !== undefined) out.push({ t: 'code', v: m[4] })
    else out.push({ t: 'em', v: m[5] })
    last = i + m[0].length
  }
  if (last < raw.length) out.push({ t: 'text', v: raw.slice(last) })
  return out.length ? out : [{ t: 'text', v: raw }]
}

/** 표 셀은 글자만 — 셀 안 강조·코드 표시는 떼어낸다 (셀 25자 규칙은 글자 기준) */
const cellText = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').trim()

const cache = new Map<string, Doc | null>()

export function loadDoc(path: string): Doc | null {
  if (cache.has(path)) return cache.get(path)!
  const m = manuscriptFor(path)
  if (!m) {
    cache.set(path, null)
    return null
  }

  const lines = m.raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').split(/\r?\n/)

  let h1 = ''
  let heroTool = false
  let mdTables = 0
  let inComment = false
  let pendingType: SectionType | undefined
  const intro: Block[] = []
  const sections: DocSection[] = []
  let cur: Block[] = intro
  let list: { t: 'ul' | 'ol'; items: Span[][] } | null = null
  let table: string[][] | null = null
  let quote: string[] | null = null

  const isCardList = (items: Span[][]) =>
    items.length >= 2 && items.every((it) => it[0]?.t === 'strong' && it.length > 1 && /^\s*[:：]/.test(it[1]?.v ?? ''))
  const flushList = () => {
    if (!list) return
    cur.push(list.t === 'ul' && isCardList(list.items) ? { ...list, cards: true } : list)
    list = null
  }
  const flushTable = () => {
    if (!table) return
    if (table.length >= 2) {
      const [head, ...rows] = table
      cur.push({ t: 'table', head, rows, caption: '' })
    }
    table = null
  }
  const flushQuote = () => {
    if (!quote) return
    cur.push({ t: 'note', spans: spans(quote.join(' ')) })
    quote = null
  }

  for (const line of lines) {
    const t = line.trim()

    if (inComment) {
      if (t.includes('-->')) inComment = false
      continue
    }
    if (t.startsWith('<!--')) {
      if (!t.includes('-->')) {
        inComment = true
        continue
      }
      const name = t.replace(/^<!--\s*/, '').replace(/\s*-->$/, '').trim()
      if (TYPES[name]) pendingType = TYPES[name]
      else if (/측정 도구/.test(name)) heroTool = true
      continue
    }

    // `---` — 본문 끝. 그 아래는 "*최종 수정일*" 줄뿐이다
    if (/^-{3,}$/.test(t)) break

    if (t.startsWith('|')) {
      flushList()
      flushQuote()
      const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cellText)
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue
      if (!table) {
        table = []
        mdTables++
      }
      table.push(cells)
      continue
    }
    flushTable()

    if (t.startsWith('>')) {
      flushList()
      ;(quote ||= []).push(t.replace(/^>\s?/, ''))
      continue
    }
    flushQuote()

    if (!t) {
      flushList()
      continue
    }
    if (/^#\s/.test(t)) {
      flushList()
      h1 = t.slice(2).trim()
      continue
    }
    if (/^##\s/.test(t)) {
      flushList()
      const raw = t.slice(3).trim()
      const anchor = raw.match(/\{#([^}]+)\}\s*$/)?.[1]
      const heading = raw.replace(/\s*\{#[^}]+\}\s*$/, '')
      const sec: DocSection = { heading, type: pendingType ?? inferType(heading, anchor), anchor, blocks: [] }
      pendingType = undefined
      sections.push(sec)
      cur = sec.blocks
      continue
    }
    if (/^###\s/.test(t)) {
      flushList()
      cur.push({ t: 'h3', v: t.slice(4).trim() })
      continue
    }
    if (/^-\s/.test(t)) {
      if (list?.t !== 'ul') {
        flushList()
        list = { t: 'ul', items: [] }
      }
      list.items.push(spans(t.slice(2).trim()))
      continue
    }
    if (/^\d+\.\s/.test(t)) {
      if (list?.t !== 'ol') {
        flushList()
        list = { t: 'ol', items: [] }
      }
      list.items.push(spans(t.replace(/^\d+\.\s*/, '')))
      continue
    }

    flushList()

    // 표 바로 아래 이탤릭 한 줄 = caption (원고 README: 출처와 기준일)
    const prev = cur[cur.length - 1]
    if (prev?.t === 'table' && !prev.caption && /^\*[^*].*[^*]\*$/.test(t)) {
      prev.caption = t.slice(1, -1).trim()
      continue
    }

    const onlyLink = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (onlyLink) {
      cur.push({ t: 'link', label: onlyLink[1], href: onlyLink[2] })
      continue
    }

    cur.push({ t: 'p', spans: spans(t) })
  }
  flushList()
  flushTable()
  flushQuote()

  const lead = intro.find((b) => b.t === 'p')
  const heroLink = intro.find((b) => b.t === 'link' && b.href.startsWith('#'))

  const doc: Doc = {
    path,
    file: m.rel,
    title: m.fm.title,
    h1: m.fm.h1 || h1,
    description: m.fm.description,
    updated: m.fm.updated,
    published: m.fm.published,
    lead: lead && lead.t === 'p' ? lead.spans : null,
    ctaLabel: heroLink && heroLink.t === 'link' ? heroLink.label : '',
    heroTool,
    sections,
    mdTables,
  }
  cache.set(path, doc)
  return doc
}

/** 공개 가능 — 원고가 있고, 리드가 있고, 관련문서를 뺀 모든 섹션에 본문이 있다 */
export function isReady(doc: Doc | null): boolean {
  if (!doc?.lead || doc.sections.length === 0) return false
  return doc.sections.every((s) => s.type === '관련문서' || s.blocks.length > 0)
}
