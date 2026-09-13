import Link from 'next/link'
import { childrenOf, pageByPath, parentOf } from '@/lib/site'

/**
 * 관련문서 섹션 — 트리에서 자동 생성.
 *   원고 없는 페이지: 시트에 "함께 보면 좋은 글" 이 있으면 이걸로
 *   원고 있는 페이지: 원고 목록의 링크가 이 사이트에 하나도 살아 있지 않을 때만 대체로
 *   허브 → 하위 전부 / 하위 → 허브 / 같은 허브의 형제 (최대 6). 링크 글자는 대상 h1(= 주키워드).
 */
export default function Related({ path, note, heading = '함께 보면 좋은 글' }: { path: string; note?: string; heading?: string }) {
  const children = childrenOf(path)
  const parentPath = parentOf(path)
  const parent = parentPath ? pageByPath(parentPath) : undefined
  const siblings = parentPath ? childrenOf(parentPath).filter((p) => p.path !== path).slice(0, 6) : []

  const seen = new Set<string>()
  const items = [...children, ...(parent ? [parent] : []), ...siblings].filter((p) => !seen.has(p.path) && Boolean(seen.add(p.path)))
  if (items.length === 0) return null

  return (
    <section id="related" data-note={note}>
      <div className="container">
        <h2>{heading}</h2>
        <ul className="related">
          {items.map((p) => (
            <li key={p.path}>
              <Link href={p.path}>{p.h1}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
