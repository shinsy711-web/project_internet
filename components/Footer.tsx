import Link from 'next/link'
import { DISCLAIMER, FOOTER_GROUPS, OPERATOR, SITE_NAME } from '@/lib/site'
import BrandMark from './BrandMark'

/**
 * 푸터 — 전 페이지 사이트맵(고아 페이지 0건 장치) + 필수 고지 + 운영 주체.
 *
 * - 사업자정보는 **확인된 값만.** 값이 없는 줄은 아예 뺀다. 플레이스홀더 금지.
 * - 고지문이 비어 있으면 data-disclaimer-missing 을 달아 scripts/rules-audit.mjs 가 배포를 막게 한다.
 * - 제목 태그(h1~h4)를 쓰지 않는다 — 헤딩 검사가 페이지 전체 HTML 을 훑는다.
 */
export default function Footer() {
  return (
    <footer className="mt-2 border-t border-line bg-surface" data-disclaimer-missing={DISCLAIMER ? undefined : 'true'}>
      <div className="mx-auto max-w-shell px-4 pt-10 pb-12 md:px-6">
        <nav aria-label="사이트맵" className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-line pb-8 sm:grid-cols-3 lg:grid-cols-5">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-3 flex items-center gap-1.5 text-[0.74rem] font-extrabold tracking-[0.04em] text-accent">
                <span aria-hidden="true" className="h-2.5 w-[3px] rounded-full bg-accent" />
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.pages.map((p) => (
                  <li key={p.path}>
                    <Link
                      href={p.path}
                      className="-ml-1.5 block rounded-md px-1.5 py-1.5 text-[0.85rem] text-ink-soft no-underline transition-colors hover:bg-accent-soft hover:text-accent"
                    >
                      {p.h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="pt-8">
          <p className="flex items-center gap-2">
            <BrandMark />
            {SITE_NAME ? (
              <span className="text-[0.98rem] font-extrabold tracking-[-0.02em] text-brand">{SITE_NAME}</span>
            ) : (
              <span className="sk is-inline" style={{ width: '5.5rem' }} aria-hidden="true" />
            )}
          </p>

          <p className="mt-5 inline-flex items-start gap-2 rounded-xl border border-notice-line bg-notice px-3.5 py-2.5 text-[0.85rem] font-bold text-notice-ink">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="mt-0.5 h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2.5 3.5 5v4.4c0 3.5 2.6 6.7 6.5 8.1 3.9-1.4 6.5-4.6 6.5-8.1V5L10 2.5Z" />
              <path d="M10 7.2v3.6" />
              <path d="M10 13.4h.01" />
            </svg>
            {DISCLAIMER || <span className="sk is-inline" style={{ width: 'min(22rem, 60vw)' }} aria-hidden="true" />}
          </p>

          {(OPERATOR.name || OPERATOR.email) && (
            <p className="mt-5 text-[0.78rem] leading-[1.85] text-ink-soft">
              {OPERATOR.name && <>운영: {OPERATOR.name}</>}
              {OPERATOR.email && (
                <>
                  {OPERATOR.name && ' · '}
                  <a href={`mailto:${OPERATOR.email}`} className="underline underline-offset-2 transition-colors hover:text-accent">
                    {OPERATOR.email}
                  </a>
                </>
              )}
            </p>
          )}

          <p className="mt-4 text-[0.75rem] text-ink-soft">© 2026 {SITE_NAME}</p>
        </div>
      </div>
    </footer>
  )
}
