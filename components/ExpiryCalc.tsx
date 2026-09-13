'use client'

import { useEffect, useState } from 'react'
import { expiry, formatDay, toTime, todayISO } from '@/lib/calc'

/** /tools/expiry/ 도구 섹션 계산기 — 식은 lib/calc.ts */
export default function ExpiryCalc() {
  const [start, setStart] = useState('')
  const [years, setYears] = useState(3)
  const [today, setToday] = useState('')

  // 남은 일수는 정적 빌드 시점이 아니라 방문 시점 기준
  useEffect(() => setToday(todayISO()), [])

  const r = today && !Number.isNaN(toTime(start)) ? expiry(start, years, today) : null

  return (
    <div className="calc-card">
      <form className="calc-form" onSubmit={(e) => e.preventDefault()}>
        <label className="calc-field">
          <span>가입일 (재약정일)</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <small>재약정했다면 재약정일을 넣으세요</small>
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
      </form>

      <div className="calc-result" aria-live="polite">
        {!r ? (
          <p className="calc-hint">가입일과 약정 기간을 입력하면 만료일이 나옵니다.</p>
        ) : (
          <>
            <p className="calc-row is-total">
              <span>약정 만료일</span>
              <b>{formatDay(r.end)}</b>
            </p>
            {r.daysLeft >= 0 ? (
              <p className="calc-row">
                <span>남은 기간</span>
                <b>{r.daysLeft}일</b>
              </p>
            ) : (
              <p className="calc-row">
                <span>상태</span>
                <b>만료 후 {-r.daysLeft}일 · 위약금 없음</b>
              </p>
            )}
            {r.daysLeft > 0 && (
              <p className="calc-row">
                <span>변경 조건 알아보기</span>
                <b>{formatDay(r.prepare)}부터</b>
              </p>
            )}
            <p className="calc-hint">가입일 당일을 첫날로 센 날짜입니다. 통신사 전산 기준과 하루 차이가 날 수 있습니다.</p>
          </>
        )}
      </div>
    </div>
  )
}
