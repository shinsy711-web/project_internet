import { CTA_LABEL, LEAD, LEAD_ENDPOINT } from '@/lib/site'
import LeadFormClient from './LeadFormClient'

/**
 * 상담 폼 — 서버 래퍼. lib/site.ts 는 node:fs 를 쓰므로 클라이언트 컴포넌트가 직접 import 할 수 없어 설정을 props 로 넘긴다.
 *
 * 폼이 켜지는 조건 (lib/site.ts)
 *   1. .env.local 에 NEXT_PUBLIC_DB_SUBMIT_URL + 사이트 키(A: NEXT_PUBLIC_DB_API_KEY · B: NEXT_PUBLIC_DB_API_KEY_B)
 *   2. LEAD.collector(수집 주체) · LEAD.recipient(제3자 제공받는 자 상호) — 원고 "비교사이트를 고를 때" 기준상 실명
 * 하나라도 비면 입력칸 비활성 + "준비 중". 사이트 B — 폼 주변에 금액을 쓰지 않는다.
 */
export default function LeadForm() {
  return <LeadFormClient endpoint={LEAD_ENDPOINT} label={CTA_LABEL} collector={LEAD.collector} recipient={LEAD.recipient} category={LEAD.category} />
}
