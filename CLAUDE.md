# project34_internet — 인터넷 가입 비교 (사이트 A + 위성 B)

시트 3개 + 사용자 원고로 만든 사이트. 디자인은 project32(국비노트) 뼈대.

| 소스 | 위치 | 이 프로젝트에서 |
|---|---|---|
| content_seo_rules (콘텐츠규칙 39 · 섹션템플릿 · 키워드대조) | 시트 `1a4sgGb0Lpf2H8Y0lcqZXN8aVt3ULdlXR4rMCq4xfAL8` | [SEO_RULES.md](SEO_RULES.md) · 감사 스크립트 |
| h2_top20 (H2설계 · 페이지요약 · 섹션유형 범례) | 시트 `1x31jzbaUG_Nj2tyJYjTuuGI4ZVHIZ_pPCNZvmB-cjlg` | [lib/pages.ts](lib/pages.ts) — 원고 없는 페이지의 설계 자리 |
| table_data_schema (스키마 · 비교표 매핑 · 운영규칙) | 시트 `12n6CmZSL07DjGyJx3rzJqomvt7vaVaaTDqq7dbN5_yo` | [DATA_RULES.md](DATA_RULES.md) · [data/](data/) · [lib/tables.ts](lib/tables.ts) |
| **원고 (전 71페이지 중 68편, A 61 + B 7)** | `C:\Users\PC\Desktop\content_manuscripts_71\content` | `npm run sync` → `content/site-a` · `content/site-b` |
| 잔여 14 H2 설계 (h2_rest14) | 시트 `1p3nLQ_kb6n095R3MyzggB_m6jDsi8KSXaMHb63xF1Ys` | 참고용 — IPTV 해금 4 + 누락 3(/guide/ · /device/lan/ · /switch/timing/) + 67위 이하 7. 보류 3: /kt/tv/ · /tv/iptv/compare/ · /lg/tv/ (KT·LG IPTV 요금 미확보) |
| TOP21~40 H2 설계 | 시트 `1NgBnkS6u7Dh6oLfJk4J3xDpKHPJcqmKCnpdQ_DQnxf8` | 참고용 (레지스트리 미반영 — 원고가 있으면 원고가 이긴다) |
| 41~66 H2 설계 (h2_41_66) | 시트 `1geTp2WWkzBp7rCxAG8B7r6ib5xhTy2E0CidymoI99I0` | 참고용 — 원고 20편과 1:1. 50 `/tv/iptv/compare/` · 55 `/lg/tv/` 보류 |

`site-a/area/_template.md` 는 지역 프로그래매틱 템플릿이라 `_` 규칙으로 페이지에서 빠진다. 지역 데이터가 생기면 생성기를 따로 만든다.

⚠️ **원고 폴더는 사용자 소유 원본이다.** 명시적으로 요청받지 않으면 파일을 추가·수정하지 않는다.
`content-drafts/` 는 Claude가 원고 폴더에 잘못 써 넣었다가 옮겨 둔 초안 6편과 조사 CSV — 사이트에 들어가지 않는다.

시트는 비공개라 CSV export 가 401 이다. Drive MCP `get_file_metadata` + `snippetVerbosity: MAX_ALLOWED` 로 전 탭 전체 행을 받는다.

## 우선순위

**원고 > 시트.** 원고가 있는 페이지는 TITLE · H1 · H2 · 섹션 순서 · 유형을 원고에서 가져온다(원고가 시트 뒤에 확정됐다).
시트 TOP20 설계(lib/pages.ts)는 원고가 없는 페이지를 회색 자리로 보여 줄 때만 쓴다.
SEO 규칙(콘텐츠규칙)은 원고에도 그대로 적용 — `npm run check` 가 잡는다.

## 원고 흐름

1. 원고는 **원본 폴더**(데스크톱 content_manuscripts_71)에서 고친다. 형식은 원고 폴더의 README.md.
2. `npm run sync` — `content/site-a` · `content/site-b` · `README.md` 를 복사해 온다. 배포용으로 복사본을 저장소에 둔다.
3. `npm run check` (B 는 `npm run check:b`).

원고는 프런트매터 `url:` 로 페이지와 짝지어진다(파일 이름 무관). 시트 TOP20 에 없는 url(예: /install/cost/)도 페이지가 된다.
원고 문법: `<!-- 유형 -->` + `## H2 {#앵커}` · 표 아래 `*이탤릭*` = caption · `> 인용` = 참고 박스 · `[라벨](/경로/)` 한 줄 = 버튼 · `---` 이후 무시.
한글 앵커 `#상담` 은 `#apply` 로 바꿔 렌더한다. 원고의 폼 주석대로 폼은 번호 + 수집 동의 + 제3자 제공 동의 + 만 14세.

## project33 과 헷갈리지 말 것

project33_internet 도 인터넷 비교지만 **다른 시트**로 만들어졌다. `lib/pages.ts` · `data/` · `content/` 를 섞지 말 것.

## 사이트 A / B

| | 개발 | 검사 | 산출물 | 원고 |
|---|---|---|---|---|
| A | `npm run dev` | `npm run check` | `out/` | `content/site-a` |
| B | `npm run dev:b` | `npm run check:b` | `out-b/` | `content/site-b` |

B 는 **금액(원) 표기 금지**(KAIT 가이드라인 위반 표시·광고). 감사가 B 본문 금액을 FAIL 로 잡는다.

## 구조

