'use client'

import { useEffect, useState } from 'react'
import { CARRIERS, formatDay, penalty, toTime, todayISO, won, type Carrier } from '@/lib/calc'

/** /tools/penalty/ 도구 섹션 계산기 — 식과 출처는 lib/calc.ts */
export default function PenaltyCalc() {
  const [carrier, setCarrier] = useState<Carrier>('KT')
  const [years, setYears] = useState(3)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [monthly, setMonthly] = useState('')
  const [total, setTotal] = useState('')

  // 오늘 날짜는 정적 빌드 시점이 아니라 방문 시점으로
  useEffect(() => setEnd(todayISO()), [])

  const digits = (v: string) => v.replace(/\D/g, '')
  const valid = toTime(start) < toTime(end) && Boolean(monthly || total)
  const r = valid ? penalty({ carrier, years, start, end, monthly: Number(monthly), total: total ? Number(total) : undefined }) : null
  const c = CARRIERS.find((x) => x.value === carrier)!

  return (
    <div className="calc-card">
      <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
        <label className="calc-field">
          <span>통신사</span>
          <select value={carrier} onChange={(e) => setCarrier(e.target.value as Carrier)}>
            {CARRIERS.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        <label className="calc-field">
          <span>약정 기간</span>
          <select value={years} onChange={(e) => setYears(Number(e.target.value))}>
            {[1, 2, 3].map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </label>
        <label className="calc-field">
          <span>가입일 (재약정일)</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="calc-field">
          <span>해지 예정일</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label className="calc-field">
          <span>월 할인액 (원)</span>
          <input type="text" inputMode="numeric" placeholder="숫자만 입력" value={monthly} onChange={(e) => setMonthly(digits(e.target.value))} />
        </label>
        <label className="calc-field">
          <span>할인총액 (선택)</span>
          <input type="text" inputMode="numeric" placeholder="숫자만 입력" value={total} onChange={(e) => setTotal(digits(e.target.value))} />
          <small>청구서 금액이 있으면 이 값으로 계산합니다</small>
        </label>
      </form>

      <div className="calc-result" aria-live="polite">
        {!r ? (
          <p className="calc-hint">가입일, 해지 예정일, 월 할인액을 입력하면 결과가 나옵니다.</p>
        ) : r.expired ? (
          <p className="calc-row is-total">
            <span>할인반환금</span>
            <b>없음 (약정 만료)</b>
          </p>
        ) : (
          <>
            <p className="calc-row">
              <span>이용 기간</span>
              <b>
                {r.usedDays}일 ({r.usedMonths}개월)
              </b>
            </p>
            <p className="calc-row">
              <span>할인총액</span>
              <b>{won(r.discountTotal)}</b>
            </p>
            <p className="calc-row">
              <span>반환 비율</span>
              <b>{(r.rate * 100).toFixed(1)}%</b>
            </p>
            <p className="calc-row is-total">
              <span>예상 할인반환금</span>
              <b>{won(r.amount)}</b>
            </p>
            <p className="calc-hint">
              할인총액 × 잔여 {r.remainingDays}일 ÷ (약정 {r.contractDays}일 − {r.grace}일)
              {r.rate === 1 ? ' — 초기 구간이라 할인총액 전액' : ''}
              {total ? '' : ' · 할인총액 = 월 할인액 × 이용개월'}
            </p>
          </>
        )}
        {toTime(start) < toTime(c.since) && (
          <p className="calc-warn">
            {c.label}는 {formatDay(toTime(c.since))} 이전 가입·재약정 건에 구 방식(구간별 반환율)을 씁니다. 실제 금액과 다를 수 있습니다.
          </p>
        )}
        {carrier === 'KT' && r && !r.expired && <p className="calc-hint">KT 결합 할인 반환금은 구 방식으로 따로 계산됩니다.</p>}
      </div>
    </div>
  )
}
