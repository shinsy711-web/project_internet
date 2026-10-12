import { SITE_NAME } from '@/lib/site'
import BrandMark from './BrandMark'
import LeadDialogClient from './LeadDialogClient'
import LeadForm from './LeadForm'
import Mascot from './Mascot'

/**
 * 상담 모달 — 제목 · 알림 배너 · 폼. 열고 닫기는 LeadDialogClient.
 * article 밖에 둔다. 제목 태그(h1~h4) 금지 — 헤딩 검사가 페이지 전체 HTML 을 훑는다(제목은 <p> + aria-labelledby).
 * 문구는 원고 절차("결합할인과 제휴카드 적용 후 실제 월 요금")에서 — 금액 · 지원금 약속을 쓰지 않는다.
 */
export default function LeadDialog() {
  return (
    <LeadDialogClient labelledBy="lead-dialog-title">
      <div className="dialog-head">
        <span className="dialog-badge">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
            <path d="m10 2.5 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7Z" />
          </svg>
          무료 요금 상담
        </span>
        <p id="lead-dialog-title" className="dialog-title">
          내 조건에 맞는 요금을 알아볼까요?
        </p>
        <p className="dialog-sub">
          휴대폰 번호만 남기면 <b>결합할인까지 반영한 실제 월 요금</b>을 안내해 드립니다
        </p>
      </div>

      <div className="lead-banner" aria-hidden="true">
        <Mascot pose="peek" className="lead-banner-peek" />
        <div className="lead-banner-card">
          <BrandMark />
          <span className="lead-banner-app">{SITE_NAME ? `${SITE_NAME} 알림` : <span className="sk is-inline" style={{ width: '4.5rem' }} />}</span>
          <span className="lead-banner-time">지금</span>
          <b className="lead-banner-msg">상담 신청이 접수되면 담당자가 연락드려요</b>
        </div>
      </div>

      <LeadForm variant="modal" />
    </LeadDialogClient>
  )
}
