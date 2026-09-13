/** 임시 브랜드 마크 — 와이파이 신호. 옆에 브랜드명(또는 자리 막대)이 있으므로 장식으로 숨긴다. 로고를 받으면 교체 */
export default function BrandMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-7 w-7 shrink-0">
      <rect width="28" height="28" rx="8" fill="var(--color-cta)" />
      <path
        d="M7.2 12.4a9.6 9.6 0 0 1 13.6 0M10.3 15.6a5.2 5.2 0 0 1 7.4 0"
        fill="none"
        stroke="var(--color-cta-ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="19.4" r="1.8" fill="var(--color-cta-ink)" />
    </svg>
  )
}
