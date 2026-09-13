'use client'

import { useId, useState, type FormEvent } from 'react'

/**
 * 상담 폼 본체 — 휴대폰 번호 + 수집 동의 + 제3자 제공 동의 + 만 14세 (원고 CTA 주석)
 *
 * 제출처는 project21_db 공용 수집 서버(`/api/submit?api_key=`). 서버는 `cellphone` · `category` · `purpose` · `location` 을 컬럼으로,
 * 나머지(동의 여부)는 raw_data 로 저장한다.
 * ⚠️ 키 확인용으로 실제 키에 POST 하지 말 것 — 빈 본문도 저장되고 디스코드 알림이 간다.
 */

type Props = {
  /** 제출 URL(`…/api/submit?api_key=…`). 비어 있으면 준비 중 */
  endpoint: string
  label: string
  /** 개인정보 수집 주체 */
  collector: string
  /** 제3자 제공받는 자 */
  recipient: string
  category: string
}

const PHONE = /^01[016789]\d{7,8}$/
const NO_AGREE = { collect: false, third: false, age: false }

export default function LeadFormClient({ endpoint, label, collector, recipient, category }: Props) {
  const uid = useId()
  const ready = Boolean(endpoint && collector && recipient)
  const [phone, setPhone] = useState('')
  const [agree, setAgree] = useState(NO_AGREE)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const all = agree.collect && agree.third && agree.age
  const fail = (msg: string) => {
    setStatus('error')
    setMessage(msg)
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!ready || status === 'sending') return
    const digits = phone.replace(/\D/g, '')
    if (!PHONE.test(digits)) return fail('휴대폰 번호를 다시 확인해 주세요.')
    if (!all) return fail('필수 동의 항목에 모두 동의해 주세요.')

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
          consent_third_party: 'Y',
          age_14: 'Y',
        }),
      })
      if (!res.ok) return fail('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      setStatus('done')
      setMessage('상담 신청이 접수되었습니다. 담당자가 곧 연락드리겠습니다.')
      setPhone('')
      setAgree(NO_AGREE)
    } catch {
      fail('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  const noteId = `${uid}-note`
  const off = !ready

  return (
    <div className="lead-card">
      <form className="lead-form" onSubmit={submit} noValidate aria-describedby={noteId}>
        <label className="lead-field">
          <span>휴대폰 번호</span>
          <input
            type="tel"
            name="phone"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="숫자만 입력"
            maxLength={13}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d-]/g, ''))}
            disabled={off}
          />
        </label>

        <label className="lead-consent lead-consent-all">
          <input
            type="checkbox"
            checked={all}
            onChange={() => setAgree(all ? NO_AGREE : { collect: true, third: true, age: true })}
            disabled={off}
          />
          <span>필수 항목 모두 동의</span>
        </label>

        <label className="lead-consent">
          <input type="checkbox" name="consent_collect" checked={agree.collect} onChange={(e) => setAgree({ ...agree, collect: e.target.checked })} disabled={off} />
          <span>개인정보 수집·이용 동의 (필수)</span>
        </label>
        {ready && (
          <details className="lead-terms">
            <summary>내용 보기</summary>
            <p>
              수집 주체: {collector}
              <br />
              수집 목적: 인터넷 가입·변경 상담 및 문의 응대
              <br />
              수집 항목: 휴대폰 번호
              <br />
              보유 기간: 수집일로부터 1년 (요청 시 즉시 파기)
              <br />
              동의를 거부할 수 있으며, 거부하면 상담 신청이 제한됩니다.
            </p>
          </details>
        )}

        <label className="lead-consent">
          <input type="checkbox" name="consent_third_party" checked={agree.third} onChange={(e) => setAgree({ ...agree, third: e.target.checked })} disabled={off} />
          <span>개인정보 제3자 제공 동의 (필수)</span>
        </label>
        {ready && (
          <details className="lead-terms">
            <summary>내용 보기</summary>
            <p>
              제공받는 자: {recipient}
              <br />
              제공 목적: 인터넷 가입 조건 안내 및 유선 상담
              <br />
              제공 항목: 휴대폰 번호
              <br />
              보유 기간: 상담 목적 달성 시 즉시 파기 (최대 수집일로부터 1년)
              <br />
              동의를 거부할 수 있으며, 거부하면 상담 신청이 제한됩니다.
            </p>
          </details>
        )}

        <label className="lead-consent">
          <input type="checkbox" name="age_14" checked={agree.age} onChange={(e) => setAgree({ ...agree, age: e.target.checked })} disabled={off} />
          <span>만 14세 이상입니다 (필수)</span>
        </label>

        <button type="submit" className={off ? 'btn-cta is-pending' : 'btn-cta'} disabled={off || status === 'sending'}>
          {status === 'sending' ? '전송 중…' : label}
        </button>
        <p id={noteId} className={`lead-note${status === 'done' ? ' is-done' : status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
          {off ? '상담 신청 폼은 준비 중입니다.' : message}
        </p>
      </form>
    </div>
  )
}
