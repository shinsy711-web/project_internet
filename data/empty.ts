import type { Bundle, Card, DeviceFee, LineType, PenaltyRule, SpeedRef, TvPlan, TvPlatform } from './schema'

/**
 * 아직 행이 없는 마스터 테이블 8개. 데이터를 받으면 테이블별 파일(data/<이름>.ts)로 옮기고 여기서 지운다.
 *
 * 갱신 주기 (운영규칙 5·6)
 *   bundles · cards        → 월 1회 (결합 정책·제휴카드는 변경이 가장 잦다. SK 온가족할인처럼 없어지기도 함)
 *   tv_plans · device_fees → 분기 1회 (plans 와 같이)
 *   penalty_rules          → 약관 개정 시. 출처는 약관 원문 PDF (운영규칙 12)
 *   speed_ref · line_types · tv_platforms → 정적 참조표, 갱신 거의 불필요
 */

export const tvPlans: TvPlan[] = []
export const bundles: Bundle[] = []
export const deviceFees: DeviceFee[] = []

/**
 * 제휴카드 — 시트에는 구조 예시만 있다(telenation.co.kr 정보마당):
 *   기본할인 7,000원 상시 / 추가할인 13,000원 신규 발급자 한정 / 추가할인_적용월수 24개월 /
 *   전월실적 30만·70만원 / 실적제외항목 세금·공과금·상품권.  실제 상품은 3사 × 14종 규모로 별도 수집 필요.
 */
export const cards: Card[] = []

export const penaltyRules: PenaltyRule[] = []
export const speedRef: SpeedRef[] = []
export const lineTypes: LineType[] = []
export const tvPlatforms: TvPlatform[] = []
