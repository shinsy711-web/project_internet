import type { Metadata } from 'next'
import { isReady, loadDoc } from '@/lib/content'
import { pageGraph } from '@/lib/jsonld'
import { og, pageByPath, trailOf } from '@/lib/site'
import JsonLd from './JsonLd'
import PageView from './PageView'

/**
 * 홈과 나머지 전부가 같이 쓰는 metadata + 렌더.
 * - title · description 은 원고 프런트매터, 원고가 없으면 시트 TITLE.
 * - og:title · og:description 필수(규칙 6), canonical 자기 참조 + robots(규칙 39).
 * - 원고 대기 페이지는 noindex, sitemap 에서도 빠진다.
 */
export function metadataFor(path: string): Metadata {
  const page = pageByPath(path)
  if (!page) return {}
  const doc = loadDoc(path)
  const title = doc?.title || page.title
  const description = doc?.description || `${page.h1} — 원고 대기 중인 페이지입니다.`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: og(title, description, path),
    ...(isReady(doc) ? {} : { robots: { index: false, follow: true } }),
  }
}

export default function RoutePage({ path }: { path: string }) {
  const page = pageByPath(path)!
  const doc = loadDoc(path)
  const trail = trailOf(path)

  const graph = pageGraph({
    path,
    trail: trail.map((t) => ({ name: t.path === '/' ? '홈' : t.h1, path: t.path })),
    // 규칙 31 — headline 은 화면 h1 과 같은 글자
    article: doc && isReady(doc) ? { headline: doc.h1 || page.h1, description: doc.description, published: doc.published, modified: doc.updated } : null,
  })

  return (
    <>
      {graph && <JsonLd data={graph} />}
      <PageView page={page} doc={doc} trail={trail} />
    </>
  )
}