- `lib/siteKey.ts` — A/B 스위치. `lib/manuscripts.ts` — 원고 스캔(fs). `lib/site.ts` — 페이지 목록(시트 + 원고) · 내비 · 트리. **site.ts 는 fs 를 쓰는 서버 전용** — Header 처럼 클라이언트 컴포넌트는 props 로 받는다.
- `lib/content.ts` — 원고 파서 + `isReady`(리드 + 전 섹션 본문).
- `components/PageView.tsx` — 원고 모드 / 시트 자리 모드.
- `lib/links.ts` — **고립 페이지 0건 장치.** 원고 "함께 보면 좋은 글" 뒤에 자동 링크를 덧붙인다(허브↔하위, 관련 글 최소 3, 인바운드 최소 2, 홈에서 도달). 원고는 안 건드리고 빌드마다 다시 계산 — 원고가 늘어도 그대로 `npm run check`. 감사 `[9 고립]` 이 빌드 HTML 로 재확인(헤더·푸터·경로 표시 링크는 안 센다).
- `data/` + `lib/tables.ts` — 표 마스터 데이터와 59개 매핑. 지금은 **원고 없는 페이지의 자리 표에만** 쓰인다.
- `scripts/rules-audit.mjs` — 규칙 감사. `scripts/sync-content.mjs` — 원고 복사. `scripts/site.mjs` — B 빌드.

## 알고 있는 어긋남

- **운영규칙 1 미준수** — 원고가 표에 숫자를 직접 쓴다. 감사 WARN. `content/site-a/_data/plans.csv` 로 표를 생성하는 연동이 남은 일.
- 원고 대기(시트에만 있음): A `/kt/tv/` 하나 — KT 지니TV 요금 미확보(원고 README). `/tv/iptv/compare/` · `/lg/tv/` 는 시트 TOP20 레지스트리에 없어 페이지 자체가 없다.
- 원고 `_data/tv_plans.csv` · `tv_devices.csv`(SK 만 공식) 는 복사만 되고 아직 표 생성에 안 쓴다 — plans.csv 와 같은 처지.

## 절대 하지 않는 것

- 미검증 값 출력 · `gift_rules` 금액 필드 · 사이트 B 금액 표기
- `next/script` 로 JSON-LD · FAQPage/HowTo/WebSite/Product/ItemList 스키마
- sitemap `lastModified: new Date()` · 헤더 햄버거 조건부 렌더 · llms.txt
- 플레이스홀더 값 · `.container` 에 클래스 덧붙이기(감사가 문자열로 찾는다)
- 원고를 content/ 쪽에서 직접 고치기 — 다음 sync 에 덮인다

## 디자인

project32 토큰 그대로(stone + 밝은 초록, 85rem). `accent`(글자 #15803d)와 `cta`(버튼 면 #22c55e + 글자 #052e16)를 합치지 말 것.
본문은 마크다운이라 `globals.css` 가 선택자로 잡는다. 한글 이탤릭은 기울이지 않고 색으로만.

## 배포 전 미정

1. 사이트 A · B 브랜드명 · 푸터 고지문 (`lib/site.ts` CONFIG) · 도메인 — **A `NEXT_PUBLIC_SITE_URL`, B `NEXT_PUBLIC_SITE_URL_B` 로 따로.** B 빌드도 같은 .env.local 을 읽어서, 하나로 두면 B 의 canonical·sitemap·robots 가 A 도메인을 가리킨다. 둘 다 없으면 localhost 로 남아 감사가 막는다. OG 이미지(`OG_IMAGE`)도 비어 있어 og:image · Article.image 가 없다
2. 상담 폼 켜기 — 제출 로직은 완성(`components/LeadFormClient.tsx` → project21_db `/api/submit`, project31 과 같은 서버). 남은 것: `.env.local` 에 `NEXT_PUBLIC_DB_SUBMIT_URL` + `NEXT_PUBLIC_DB_API_KEY`(A) · `NEXT_PUBLIC_DB_API_KEY_B`(B) — project21 sites 테이블에 사이트를 등록해 받는다. `lib/site.ts` `LEAD.collector`(수집 주체) · `LEAD.recipient`(제3자 제공받는 자). 넷이 다 차야 `FORM_READY`. 처리방침 페이지 없음. **키 확인용으로 실제 키에 POST 금지**(빈 본문도 저장·디스코드 알림)
3. 원고 속 요금 재확인(원고 README: 2026-09-13 수집, 발행 전 재확인) · plans.csv 연동
4. 계산기 — /tools/penalty/ · /tools/expiry/ 는 완성(`lib/calc.ts` 식 + `PenaltyCalc` · `ExpiryCalc`, PageView `TOOL_WIDGETS` 가 원고 도구 섹션 아래에 붙인다). KT 180일 식은 KT 약관 주요설명서(2025-07)로 확인, SK·LG 90/180/240일은 원고 기준(LG 예시로 검산). /tools/coverage/ 는 주소 조회 API 가 없어 위젯 없음. /tools/bill/ 은 원고 없음. 속도측정 위젯도 "준비 중"
5. 원고 링크 대상 미발행: /tools/bill/ · /guide/scam/ · /guide/precon/ · /bundle/card/ · /bundle/mobile/ · /vs/kt-sk/ · /vs/kt-lg/ (+ TV 계열 원고 대기). B 원고 install-cash · switch-cash 가 A 경로(/install/cost/ · /switch/)를 상대 링크로 건다 — B 에 없는 경로라 일반 텍스트로 나간다(PageView `Inline`). A 로 보내려면 절대 URL 필요(도메인 확정 후)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
