'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandMark from './BrandMark'

/**
 * 헤더 — project32 탭 바 구조.
 *
 * **햄버거 토글을 쓰지 않는다.** JS 로 링크를 감추면 서버 HTML 에서 빠지고 네이버 크롤러가 내부링크를 못 본다.
 * 제목 태그(h1~h4)를 쓰지 않는다 — h1 1개(규칙 3)·헤딩 순서(11) 검사가 페이지 전체를 본다.
 * 내비 목록은 루트 레이아웃이 props 로 넘긴다 — lib/site.ts(페이지 레지스트리 포함)를 클라이언트 번들에 싣지 않으려고.
 */
export default function Header({ nav, siteName }: { nav: { path: string; label: string }[]; siteName: string }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-shell flex-col px-4 md:h-16 md:flex-row md:items-stretch md:justify-between md:gap-6 lg:px-6">
        <Link href="/" aria-label={siteName || '홈'} className="flex shrink-0 items-center gap-2 pt-2.5 no-underline md:pt-0">
          <BrandMark />
          {siteName ? (
            <span className="text-[1.02rem] font-black tracking-[-0.03em] text-ink">{siteName}</span>
          ) : (
            <span className="sk is-inline" style={{ width: '5.5rem' }} aria-hidden="true" />
          )}
        </Link>

        <nav aria-label="주요 메뉴" className="-mx-2.5 md:mx-0">
          <ul className="hnav-list">
            {nav.map((item) => {
              const active = pathname === item.path
              return (
                <li key={item.path} className="md:flex">
                  <Link href={item.path} aria-current={active ? 'page' : undefined} className={active ? 'hnav is-active' : 'hnav'}>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
