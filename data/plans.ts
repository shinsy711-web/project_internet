import type { CarrierId, Plan, SpeedLabel } from './schema'

/**
 * 인터넷 요금제 — 시트 "③plans_초안". ★ 전부 미검증.
 * 2026-09-13 경쟁사 사이트(100mb.kr · gik9.kr)에서 수집한 값이라 화면에는 '확인 중' 으로 나간다(운영규칙 2).
 * 공식 페이지로 대조한 행만 검증상태를 '공식확인' 으로 바꾸고, 부가세포함 을 통신사 표기대로 고칠 것(운영규칙 3).
 *
 * 공식 확인처: KT product.kt.com · shop.kt.com / SK bworld(★ 단독 요금 미수집, 우선순위 1) / LG uplus.co.kr
 * 교차검증: smartchoice.or.kr (운영규칙 13)
 */

const MBPS: Record<SpeedLabel, number> = { '100M': 100, '500M': 500, '1G': 1000, '2.5G': 2500, '5G': 5000, '10G': 10000 }

function draft(carrier: CarrierId, label: SpeedLabel, 월요금_3년: number | null, 출처url: string): Plan {
  return {
    plan_id: `${carrier}-${label.toLowerCase()}`,
    carrier_id: carrier,
    speed_label: label,
    speed_mbps: MBPS[label],
    상품명: '',
    월요금_3년,
    // 수집처(100mb.kr)는 부가세 포함으로 표기. 공식 페이지는 별도 표기인 경우가 많다 — 대조 필수
    부가세포함: 월요금_3년 === null ? null : true,
    갱신일: '2026-09-13',
    출처url,
    검증상태: '미검증',
  }
}

const KT_SRC = 'https://100mb.kr/01_product/kt.php'
const LG_SRC = 'https://gik9.kr/kwa-lg_internet'

export const plans: Plan[] = [
  draft('kt', '100M', 22000, KT_SRC),
  draft('kt', '500M', 27500, KT_SRC),
  draft('kt', '1G', 33000, KT_SRC),
  draft('kt', '2.5G', 38500, KT_SRC),
  draft('kt', '5G', 55000, KT_SRC),
  draft('kt', '10G', 77000, KT_SRC),

  draft('lg', '100M', 22000, LG_SRC),
  draft('lg', '500M', 33000, LG_SRC),
  draft('lg', '1G', 38500, LG_SRC),

  // SK — 미수집. intermn 표의 500M 34,100 은 TV 결합가라 단독가가 아니다
  draft('sk', '100M', null, ''),
  draft('sk', '500M', null, ''),
  draft('sk', '1G', null, ''),
]
