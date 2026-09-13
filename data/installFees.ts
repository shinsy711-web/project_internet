import type { InstallFee } from './schema'

/**
 * 설치비 · 소요일 — 시트 "④기타_초안". ★ 전부 미검증 (출처 100mb.kr).
 * SK·LG 설치비 미수집. 유형=이전설치 는 3사 전부 미수집 — /install/move/ 비교표(No.52·53)가 이것 없이는 못 만들어진다.
 */
const draft = (시간대: InstallFee['시간대'], 구성: InstallFee['구성'], 설치비: number): InstallFee => ({
  carrier_id: 'kt',
  유형: '신규',
  시간대,
  구성,
  설치비,
  부가세포함: true,
  갱신일: '2026-09-13',
  출처url: 'https://100mb.kr',
  검증상태: '미검증',
})

export const installFees: InstallFee[] = [
  draft('평일', '인터넷단독', 36000),
  draft('평일', '인터넷+TV', 56200),
  draft('주말·야간', '인터넷단독', 45000),
  draft('주말·야간', '인터넷+TV', 71250),
]
