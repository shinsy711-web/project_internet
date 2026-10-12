import type { ReactNode } from 'react'
import { LEAD, OPERATOR, PRIVACY_PATH } from '@/lib/site'

/**
 * 개인정보 수집·이용 · 제3자 제공 동의서 모달 — 페이지에 하나. 상담 폼의 "보기" 가 연다(LeadFormClient openTerms).
 *
 * - 네이티브 <dialog>. 닫기(× · 확인했습니다)는 form[method=dialog] 라 JS 가 필요 없다.
 * - **폼이 실제로 보내는 것만 적는다** — 휴대폰 번호 · 고른 희망 조건 · 신청 페이지. 폼 필드를 바꾸면 여기도 고칠 것.
 * - 수집 주체 · 제공받는 자는 lib/site.ts LEAD. 비어 있으면 자리 막대(플레이스홀더 글자 금지) — 이때 폼도 준비 중이다.
 * - article 밖. 제목 태그(h1~h4) · <table> · <dl> · <ul> 를 쓰지 않는다 — 감사 스크립트가 헤딩·dl 을 페이지 전체에서 찾는다.
 * - 발행 전 법무 검토 필요. 처리방침 전문은 app/privacy/page.tsx — 항목·기간·제공 내용을 여기와 같게 유지할 것.
 */

const Blank = () => <span className="sk is-inline" style={{ width: '7rem' }} aria-hidden="true" />

function Rows({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return (
    <div className="privacy-rows">
      {rows.map(([label, value]) => (
        <div className="privacy-row" key={label}>
          <b>{label}</b>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function PrivacyDialog() {
  const collector = LEAD.collector || <Blank />
  const recipient = LEAD.recipient || <Blank />

  return (
    <dialog id="privacy-dialog" className="dialog privacy-dialog" aria-labelledby="privacy-dialog-title">
      <form method="dialog" className="dialog-x">
        <button type="submit" aria-label="닫기">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      </form>

      <div className="dialog-head">
        <span className="dialog-badge">PRIVACY</span>
        <p id="privacy-dialog-title" className="dialog-title">
          개인정보 수집·이용 동의
        </p>
        <p className="dialog-sub">{LEAD.thirdParty ? '개인정보 수집·이용 및 제3자 제공 동의서' : '개인정보 수집 및 이용 동의서'}</p>
      </div>

      <div className="dialog-scroll" tabIndex={0}>
        <div className="privacy-sec" id="privacy-collect">
          <p className="privacy-sec-t">1. 수집하는 개인정보 항목 및 이용 목적</p>
          <p>{collector}(이하 &lsquo;운영자&rsquo;)는 인터넷 가입·변경 상담을 위해 아래 정보만 수집합니다.</p>
          <Rows
            rows={[
              ['휴대폰 번호 (필수)', '상담 연락, 가입 조건 안내'],
              ['상담 희망 조건 (선택)', '통신사·속도·구성·휴대폰 결합 여부 — 조건에 맞는 요금 계산'],
              ['신청한 페이지', '문의 경로 확인'],
            ]}
          />
        </div>

        <div className="privacy-sec" id="privacy-period">
          <p className="privacy-sec-t">2. 개인정보의 보유 및 이용 기간</p>
          <p>수집일로부터 1년 동안 보관하며, 기간이 지나거나 삭제를 요청하면 지체 없이 파기합니다.</p>
          <p className="privacy-small">관계 법령에 따라 보존해야 하는 경우에는 해당 법령에서 정한 기간 동안 보관합니다.</p>
        </div>

        {LEAD.thirdParty ? (
          <div className="privacy-sec is-key" id="privacy-third">
            <p className="privacy-sec-t">
              3. 개인정보의 제3자 제공 <span className="privacy-key-badge">중요</span>
            </p>
            <p>운영자는 상담과 가입 안내를 위해 이용자의 동의를 받아 아래와 같이 개인정보를 제공합니다.</p>
            <Rows
              rows={[
                ['제공받는 자', recipient],
                ['제공 목적', '인터넷 가입 조건 안내 및 유선 상담'],
                ['제공 항목', '휴대폰 번호, 상담 희망 조건(고른 경우)'],
                ['보유·이용 기간', '상담 목적 달성 시 즉시 파기 (최대 수집일로부터 1년)'],
                ['동의 거부 권리', '동의하지 않을 수 있으며, 동의하지 않으면 상담 신청이 제한됩니다.'],
              ]}
            />
            <p className="privacy-small">(※ 법령에 특별한 규정이 있거나, 수사기관이 법령에 정해진 절차에 따라 요구하는 경우는 예외로 합니다.)</p>
          </div>
        ) : (
          <div className="privacy-sec" id="privacy-third">
            <p className="privacy-sec-t">3. 개인정보의 제3자 제공</p>
            <p>운영자는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 접수된 상담은 운영자가 직접 진행합니다.</p>
            <p className="privacy-small">(※ 법령에 특별한 규정이 있거나, 수사기관이 법령에 정해진 절차에 따라 요구하는 경우는 예외로 합니다.)</p>
          </div>
        )}

        <div className="privacy-sec" id="privacy-age">
          <p className="privacy-sec-t">4. 만 14세 미만 아동</p>
          <p>만 14세 미만 아동은 상담을 신청할 수 없습니다. 신청할 때 만 14세 이상임을 확인받습니다.</p>
        </div>

        <div className="privacy-sec" id="privacy-rights">
          <p className="privacy-sec-t">5. 이용자의 권리 및 행사 방법</p>
          <p>이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리정지를 요구할 수 있으며, 운영자는 지체 없이 조치합니다.</p>
          {OPERATOR.email && (
            <p>
              요청: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
            </p>
          )}
        </div>

        <div className="privacy-sec" id="privacy-refuse">
          <p className="privacy-sec-t">6. 동의 거부 권리 및 불이익 안내</p>
          <p>
            개인정보 수집·이용{LEAD.thirdParty ? '과 제3자 제공' : ''}에 동의하지 않을 수 있습니다. 다만 필수 항목에 동의하지 않으면 상담 신청이 제한됩니다.
          </p>
          <p>
            <a href={PRIVACY_PATH}>개인정보 처리방침 전문 보기</a>
          </p>
        </div>
      </div>

      <form method="dialog" className="privacy-foot">
        <button type="submit" className="btn-cta">
          확인했습니다
        </button>
      </form>
    </dialog>
  )
}
