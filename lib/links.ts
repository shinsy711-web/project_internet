/**
 * 내부링크 보강 — 공개 페이지가 본문 링크만으로 전부 이어지게 한다 (고립 0건).
 *
 * 푸터 사이트맵은 전 페이지를 걸지만 사이트 공통 링크라 약하다. 여기서는 원고의 "함께 보면 좋은 글" 목록 뒤에
 * 원고가 걸지 않은 페이지를 덧붙인다. 원고 파일은 건드리지 않는다 — 원고가 늘면 빌드 때 다시 계산된다.
 *
 *   1. 허브 ↔ 하위 양방향 (규칙 9). 홈은 하위가 있는 최상위 허브를 건다. 허브 페이지 없는 갈래(/device/* 등)는 서로 건다
 *   2. 관련 글이 MIN_OUT 개보다 적으면 가까운 페이지로 채운다
 *   3. 들어오는 링크가 MIN_IN 개보다 적은 페이지는 가까운 페이지 목록에 끼워 넣는다
 *   4. 홈에서 본문 링크만 따라가 닿지 않는 페이지가 남으면, 닿는 가까운 페이지에서 건다
 *
 * "가까운" = 같은 허브 아래 같은 갈래 → 푸터 같은 묶음, 그 안에서 발행 순서가 가까운 순.
 * 링크를 거는 쪽·받는 쪽 모두 공개 페이지(isReady)만 — 원고 대기(noindex) 페이지는 원고가 들어오면 자동으로 들어온다.
 * scripts/rules-audit.mjs 가 빌드 HTML 에서 같은 조건([9 고립])을 다시 확인한다.
 */
import { isReady, loadDoc, type Block, type Span } from './content'
import type { PageDef } from './pages'
import { FOOTER_GROUPS, SITE_PAGES, childrenOf, isPage, pageByPath, parentOf } from './site'

/** 페이지마다 다른 공개 페이지 본문에서 받는 링크 최소 */
const MIN_IN = 2
/** 관련 글 목록 최소 개수 */
const MIN_OUT = 3
/** 3단계에서 한 페이지에 먼저 몰아주는 자동 링크 상한 (후보가 모자라면 넘긴다) */
const CAP = 6

const order = new Map(SITE_PAGES.map((p, i) => [p.path, i]))
const live = SITE_PAGES.map((p) => p.path).filter((p) => isReady(loadDoc(p)))
const liveSet = new Set(live)

const seg = (p: string) => p.split('/')[1] ?? ''
const byNear = (p: string, list: string[]) =>
  [...list].sort((a, b) => Math.abs(order.get(a)! - order.get(p)!) - Math.abs(order.get(b)! - order.get(p)!))

// ── 원고가 이미 거는 링크 ─────────────────────────────────

/** 렌더와 같은 기준 — PageView 는 isPage(href) 일 때만 링크로 낸다 */
const spanHrefs = (spans: Span[]) => spans.flatMap((s) => (s.t === 'link' && isPage(s.href) ? [s.href] : []))

function blockHrefs(b: Block): string[] {
  switch (b.t) {
    case 'p':
    case 'note':
      return spanHrefs(b.spans)
    case 'ul':
    case 'ol':
      return b.items.flatMap(spanHrefs)
    case 'link':
      return isPage(b.href) ? [b.href] : []
    default:
      return []
  }
}

const manual = new Map<string, Set<string>>()
/** 원고 관련 목록에서 화면에 나가는 항목 수 (PageView DocRelated 와 같은 기준) */
const listed = new Map<string, number>()
const auto = new Map<string, string[]>()

for (const p of live) {
  const doc = loadDoc(p)!
  const hrefs = new Set(doc.lead ? spanHrefs(doc.lead) : [])
  let rel = 0
  for (const s of doc.sections)
    for (const b of s.blocks) {
      blockHrefs(b).forEach((h) => hrefs.add(h))
      if (s.type === '관련문서' && b.t === 'ul') rel += b.items.filter((it) => spanHrefs(it).length > 0).length
    }
  hrefs.delete(p)
  manual.set(p, hrefs)
  listed.set(p, rel)
  auto.set(p, [])
}

const links = (h: string, t: string) => manual.get(h)!.has(t) || auto.get(h)!.includes(t)
function add(h: string, t: string) {
  if (h === t || !liveSet.has(h) || !liveSet.has(t) || links(h, t)) return false
  auto.get(h)!.push(t)
  return true
}
const inCount = (t: string) => live.filter((h) => h !== t && links(h, t)).length

const groupOf = new Map<string, string[]>()
for (const g of FOOTER_GROUPS) for (const p of g.pages) if (!groupOf.has(p.path)) groupOf.set(p.path, g.pages.map((x) => x.path))

/** 같은 허브 아래 형제(홈 아래면 같은 갈래만) → 푸터 같은 묶음. 공개 페이지만 */
function neighbors(p: string) {
  const parent = parentOf(p)
  const sibs = parent ? childrenOf(parent).map((x) => x.path).filter((x) => x !== p && (parent !== '/' || seg(x) === seg(p))) : []
  const group = (groupOf.get(p) ?? []).filter((x) => x !== p)
  return [...new Set([...byNear(p, sibs), ...byNear(p, group)])].filter((x) => liveSet.has(x))
}

// ── 1. 허브 ↔ 하위 ───────────────────────────────────────

for (const p of live) {
  const parent = parentOf(p)
  if (!parent) continue
  if (parent !== '/') {
    add(parent, p)
    add(p, parent)
  } else if (childrenOf(p).some((c) => liveSet.has(c.path))) {
    add('/', p)
  } else if (!isPage(`/${seg(p)}/`)) {
    for (const x of childrenOf('/')) if (x.path !== p && seg(x.path) === seg(p)) add(p, x.path)
  }
}

// ── 2. 관련 글 최소 개수 ─────────────────────────────────

for (const p of live)
  for (const x of neighbors(p)) {
    if (listed.get(p)! + auto.get(p)!.length >= MIN_OUT) break
    add(p, x)
  }

// ── 3. 들어오는 링크 최소 개수 ───────────────────────────

for (const t of live) {
  if (t === '/') continue
  let need = MIN_IN - inCount(t)
  if (need <= 0) continue
  const hosts = neighbors(t).filter((h) => !links(h, t))
  const ranked = [...hosts.filter((h) => auto.get(h)!.length < CAP), ...hosts.filter((h) => auto.get(h)!.length >= CAP), '/']
  for (const h of ranked) {
    if (need <= 0) break
    if (add(h, t)) need--
  }
}

// ── 4. 홈에서 닿는가 ─────────────────────────────────────

function reachable() {
  const start = liveSet.has('/') ? '/' : live[0]
  const seen = new Set<string>(start ? [start] : [])
  for (const q = [...seen]; q.length; ) {
    const c = q.shift()!
    for (const t of [...manual.get(c)!, ...auto.get(c)!])
      if (liveSet.has(t) && !seen.has(t)) {
        seen.add(t)
        q.push(t)
      }
  }
  return seen
}

for (let seen = reachable(); live.some((p) => !seen.has(p)); seen = reachable()) {
  const t = live.find((p) => !seen.has(p))!
  const host = [parentOf(t), ...neighbors(t), '/'].find((h): h is string => Boolean(h) && seen.has(h!)) ?? [...seen][0]
  add(host, t)
}

/** 원고 관련 목록 뒤에 덧붙일 페이지. 공개 페이지에만 값이 있다 */
export const autoRelated = (path: string): PageDef[] => (auto.get(path) ?? []).map((p) => pageByPath(p)!)
