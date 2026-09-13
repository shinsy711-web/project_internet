# 비교표 데이터 규칙 — 시트 사본

원본: 구글 시트 **table_data_schema** `12n6CmZSL07DjGyJx3rzJqomvt7vaVaaTDqq7dbN5_yo` (2026-09-13 사본). 시트가 원본이다.

- ①스키마정의 → [data/schema.ts](data/schema.ts) (12개 테이블 타입)
- ②비교표_매핑 → [lib/tables.ts](lib/tables.ts) `TABLES` (59개)
- ③plans_초안 · ④기타_초안 → [data/plans.ts](data/plans.ts) · [data/installFees.ts](data/installFees.ts) · [data/giftRules.ts](data/giftRules.ts) — **전부 미검증**
- 행이 아직 없는 8개 테이블 → [data/empty.ts](data/empty.ts)

## 운영규칙

| No | 규칙 | 강제성 | 이 프로젝트에서 |
|---|---|---|---|
| 1 | 표 숫자는 전부 마스터 테이블에서만. 페이지 HTML 에 요금 숫자를 직접 쓰지 않는다 | 필수 | ⚠️ **현재 미준수** — 원고(content_manuscripts)가 표를 숫자째 쓴다. 렌더하고 감사 WARN. `content/site-a/_data/plans.csv` 연동이 다음 단계 |
| 2 | 검증상태 '미검증' 값은 화면에 출력하지 않는다. 빈 칸 또는 '확인 중' | 필수 | 빌더가 '확인 중' 으로 출력. 전부 확인 중인 표는 감사 WARN |
| 3 | 모든 요금 테이블에 부가세포함 플래그 | 필수 | 금액 표 caption 에 (VAT 포함/별도/혼재) |
| 4 | 표 caption 에 갱신일과 출처 | 필수 | 공식확인 행의 최신 갱신일 + 출처 도메인. 없으면 '기준일·출처 공식 확인 전' |
| 5 | bundles · cards 는 월 1회 갱신 | 권장 | |
| 6 | plans 분기 1회, line_types · tv_platforms · speed_ref 는 갱신 거의 불필요 | 권장 | |
| 7 | 마스터에 행이 많아도 표는 5행×3열 부근으로 축약. 전체는 상세 페이지에서만 | 필수 | |
| 8 | 셀 값 3단어 / 한글 25자 이하. 설명은 표 아래 산문으로 | 필수 | 감사 FAIL(25자) / WARN(단어) |
| 9 | 같은 표를 두 페이지가 쓸 때 한쪽은 요약(3행) 한쪽은 전체 | 필수 | `summary: true` — No.4·6·12·13·16·32 |
| 10 | gift_rules 에 금액 컬럼을 만들지 않는다. 상대규모_순서만 | 필수 | 타입에 금액 필드 없음 + 사이트 B 본문 금액 감사 FAIL |
| 11 | 계산으로 만든 값은 계산식을 표 각주에 | 필수 | 계산 표(No.19 등) 빌더 미구현 — 만들 때 각주 필수 |
| 12 | penalty_rules 출처는 약관 원문(PDF) | 필수 | |
| 13 | smartchoice.or.kr 을 교차검증 소스로 상시 사용 | 권장 | |

## 값을 공식 확인했을 때

1. 해당 행의 값을 공식 페이지 기준으로 고친다 — 특히 **부가세포함** (100mb.kr 은 포함 표기, 공식은 별도 표기가 많다)
2. `출처url` 을 공식 URL 로, `갱신일` 을 확인한 날로
3. `검증상태: '공식확인'` — 이때부터 화면에 숫자가 나간다

공식 확인처: KT product.kt.com · shop.kt.com / SK bworld (★ 단독 요금 미수집, 우선순위 1) / LG uplus.co.kr / 케이블 lghellovision.net / 교차검증 smartchoice.or.kr

## 빌더 현황

59개 중 빌더가 있는 표 31개(요금표·속도 매트릭스·약정·설치비·소요일·속도/회선/TV 전송방식 참조표·사은품 종류·메인 3사 표).
나머지 28개(TV 결합 계산·OTT ○/×·결합할인 요율·제휴카드 실청구액·위약금 판단·장비 임대료 등)는 시트 크기대로 자리 표만 나온다.
빌더가 없는 표가 있는 페이지는 원고가 다 들어와도 원고 대기로 남는다.

시트와 다르게 한 것:
- device_fees · speed_ref · line_types · tv_platforms · gift_rules 에도 갱신일 · 출처url · 검증상태 필드를 뒀다(운영규칙 2·4 를 모든 표에 적용하려고).
- No.32 와 No.33(/price/)은 소스·크기가 같아 No.32 를 3행 요약으로 분리했다(운영규칙 9).
- No.12 는 시트 크기 3×3 이지만 속도 3행 × 3사 열이라 3×4 로 나온다.
