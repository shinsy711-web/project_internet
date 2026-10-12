'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * 상담 모달 껍데기 — 페이지의 `#apply` 링크(히어로 CTA · 하단 바 · 빠른 메뉴 · 본문 인라인 링크)를 누르면 연다.
 *
 * - JS 가 없거나 막히면 링크는 원래대로 #apply 섹션으로 스크롤된다(점진적 향상). 목차 링크는 스크롤 그대로.
 * - 네이티브 <dialog> — 포커스 가두기 · Esc 닫기는 브라우저가 한다. × 는 form[method=dialog].
 * - 내용(제목 · 배너 · 폼)은 서버 컴포넌트 LeadDialog 가 children 으로 넘긴다.
 */
export default function LeadDialogClient({ children, labelledBy }: { children: ReactNode; labelledBy: string }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = e.target instanceof Element ? e.target.closest('a[href="#apply"]') : null
      const dialog = ref.current
      if (!link || !dialog || dialog.open || link.closest('.toc, dialog')) return
      e.preventDefault()
      dialog.showModal()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <dialog
      ref={ref}
      className="dialog lead-dialog"
      aria-labelledby={labelledBy}
      onClick={(e) => {
        // 바깥(backdrop)을 누른 경우만 — 안쪽 요소를 누르면 target 이 dialog 자신이 아니다
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      <form method="dialog" className="dialog-x">
        <button type="submit" aria-label="닫기">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      </form>
      <div className="dialog-scroll">{children}</div>
    </dialog>
  )
}
