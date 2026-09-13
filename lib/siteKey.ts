/** 이번 빌드 사이트 — A(본진) / B(현금·사은품 위성). scripts/site.mjs 가 NEXT_PUBLIC_SITE=B 로 돌린다 */
export type SiteKey = 'A' | 'B'
export const SITE_KEY: SiteKey = process.env.NEXT_PUBLIC_SITE === 'B' ? 'B' : 'A'
