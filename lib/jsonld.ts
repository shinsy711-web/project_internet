/**
 * 구조화 데이터 — 규칙 27: Article + BreadcrumbList + Organization **만**.
 *
 *   - FAQPage 를 달지 않는다 (규칙 28 — 2026-06 문서 삭제). FAQ 섹션 자체는 화면에 유지한다(33).
 *   - WebSite · Product · ItemList · Table · HowTo 도 넣지 않는다 (27 · 29 · 30).
 *   - 값은 화면 텍스트와 일치 (규칙 31): 브레드크럼 이름 = 화면 브레드크럼 글자, Article.headline = 화면 h1.
 *   - 주입은 components/JsonLd.tsx 의 <script> 로만. next/script 는 서버 HTML 에 태그가 안 나간다.
 */
import { OG_IMAGE, SITE_NAME, SITE_URL, absUrl } from './site'

const orgId = `${SITE_URL}/#organization`

/** 루트 레이아웃에서 1회. 브랜드명이 없으면 넣지 않는다 */
export function orgGraph() {
  if (!SITE_NAME) return null
  return { '@context': 'https://schema.org', '@type': 'Organization', '@id': orgId, name: SITE_NAME, url: `${SITE_URL}/` }
}

export function pageGraph(opts: {
  path: string
  trail: { name: string; path: string }[]
  article: { headline: string; description: string; published: string; modified: string } | null
}) {
  const url = absUrl(opts.path)
  const graph: Record<string, unknown>[] = []

  if (opts.trail.length >= 2) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: opts.trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absUrl(t.path) })),
    })
  }

  if (opts.article) {
    const a = opts.article
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: a.headline,
      description: a.description,
      inLanguage: 'ko-KR',
      mainEntityOfPage: url,
      ...(a.published ? { datePublished: a.published } : {}),
      ...(a.modified ? { dateModified: a.modified } : {}),
      ...(OG_IMAGE ? { image: OG_IMAGE } : {}),
      ...(SITE_NAME ? { author: { '@id': orgId }, publisher: { '@id': orgId } } : {}),
    })
  }

  return graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null
}
