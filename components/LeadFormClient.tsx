'use client'

import { useId, useState, type FormEvent } from 'react'

/**
 * 상담 폼 본체 — 휴대폰 번호 하나 + 수집·이용 동의 하나 (+ thirdParty 면 제3자 제공 동의). 백메가·통신직구와 같은 최소 수집
 *
 * 두 곳에서 쓴다: #apply 섹션 카드(variant card) · 상담 링크를 누르면 뜨는 모달(LeadDialog, variant modal).
 * 동의 "보기" 는 페이지에 하나 있는 #privacy-dialog(PrivacyDialog — 서버 렌더)를 연다.
 *
 * 제출처는 project21_db 공용 수집 서버(`/api/submit?api_key=`). 서버는 `cellphone` · `category` · `purpose` · `location` 을 컬럼으로,
 * 동의 여부는 raw_data 로 저장한다. 입력 칸을 늘리면 PrivacyDialog · app/privacy 수집 항목도 같이 고칠 것.
 * ⚠️ 키 확인용으로 실제 키에 POST 하지 말 것 — 빈 본문도 저장되고 디스코드 알림이 간다.
 * ⚠️ 사이트 B — 폼 주변에 금액을 쓰지 않는다. 제목 태그(h1~h4) · ul 금지 — 감사 스크립트가 #apply 섹션 안을 훑는다.
 */

type Props = {
  /** 제출 URL(`…/api/submit?api_key=…`) */
  endpoint: string
  /** 엔드포인트 · 수집 주체 · 제공받는 자가 다 찼는지 (lib/site.ts FORM_READY). 아니면 준비 중 */
  ready: boolean
  label: string
  category: string
  /** 접수 정보를 다른 업체에 넘기는지 (lib/site.ts LEAD.thirdParty). false 면 제3자 제공 동의 항목이 없다 */
  thirdParty: boolean
  variant?: 'card' | 'modal'
}

const PHONE = /^01[016789]\d{7,8}$/
const NO_AGREE = { collect: false, third: false }
/** 처음 상태 — 수집·이용 동의는 체크된 채로 시작(2026-10-15 요청). 제3자 제공 동의는 미리 체크하지 않는다 */
const DEFAULT_AGREE = { collect: true, third: false }

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

/** 동의서 모달을 열고 해당 조항으로 */
function openTerms(anchor: string) {
  const dialog = document.getElementById('privacy-dialog')
  if (!(dialog instanceof HTMLDialogElement)) return
  if (!dialog.open) dialog.showModal()
  document.getElementById(anchor)?.scrollIntoView({ block: 'start' })
}

const Icon = ({ d, className }: { d: string; className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

export default function LeadFormClient({ endpoint, ready, label, category, thirdParty, variant = 'card' }: Props) {
  const uid = useId()
  const [phone, setPhone] = useState('')
  const [agree, setAgree] = useState(DEFAULT_AGREE)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const off = !ready
  const all = agree.collect && (!thirdParty || agree.third)
  const fail = (msg: string) => {
    setStatus('error')
    setMessage(msg)
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (off || status === 'sending') return
    const digits = phone.replace(/\D/g, '')
    if (!PHONE.test(digits)) return fail('휴대폰 번호를 다시 확인해 주세요.')
    if (!all) return fail('개인정보 수집·이용에 동의해 주세요.')

    setStatus('sending')
    setMessage('')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cellphone: digits,
          category,
          purpose: document.querySelector('h1')?.textContent?.trim() ?? '',
          location: window.location.href,
          consent_collect: 'Y',
          ...(thirdParty ? { consent_third_party: 'Y' } : {}),
        }),
      })
      if (!res.ok) return fail('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      setStatus('done')
      setMessage('상담 신청이 접수되었습니다. 담당자가 곧 연락드리겠습니다.')
      setPhone('')
      setAgree(DEFAULT_AGREE)
    } catch {
      fail('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  const noteId = `${uid}-note`
  const phoneId = `${uid}-phone`
  const note = off ? '상담 신청 폼은 준비 중입니다.' : message || '입력하신 번호로 담당자가 연락드립니다.'

  return (
    <div className={variant === 'modal' ? 'lead-card is-plain' : 'lead-card'}>
      <form className="lead-form" onSubmit={submit} noValidate aria-describedby={noteId}>
        <div className="lead-field">
          <label htmlFor={phoneId}>연락처</label>
          <div className="lead-input">
            <Icon d="M5.5 3h2.2l1.3 3.4-1.6 1.1a8.5 8.5 0 0 0 5.1 5.1l1.1-1.6 3.4 1.3v2.2a1.5 1.5 0 0 1-1.6 1.5A13.5 13.5 0 0 1 4 4.6 1.5 1.5 0 0 1 5.5 3Z" />
            <input
              id={phoneId}
              type="tel"
              name="phone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="010-0000-0000"
              maxLength={13}
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              disabled={off}
            />
          </div>
        </div>

        <div className="lead-agree">
          {thirdParty && (
            <label className="lead-consent lead-consent-all">
              <input type="checkbox" checked={all} onChange={() => setAgree(all ? NO_AGREE : { collect: true, third: true })} disabled={off} />
              <span>필수 항목 모두 동의</span>
            </label>
          )}
          <div className="lead-consent-row">
            <label className="lead-consent">
              <input type="checkbox" name="consent_collect" checked={agree.collect} onChange={(e) => setAgree({ ...agree, collect: e.target.checked })} disabled={off} />
              <span>
                개인정보 수집·이용 동의 <span className="lead-req">(필수)</span>
              </span>
            </label>
            <button type="button" className="lead-view" onClick={() => openTerms('privacy-collect')}>
              보기
            </button>
          </div>
          {thirdParty && (
            <div className="lead-consent-row">
              <label className="lead-consent">
                <input type="checkbox" name="consent_third_party" checked={agree.third} onChange={(e) => setAgree({ ...agree, third: e.target.checked })} disabled={off} />
                <span>
                  개인정보 제3자 제공 동의 <span className="lead-req">(필수)</span>
                </span>
              </label>
              <button type="button" className="lead-view" onClick={() => openTerms('privacy-third')}>
                보기
              </button>
            </div>
          )}
        </div>

        <button type="submit" className={off ? 'btn-cta is-pending' : 'btn-cta'} disabled={off || status === 'sending'}>
          {status === 'sending' ? '전송 중…' : label}
          {status !== 'sending' && <Icon d="M4 10h11m-4.5-4.5 5 4.5-5 4.5" className="h-4 w-4 shrink-0" />}
        </button>
        {/* div — 히어로(section#hero) 안에도 들어가서 <p> 를 쓰지 않는다(감사 [8] 히어로 문단 1개) */}
        <div id={noteId} className={`lead-note${status === 'done' ? ' is-done' : status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
          {note}
        </div>
      </form>
    </div>
  )
}
