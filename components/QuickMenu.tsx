import type { ReactNode } from 'react'
import Link from 'next/link'
import { QUICK_MENU, type QuickIcon } from '@/lib/site'

/**
 * 오른쪽 빠른 메뉴 — 넓은 화면(1100px 이상)에서만 보인다. 좁은 화면은 하단 바(CtaDock)가 대신한다.
 *
 * - 항목은 lib/site.ts CONFIG.quick. `#apply` 는 모든 페이지에 있고, 경로 항목은 공개 페이지만 나간다.
 * - article 밖에 둔다 — 감사 스크립트의 본문 링크(고립 검사)에 섞이지 않게.
 * - 이름은 접혀 있어도 DOM 글자로 남는다(max-width 0) — 링크 접근 이름이 비지 않는다.
 */

const ICONS: Record<QuickIcon, ReactNode> = {
  chat: <path d="M3.5 5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3.5 3v-3a2 2 0 0 1-2-2Z" />,
  chart: <path d="M4 16.5V10M10 16.5V3.5M16 16.5V7.5" />,
  calc: (
    <>
      <rect x="4" y="2.5" width="12" height="15" rx="2" />
      <path d="M7 6.5h6M7 10.5h.01M10 10.5h.01M13 10.5h.01M7 14h.01M10 14h.01M13 14h.01" />
    </>
  ),
  speed: <path d="M3.5 14a6.5 6.5 0 1 1 13 0M10 14l3-4" />,
  home: <path d="M3.5 9 10 3.5 16.5 9v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1ZM8 17v-4.5h4V17" />,
  gift: (
    <>
      <rect x="3" y="7" width="14" height="4" rx="1" />
      <path d="M4.5 11v5.5h11V11M10 7v9.5M10 7C8.5 4 5.5 4 5.5 5.75S8 7 10 7c2 0 4.5 0 4.5-1.25S11.5 4 10 7Z" />
    </>
  ),
  tv: (
    <>
      <rect x="2.5" y="5" width="15" height="10" rx="2" />
      <path d="M7 17.5h6M7.5 2.5 10 5l2.5-2.5" />
    </>
  ),
  switch: <path d="M4 7h11l-3-3M16 13H5l3 3" />,
}

export default function QuickMenu() {
  if (QUICK_MENU.length === 0) return null

  return (
    <nav className="quick" aria-label="빠른 메뉴">
      <ul>
        {QUICK_MENU.map((q) => {
          const className = q.href === '#apply' ? 'quick-item is-primary' : 'quick-item'
          const inner = (
            <>
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[q.icon]}
              </svg>
              <span className="quick-label">{q.label}</span>
            </>
          )
          return (
            <li key={q.href}>
              {q.href.startsWith('#') ? (
                <a href={q.href} className={className}>
                  {inner}
                </a>
              ) : (
                <Link href={q.href} className={className}>
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
