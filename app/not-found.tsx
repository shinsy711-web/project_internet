import Link from 'next/link'
import { HEADER_NAV } from '@/lib/site'

export const metadata = { title: '페이지를 찾을 수 없습니다', robots: { index: false, follow: true } }

/** 404 — 막다른 길로 끝내지 않고 허브 목록을 준다. noindex 라 규칙 감사 대상이 아니다 */
export default function NotFound() {
  const destinations = [{ path: '/', label: '홈' }, ...HEADER_NAV]

  return (
    <article>
      <section id="hero" className="hero">
        <div className="container">
          <div className="eyebrow">404</div>
          <h1>찾으시는 페이지가 없습니다</h1>
          <p className="hero-lead">주소가 바뀌었거나 삭제된 페이지일 수 있습니다. 아래 목록에서 골라 주세요.</p>
          <ul className="related">
            {destinations.map((d) => (
              <li key={d.path}>
                <Link href={d.path}>{d.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  )
}
