import { CTA_DOCK_TEXT, CTA_LABEL } from '@/lib/site'

/**
 * 떠 있는 하단 CTA 바 (project32 구조)
 *
 *   - JS 0줄. 스크롤 후 등장은 CSS animation-timeline: scroll() 로만. 미지원 브라우저는 처음부터 보인다.
 *   - 같은 높이 스페이서 + html scroll-padding-bottom 으로 본문·앵커 도착 지점을 가리지 않는다.
 *   - 여는 곳은 같은 페이지의 #apply 섹션(폼이 아니라 앵커).
 *   - article 밖에 둔다 — 본문 헤딩·목록 검사에 섞이지 않게.
 */
export default function CtaDock() {
  return (
    <>
      <div className="cta-bar-spacer" aria-hidden="true" />
      <div className="cta-bar">
        <div className="cta-bar-inner">
          <p className="cta-bar-text">
            {CTA_DOCK_TEXT ? <b>{CTA_DOCK_TEXT}</b> : <span className="sk is-inline" style={{ width: '9rem' }} aria-hidden="true" />}
          </p>
          <a href="#apply" className="btn-cta">
            {CTA_LABEL}
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 4v11" />
              <path d="m5.5 10.5 4.5 5 4.5-5" />
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}
