import type { Carrier, CarrierId } from './schema'

/** 통신사 마스터 — 시트 스키마 설명에 예시로 적힌 값만. 정식명·대표번호가 빈 곳은 확인 전 */
export const carriers: Carrier[] = [
  { carrier_id: 'kt', 표시명: 'KT', 정식명: '주식회사 케이티', tv_브랜드: '지니TV', 별칭: ['올레'] },
  { carrier_id: 'sk', 표시명: 'SK', 정식명: '에스케이브로드밴드', 인터넷_브랜드: 'B인터넷', tv_브랜드: 'B tv', 별칭: ['SKT', 'SK브로드밴드'] },
  { carrier_id: 'lg', 표시명: 'LG U+', 정식명: '', 인터넷_브랜드: 'U+인터넷', tv_브랜드: 'U+tv', 별칭: ['엘지유플러스'] },
  { carrier_id: 'hello', 표시명: 'LG헬로비전', 정식명: '', tv_브랜드: '', 별칭: [] },
  { carrier_id: 'dlive', 표시명: '딜라이브', 정식명: '', tv_브랜드: '', 별칭: [] },
]

export const carrierLabel = (id: CarrierId) => carriers.find((c) => c.carrier_id === id)?.표시명 ?? id
