import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { isReady, type Block, type Doc, type DocSection, type Span } from '@/lib/content'
import { autoRelated } from '@/lib/links'
import { suggestedFile } from '@/lib/manuscripts'
import type { PageDef, SectionDef, SectionType } from '@/lib/pages'
import { buildTable, tableFor, type BuiltTable, type TableDef } from '@/lib/tables'
import { CTA_LABEL, eyebrowOf, formatDate, isPage, linksOf, pageByPath } from '@/lib/site'
import CtaDock from './CtaDock'
import ExpiryCalc from './ExpiryCalc'
import LeadForm from './LeadForm'
import PenaltyCalc from './PenaltyCalc'
import Related from './Related'

/**
 * 페이지 렌더러 — 두 가지 모드
 *
 *   원고 있음 : content/site-a|site-b 원고의 H2 순서·유형(<!-- 유형 --> 주석)대로. TITLE·H1·H2 는 원고가 이긴다.
 *   원고 없음 : 시트 h2_top20 설계대로 회색 자리(data-sk) + 설계 표시(섹션 번호·유형·키워드·표 번호·메모). noindex.
 *
 * ⚠️ scripts/rules-audit.mjs 가 문자열로 찾는 것
 *   - <section …> 의 첫 자식은 <div class="container">, 그 첫 자식은 <h2> (규칙 9)
 *   - 히어로 안 문단은 <p class="hero-lead"> 하나 (규칙 8)
 *   - 표 래퍼 <div class="table-wrap"…>, 진짜 <table> + caption + th scope (규칙 13·14)
 *   - <dl> 금지 (규칙 24)
 */

// ── 인라인 · 블록 ─────────────────────────────────────────

/** 원고의 한글 앵커 `#상담` 은 영문 id `#apply` 로 (한글 id 는 인코딩되어 깨진다) */
const hrefOf = (href: string) => (href === '#상담' ? '#apply' : href)

function Inline({ s }: { s: Span }) {
  switch (s.t) {
    case 'text':
      return <>{s.v}</>
    case 'strong':
      return <strong>{s.v}</strong>
    case 'em':
      return <em>{s.v}</em>
    case 'code':
      return <code>{s.v}</code>
    case 'link': {
      const href = hrefOf(s.href)
      if (href.startsWith('#')) return <a href={href}>{s.v}</a>
      // 이 사이트에 없는 경로는 깨진 링크가 되므로 일반 텍스트로 떨군다
      if (href.startsWith('/')) return isPage(href) ? <Link href={href}>{s.v}</Link> : <>{s.v}</>
      return <a href={href}>{s.v}</a>
    }
  }
}

const Spans = ({ spans }: { spans: Span[] }) => (
  <>
    {spans.map((s, i) => (
      <Inline key={i} s={s} />
    ))}
  </>
)

const afterLabel = (rest: Span[]) =>
  rest.map((s, i) => (i === 0 && s.t === 'text' ? { ...s, v: s.v.replace(/^\s*[:：]\s*/, '') } : s))

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h11" />
    <path d="m10.5 5.5 5 4.5-5 4.5" />
  </svg>
)

