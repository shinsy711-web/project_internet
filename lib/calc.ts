/**
 * 위약금 · 약정 만료일 계산 — /tools/penalty/ · /tools/expiry/ 계산기 (클라이언트에서 돈다 — fs 금지)
 *
 * 할인반환금 = 할인총액 × 잔여일수 ÷ (약정일수 − 제외일수), 비율은 0~100% 로 자른다
 *   KT    : 제외 180일, 약정 길이 무관. KT 초고속인터넷 약관 주요설명서(2025-07) "’23.9.8일 이후 접수고객"
 *           `할인 받은 총금액 × (1 − (이용기간−180일)/(약정기간−180일))` 과 같은 식
 *   SK·LG : 1년 90일 · 2년 180일 · 3년 240일 — 원고 /tools/penalty/ (LG 공개 예시 126,295원으로 검산됨)
 *   스마트초이스 계산기의 구 방식 테이블은 쓰지 않는다 (원고 README).
 * 할인총액 = 월 할인액 × 이용개월. 이용개월 = 이용일수 × 12 ÷ 365 반올림 (LG 예시가 395일을 13개월로 센다). 청구서 금액을 넣으면 그 값을 쓴다.
 */
export type Carrier = 'KT' | 'SK' | 'LG'

/** since — 일수비례 식이 적용되는 가입·재약정일 (원고 /tools/penalty/) */
export const CARRIERS: { value: Carrier; label: string; since: string }[] = [
  { value: 'KT', label: 'KT', since: '2023-09-08' },
  { value: 'SK', label: 'SK브로드밴드', since: '2023-09-27' },
  { value: 'LG', label: 'LG U+', since: '2023-11-01' },
]

const DAY = 86_400_000

const ymd = (iso: string) => iso.split('-').map(Number) as [number, number, number]

export function toTime(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return NaN
  const [y, m, d] = ymd(iso)
  return Date.UTC(y, m - 1, d)
}

export function todayISO() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export function formatDay(t: number) {
  const d = new Date(t)
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`
}

export const won = (n: number) => `${Math.floor(n).toLocaleString('ko-KR')}원`

export function graceDays(carrier: Carrier, years: number) {
  if (carrier === 'KT') return 180
  return years === 1 ? 90 : years === 2 ? 180 : 240
}

export function penalty(o: { carrier: Carrier; years: number; start: string; end: string; monthly: number; total?: number }) {
  const contractDays = 365 * o.years
  const usedDays = Math.round((toTime(o.end) - toTime(o.start)) / DAY)
  const usedMonths = Math.max(0, Math.round((usedDays * 12) / 365))
  const grace = graceDays(o.carrier, o.years)
  const remainingDays = contractDays - usedDays
  const rate = Math.min(1, Math.max(0, remainingDays / (contractDays - grace)))
  const discountTotal = o.total ?? o.monthly * usedMonths
  return {
    contractDays,
    usedDays,
    usedMonths,
    grace,
    remainingDays,
    rate,
    discountTotal,
    amount: Math.floor(discountTotal * rate),
    expired: remainingDays <= 0,
  }
}

/** 만료일 = 가입일을 첫날로 세어 N년째 되는 날의 전날. prepare = 만료 3개월 전 (원고: 만료 3개월 전에 변경 조건 확인) */
export function expiry(start: string, years: number, today: string) {
  const [y, m, d] = ymd(start)
  const end = Date.UTC(y + years, m - 1, d) - DAY
  const e = new Date(end)
  const prepare = Date.UTC(e.getUTCFullYear(), e.getUTCMonth() - 3, e.getUTCDate())
  return { end, prepare, daysLeft: Math.round((end - toTime(today)) / DAY) }
}