function One({ b }: { b: Block }) {
  switch (b.t) {
    case 'p':
      return (
        <p>
          <Spans spans={b.spans} />
        </p>
      )
    case 'h3':
      return <h3>{b.v}</h3>
    case 'note':
      return (
        <p className="note">
          <Spans spans={b.spans} />
        </p>
      )
    case 'link': {
      const href = hrefOf(b.href)
      const live = href.startsWith('#') || (href.startsWith('/') ? isPage(href) : true)
      return (
        <p className="link-cta">
          {live ? (
            href.startsWith('/') ? (
              <Link href={href} className="btn-ghost">
                {b.label}
                <Arrow />
              </Link>
            ) : (
              <a href={href} className="btn-ghost">
                {b.label}
                <Arrow />
              </a>
            )
          ) : (
            // 도구 페이지가 아직 없다 — 링크 대신 준비 중 표시
            <span className="btn-ghost is-pending" aria-disabled="true">
              {b.label} (준비 중)
            </span>
          )}
        </p>
      )
    }
    case 'table':
      return (
        <div className="table-wrap">
          <table>
            {b.caption && <caption>{b.caption}</caption>}
            <thead>
              <tr>
                {b.head.map((c, j) => (
                  <th scope="col" key={j}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, j) => (
                <tr key={j}>
                  {r.map((c, k) =>
                    k === 0 ? (
                      <th scope="row" key={k}>
                        {c}
                      </th>
                    ) : (
                      <td key={k}>{c}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'ul':
      if (b.cards)
        return (
          <ul className="cards">
            {b.items.map((it, j) => {
              const [label, ...rest] = it
              return (
                <li key={j}>
                  <b className="cards-t">{label.v}</b>
                  <span className="cards-d">
                    <Spans spans={afterLabel(rest)} />
                  </span>
                </li>
              )
            })}
          </ul>
        )
      return (
        <ul>
          {b.items.map((it, j) => (
            <li key={j}>
              <Spans spans={it} />
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="steps">
          {b.items.map((it, j) => (
            <li key={j}>
              <p className="steps-t">
                <span className="steps-no" aria-hidden="true">
                  Step {j + 1}
                </span>
                <span>
                  <Spans spans={it} />
                </span>
              </p>
            </li>
          ))}
        </ol>
      )
  }
}

const Blocks = ({ blocks }: { blocks: Block[] }) => (
  <>
    {blocks.map((b, i) => (
      <One key={i} b={b} />
    ))}
  </>
)

function FaqBlocks({ blocks }: { blocks: Block[] }) {
  const groups: Block[][] = []
  for (const b of blocks) {
    if (b.t === 'h3' || groups.length === 0) groups.push([b])
    else groups[groups.length - 1].push(b)
  }
  return (
    <>
      {groups.map((g, i) =>
        g[0].t === 'h3' ? (
          <div className="faq-item" key={i}>
            <Blocks blocks={g} />
          </div>
        ) : (
          <Blocks blocks={g} key={i} />
        ),
      )}
    </>
  )
}

// ── 공통 조각 ─────────────────────────────────────────────

/** 히어로 장식 그래픽 — 글자·수치를 넣지 않는다(규칙 37) */
const HeroArt = () => (
  <svg aria-hidden="true" viewBox="0 0 320 260" className="hero-art">
    <rect x="18" y="26" width="284" height="208" rx="22" fill="var(--color-surface)" stroke="var(--color-accent-line)" strokeWidth="2" />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(42 ${58 + i * 56})`}>
        <rect width="236" height="40" rx="12" fill={i === 1 ? 'var(--color-accent-soft)' : 'var(--color-surface-2)'} />
        <circle cx="22" cy="20" r="9" fill={i === 1 ? 'var(--color-cta)' : 'var(--color-line-strong)'} />
        <rect x="42" y="14" width={[88, 120, 70][i]} height="12" rx="6" fill={i === 1 ? 'var(--color-accent-line)' : 'var(--color-line)'} />
        <rect x="182" y="12" width="40" height="16" rx="8" fill={i === 1 ? 'var(--color-cta)' : 'var(--color-line)'} />
      </g>
    ))}
    <g transform="translate(250 22)">
      <circle r="26" fill="var(--color-cta)" />
      <path d="M-12 -2a17 17 0 0 1 24 0M-7 4a9.5 9.5 0 0 1 14 0" fill="none" stroke="var(--color-cta-ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cy="10" r="3" fill="var(--color-cta-ink)" />
    </g>
  </svg>
)

const Bar = ({ w = '100%', inline = false }: { w?: string; inline?: boolean }) => (
  <span className={inline ? 'sk is-inline' : 'sk'} style={{ width: w }} aria-hidden="true" />
)

const SkP = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <p className={className}>
    {Array.from({ length: lines }, (_, i) => (
      <Bar key={i} w={i === lines - 1 && lines > 1 ? '58%' : '100%'} />
    ))}
  </p>
)

function Stamp({ updated }: { updated: string }) {
  return (
    <div className="stamp">
      <b>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
          <path d="M3 8.5h14M7 3v3M13 3v3" />
        </svg>
        최종 수정 {updated ? <time dateTime={updated}>{formatDate(updated)}</time> : <Bar inline w="6.5rem" />}
      </b>
    </div>
  )
}

function Toc({ items }: { items: { id: string; label: ReactNode }[] }) {
  return (
    <nav className="toc" aria-label="목차">
      <div className="toc-title">이 페이지에서 다루는 내용</div>
      <ol>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`}>{it.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Crumbs({ trail }: { trail: PageDef[] }) {
  if (trail.length < 2) return null
  return (
    <div className="topband">
      <div className="container">
        <nav className="crumbs" aria-label="위치">
          <ol>
            {trail.map((c, i) => {
              const label = c.path === '/' ? '홈' : c.h1
              const last = i === trail.length - 1
              return (
                <li key={c.path}>
                  {i > 0 && (
                    <span className="sep" aria-hidden="true">
                      ›{' '}
                    </span>
                  )}
                  {last ? <span aria-current="page">{label}</span> : <Link href={c.path}>{label}</Link>}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </div>
  )
}

/** 섹션 id — 영문 고정. 숫자는 H2 번호(히어로 = 1) */
function sectionId(type: SectionType, index: number, used: Map<string, number>, tableNo?: number) {
  const base =
    type === '정의' || type === '정의+상세'
      ? 'define'
      : type === 'FAQ'
        ? 'faq'
        : type === 'CTA'
          ? 'apply'
          : type === '관련문서'
            ? 'related'
            : tableNo
              ? `table-${tableNo}`
              : `s${index + 2}`
  const n = (used.get(base) ?? 0) + 1
  used.set(base, n)
  return n === 1 ? base : `${base}-${n}`
}

// ── 원고 있음 ─────────────────────────────────────────────

/**
 * 관련 글 목록 — 원고 항목(이 사이트에 살아 있는 링크가 있는 것만) 뒤에 lib/links.ts 가 고른 페이지(고립 방지)를 덧붙인다.
 * 둘 다 없으면(원고 대기 페이지) 트리 자동 생성으로
 */
function DocRelated({ page, s }: { page: PageDef; s: DocSection }) {
  const items = s.blocks
    .flatMap((b) => (b.t === 'ul' ? b.items : []))
    .filter((it) => it.some((sp) => sp.t === 'link' && isPage(hrefOf(sp.href))))
  const extra = autoRelated(page.path)
  if (items.length === 0 && extra.length === 0) return <Related path={page.path} heading={s.heading} />
  return (
    <section id="related">
      <div className="container">
        <h2>{s.heading}</h2>
        <ul className="related-list">
          {items.map((it, j) => (
            <li key={j}>
              <Spans spans={it} />
            </li>
          ))}
          {extra.map((p) => (
            <li key={p.path}>
              <Link href={p.path}>{p.h1}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** 원고 도구 섹션은 설명 문단만 있다 — 계산기가 준비된 페이지는 그 아래에 붙인다 (/tools/coverage/ 는 조회 API 가 없어 아직 없음) */
const TOOL_WIDGETS: Record<string, ReactNode> = {
  '/tools/penalty/': <PenaltyCalc />,
  '/tools/expiry/': <ExpiryCalc />,
}

function DocSectionView({ page, s, id, index }: { page: PageDef; s: DocSection; id: string; index: number }) {
  if (s.type === '관련문서') return <DocRelated page={page} s={s} />
  const has = s.blocks.length > 0
  return (
    <section id={id} className={index % 2 === 0 ? 'is-alt' : undefined} data-sk={has ? undefined : 'true'}>
      <div className="container">
        <h2>{s.heading}</h2>
        {!has ? <SkBody type={s.type} /> : s.type === 'FAQ' ? <FaqBlocks blocks={s.blocks} /> : <Blocks blocks={s.blocks} />}
        {s.type === '도구' && TOOL_WIDGETS[page.path]}
        {s.type === 'CTA' && <LeadForm />}
      </div>
    </section>
  )
}

// ── 원고 없음 (시트 설계 자리) ─────────────────────────────

function TableView({ built }: { built: BuiltTable }) {
  return (
    <div className="table-wrap" data-pending={built.allPending ? 'true' : undefined}>
      <table>
        <caption>{built.caption}</caption>
        <thead>
          <tr>
            {built.head.map((h, j) => (
              <th scope="col" key={j}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {built.rows.map((r, j) => (
            <tr key={j}>
              {r.map((c, k) =>
                k === 0 ? (
                  <th scope="row" key={k}>
                    {c}
                  </th>
                ) : (
                  <td key={k}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SkTable({ size }: { size: string }) {
  const [r, c] = size.split('×').map((n) => Number(n) || 3)
  const cols = Array.from({ length: c }, (_, i) => i)
  return (
    <div className="table-wrap">
      <table>
        <caption>
          <Bar w="14rem" />
        </caption>
        <thead>
          <tr>
            {cols.map((i) => (
              <th scope="col" key={i}>
                <Bar w="4.5rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: r }, (_, j) => (
            <tr key={j}>
              {cols.map((i) =>
                i === 0 ? (
                  <th scope="row" key={i}>
                    <Bar w="4rem" />
                  </th>
                ) : (
                  <td key={i}>
                    <Bar w="4.5rem" />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LinkRow({ paths }: { paths: string[] }) {
  return (
    <ul className="link-row">
      {paths.map((p) => (
        <li key={p}>
          <Link href={p} className="btn-ghost">
            {pageByPath(p)!.h1}
            <Arrow />
          </Link>
        </li>
      ))}
    </ul>
  )
}

const ToolSlot = () => (
  <div className="tool-slot" aria-hidden="true">
    <Bar w="40%" />
    <Bar w="62%" />
    <span className="tool-slot-btn" />
  </div>
)

const SkList = ({ widths }: { widths: string[] }) => (
  <ul>
    {widths.map((w) => (
      <li key={w}>
        <Bar inline w={w} />
      </li>
    ))}
  </ul>
)

function SkBody({ type, memo }: { type: SectionType; memo?: string }) {
  switch (type) {
    case '정의':
    case 'Q&A':
      return <SkP lines={3} />
    case '정의+상세':
      return (
        <>
          <SkP lines={3} />
          <h3>
            <Bar w="28%" />
          </h3>
          <SkP lines={2} />
        </>
      )
    case '상세 h3':
      // 범례: h2 > p > h3 > p — 도입 문단 뒤에 h3
      return (
        <>
          <SkP lines={2} />
          {[0, 1, 2].map((i) => (
            <Fragment key={i}>
              <h3>
                <Bar w="22%" />
              </h3>
              <SkP lines={2} />
            </Fragment>
          ))}
        </>
      )
    case '목록 UL':
      return (
        <>
          <SkP lines={1} />
          <SkList widths={['68%', '54%', '62%', '47%', '58%']} />
        </>
      )
    case '목록 OL':
      return (
        <>
          <SkP lines={1} />
          <ol className="steps">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}>
                <p className="steps-t">
                  <span className="steps-no" aria-hidden="true">
                    Step {i + 1}
                  </span>
                  <Bar inline w="11rem" />
                </p>
              </li>
            ))}
          </ol>
        </>
      )
    case '주의사항':
      return <SkList widths={['70%', '55%', '64%', '48%']} />
    case '신뢰':
      return (
        <>
          <SkP lines={2} />
          <SkList widths={['60%', '52%', '66%']} />
        </>
      )
    case 'FAQ': {
      const n = Number(memo?.match(/(\d+)개/)?.[1] ?? 3)
      return (
        <>
          {Array.from({ length: n }, (_, i) => (
            <div className="faq-item" key={i}>
              <h3>
                <Bar inline w={`${11 + ((i * 2) % 6)}rem`} />
              </h3>
              <p>
                <Bar />
                <Bar w="64%" />
              </p>
            </div>
          ))}
        </>
      )
    }
    case '비교표':
      return (
        <>
          <SkP lines={3} />
          <SkTable size="5×3" />
          <SkP lines={2} />
        </>
      )
    default:
      return (
        <>
          <SkP lines={3} />
          <SkP lines={2} />
        </>
      )
  }
}

function noteOf(index: number, s: SectionDef, def?: TableDef, built?: BuiltTable | null) {
  const parts = [`${index + 2} · ${s.type}`]
  if (s.kw) parts.push(`키워드 ${s.kw}`)
  if (s.type === '비교표')
    parts.push(def ? `표 No.${def.no} · ${def.sources} · ${def.size}${built ? '' : ' · 데이터 빌더 미구현'}` : '표 매핑 없음 — 시트 ②비교표_매핑과 H2 문구 불일치')
  return parts.join(' · ')
}

function SheetSectionView({ page, s, id, index }: { page: PageDef; s: SectionDef; id: string; index: number }) {
  if (s.type === '관련문서') return <Related path={page.path} note={`${index + 2} · 관련문서 (트리에서 자동)`} />

  const def = s.type === '비교표' ? tableFor(page.path, s.h2) : undefined
  const built = def ? buildTable(def) : null
  const links = linksOf(s.memo).filter(isPage)
  const memo = [s.memo, def?.rule].filter(Boolean).join(' / ')

  let body: ReactNode
  if (s.type === '비교표') {
    body = (
      <>
        <SkP lines={3} />
        {built ? <TableView built={built} /> : <SkTable size={def?.size ?? '5×3'} />}
        <SkP lines={2} />
      </>
    )
  } else if (s.type === 'CTA') {
    body = (
      <>
        <SkP lines={2} />
        <LeadForm />
      </>
    )
  } else if (s.type === '도구' || s.type === '전환') {
    body = (
      <>
        <SkP lines={2} />
        {links.length > 0 ? <LinkRow paths={links} /> : s.type === '도구' ? <ToolSlot /> : null}
      </>
    )
  } else {
    body = <SkBody type={s.type} memo={s.memo} />
  }

  return (
    <section id={id} className={index % 2 === 0 ? 'is-alt' : undefined} data-sk="true" data-note={noteOf(index, s, def, built)}>
      <div className="container">
        <h2 data-memo={memo || undefined}>{s.h2}</h2>
        {body}
      </div>
    </section>
  )
}

/** 원고 대기 설계 패널 — 원고가 없는 페이지에만 */
function PlanPanel({ page }: { page: PageDef }) {
  const tableSecs = page.sections.filter((s) => s.type === '비교표')
  const defs = tableSecs.map((s) => tableFor(page.path, s.h2))
  const builtCount = defs.filter((d) => d && buildTable(d)).length
  const unmapped = tableSecs.filter((_, i) => !defs[i]).map((s) => s.h2)
  const missingLinks = [...new Set(page.sections.flatMap((s) => linksOf(s.memo)))].filter((p) => !isPage(p))

  return (
    <aside className="plan-wrap" aria-label="원고 대기 — 설계 정보">
      <div className="container">
        <details className="plan" open>
          <summary>
            원고 대기 · 발행 {page.order}번 · 사이트 {page.site}
          </summary>
          <ul className="plan-list">
            <li>
              <b>원고 파일</b>
              <span>
                <code>content_manuscripts/content/{suggestedFile(page.path)}</code> 에 쓰고 <code>npm run sync</code>
              </span>
            </li>
            <li>
              <b>담당 키워드 {page.keywords.length}개</b>
              <span>
                {page.keywords.join(', ')} (페이지 합계 {page.volume.toLocaleString('ko-KR')})
              </span>
            </li>
            <li>
              <b>히어로 키워드</b>
              <span>{page.hero.kw}</span>
            </li>
            <li>
              <b>비교표</b>
              <span>
                {tableSecs.length}개 · 데이터 연결 {builtCount}/{tableSecs.length}
              </span>
            </li>
            {unmapped.length > 0 && (
              <li>
                <b>표 매핑 없음</b>
                <span>{unmapped.join(' / ')}</span>
              </li>
            )}
            {missingLinks.length > 0 && (
              <li>
                <b>미발행 링크 대상</b>
                <span>{missingLinks.join('  ')}</span>
              </li>
            )}
          </ul>
        </details>
      </div>
    </aside>
  )
}

// ── 페이지 ───────────────────────────────────────────────

export default function PageView({ page, doc, trail }: { page: PageDef; doc: Doc | null; trail: PageDef[] }) {
  const scaffold = !isReady(doc)
  const eyebrow = eyebrowOf(page.path)
  const heroTool = page.heroTool || doc?.heroTool

  const used = new Map<string, number>()
  const rows = doc
    ? doc.sections.map((s, i) => ({ id: sectionId(s.type, i, used), label: s.heading, type: s.type }))
    : page.sections.map((s, i) => ({
        id: sectionId(s.type, i, used, s.type === '비교표' ? tableFor(page.path, s.h2)?.no : undefined),
        label: s.h2,
        type: s.type,
      }))
  const hasTable = rows.some((r) => r.type === '비교표')

  return (
    <>
      {!doc && <PlanPanel page={page} />}
      <Crumbs trail={trail} />
      <article
        data-scaffold={scaffold ? 'true' : undefined}
        data-compare={hasTable ? 'true' : undefined}
        data-md-table={doc?.mdTables ? String(doc.mdTables) : undefined}
      >
        <section id="hero" className="hero" data-sk={doc?.lead ? undefined : 'true'} data-note={doc ? undefined : `1 · 히어로 · 키워드 ${page.hero.kw}`}>
          <div className="container">
            <div className="hero-grid">
              <div className="hero-main">
                {eyebrow && <div className="eyebrow">{eyebrow}</div>}
                <h1 data-memo={!doc && page.hero.memo ? page.hero.memo : undefined}>{doc?.h1 || page.h1}</h1>
                {doc?.lead ? (
                  <p className="hero-lead">
                    <Spans spans={doc.lead} />
                  </p>
                ) : (
                  <SkP lines={3} className="hero-lead" />
                )}
                <div className="hero-actions">
                  {heroTool && (
                    <button type="button" className="btn-cta is-pending" disabled>
                      측정 시작 (준비 중)
                    </button>
                  )}
                  <a href="#apply" className={heroTool ? 'cta btn-ghost' : 'cta btn-cta'}>
                    {doc?.ctaLabel || CTA_LABEL}
                    <Arrow />
                  </a>
                </div>
                <Stamp updated={doc?.updated ?? ''} />
              </div>
              <div className="hero-side">
                <HeroArt />
              </div>
            </div>
            <Toc items={rows.filter((r) => r.type !== '관련문서').map((r) => ({ id: r.id, label: r.label }))} />
          </div>
        </section>

        {doc
          ? doc.sections.map((s, i) => <DocSectionView key={rows[i].id} page={page} s={s} id={rows[i].id} index={i} />)
          : page.sections.map((s, i) => <SheetSectionView key={rows[i].id} page={page} s={s} id={rows[i].id} index={i} />)}
        {/* 원고에 관련 글 섹션이 없어도 고립 방지 링크는 나가야 한다 */}
        {doc && !doc.sections.some((s) => s.type === '관련문서') && (
          <DocRelated page={page} s={{ heading: '함께 보면 좋은 글', type: '관련문서', blocks: [] }} />
        )}
      </article>
      <CtaDock />
    </>
  )
}
