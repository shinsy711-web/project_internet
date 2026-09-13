# 인터넷 가입 비교사이트 — 원고

URL 구조 그대로 폴더를 만들어 뒀다. 각 `.md`가 한 페이지다.
**전 71페이지 중 68페이지 작성 완료.** 남은 3개는 전부 KT·LG IPTV 요금 미확보로 막혀 있다.

```
content/
├── README.md
├── site-a/                     ← 본진 : 인터넷 가입 비교사이트
│   ├── _data/plans.csv         요금·설치비·위약금 원본
│   ├── _data/tv_plans.csv      IPTV 요금제 원본 (SK 완비 / KT·LG 미확보)
│   ├── _data/tv_devices.csv    셋톱박스·모뎀 임대료 원본
│   ├── speed/test.md              /speed/test/             1위 인터넷 속도측정
│   ├── index.md                   /                        2위 인터넷 가입 비교사이트
│   ├── kt/index.md                /kt/                     3위 KT 인터넷 가입
│   ├── speed/index.md             /speed/                  4위 인터넷 속도
│   ├── sk/index.md                /sk/                     5위 SK 인터넷 가입
│   ├── install/index.md           /install/                6위 인터넷 설치
│   ├── bundle/tv.md               /bundle/tv/              7위 인터넷 TV 결합
│   ├── switch/index.md            /switch/                 9위 인터넷 통신사 변경
│   ├── kt/price.md                /kt/price/               10위 KT 인터넷 요금제
│   ├── price/index.md             /price/                  11위 인터넷 요금 비교
│   ├── kt/install.md              /kt/install/             12위 KT 인터넷 설치
│   ├── tv/iptv.md                 /tv/iptv/                13위 IPTV 요금제
│   ├── sk/install.md              /sk/install/             16위 SK 인터넷 설치
│   ├── speed/compare.md           /speed/compare/          17위 인터넷 종류와 속도 차이
│   ├── bundle/index.md            /bundle/                 18위 인터넷 결합상품
│   ├── install/move.md            /install/move/           19위 인터넷 이전설치
│   ├── sk/price.md                /sk/price/               21위 SK 인터넷 요금제
│   ├── budget/index.md            /budget/                 23위 알뜰 인터넷
│   ├── speed/wifi.md              /speed/wifi/             24위 와이파이 속도
│   ├── device/modem.md            /device/modem/           25위 인터넷 모뎀
│   ├── trouble/disconnect.md      /trouble/disconnect/     26위 인터넷 연결 문제
│   ├── speed/kt.md                /speed/kt/               28위 KT 인터넷 속도
│   ├── guide/index.md             /guide/                  29위 인터넷 가입 가이드
│   ├── price/1g.md                /price/1g/               30위 1G 기가 인터넷 요금
│   ├── contract/index.md          /contract/               31위 인터넷 약정 기간
│   ├── device/lan.md              /device/lan/             32위 인터넷 케이블과 광랜
│   ├── install/cost.md            /install/cost/           33위 인터넷 설치비 비교
│   ├── switch/benefit.md          /switch/benefit/         34위 통신사 변경 혜택
│   ├── lg/price.md                /lg/price/               35위 LG U+ 인터넷 요금제
│   ├── sk/tv.md                   /sk/tv/                  36위 SK B tv 요금제
│   ├── lg/index.md                /lg/                     37위 LG U+ 인터넷 가입
│   ├── speed/slow.md              /speed/slow/             38위 인터넷 느릴 때
│   ├── cable/index.md             /cable/                  39위 케이블 인터넷
│   ├── switch/timing.md           /switch/timing/          40위 인터넷 재약정 vs 신규가입
│   ├── community/ppomppu.md       /community/ppomppu/      41위 뽐뿌 인터넷 가입 정리
│   ├── area/_template.md          /area/{시도-slug}/{시군구-slug}/ 42위 {시군구} 인터넷 가입 안내
│   ├── home/index.md              /home/                   43위 주거형태별 인터넷
│   ├── home/biz.md                /home/biz/               44위 기업 인터넷
│   ├── kt/renew.md                /kt/renew/               46위 KT 인터넷 재약정
│   ├── home/officetel.md          /home/officetel/         47위 오피스텔 인터넷 가입
│   ├── install/fast.md            /install/fast/           48위 인터넷 당일 설치와 주말 설치
│   ├── trouble/repair.md          /trouble/repair/         49위 인터넷 AS와 수리 비용
│   ├── price/500m.md              /price/500m/             51위 500M 인터넷 요금
│   ├── find/index.md              /find/                   52위 내게 맞는 인터넷 찾기
│   ├── price/100m.md              /price/100m/             53위 100M 인터넷 요금
│   ├── home/apt.md                /home/apt/               54위 아파트 인터넷 가입
│   ├── device/router.md           /device/router/          56위 인터넷 공유기
│   ├── speed/recommend.md         /speed/recommend/        57위 내게 맞는 인터넷 속도
│   ├── budget/free.md             /budget/free/            58위 무료 인터넷의 실제 조건
│   ├── tools/penalty.md           /tools/penalty/          59위 인터넷 위약금 계산기
│   ├── device/settop.md           /device/settop/          60위 IPTV 셋톱박스
│   ├── home/oneroom.md            /home/oneroom/           61위 원룸 인터넷 가입
│   ├── install/self.md            /install/self/           62위 인터넷 설치 방법
│   ├── tools/coverage.md          /tools/coverage/         63위 인터넷 설치 가능 조회
│   ├── tools/expiry.md            /tools/expiry/           65위 인터넷 약정 만료일 계산기
│   ├── vs/kt-lg-sk.md             /vs/kt-lg-sk/            66위 KT vs SK vs LG 인터넷 비교
│   ├── home/villa.md              /home/villa/             67위 빌라 인터넷 가입
│   ├── lg/install.md              /lg/install/             68위 LG U+ 인터넷 설치
│   ├── vs/kt-lg.md                /vs/kt-lg/               69위 KT vs LG U+ 인터넷 비교
│   ├── vs/kt-sk.md                /vs/kt-sk/               70위 KT vs SK브로드밴드 인터넷 비교
│   ├── home/newlywed.md           /home/newlywed/          71위 신혼집 인터넷 가입
└── site-b/                     ← 위성 : 현금·사은품 (별도 도메인)
    ├── index.md                   /                        8위 인터넷 가입 현금 지원
    ├── gift.md                    /gift/                   14위 인터넷 가입 사은품
    ├── tv-cash.md                 /tv-cash/                15위 인터넷 TV 가입 현금 지원
    ├── install-cash.md            /install-cash/           22위 인터넷 설치 현금 지원
    ├── switch-cash.md             /switch-cash/            27위 통신사 변경 현금 지원
    ├── cash/kt.md                 /cash/kt/                45위 KT 인터넷 가입 현금 지원
    ├── cash/sk.md                 /cash/sk/                64위 SK 인터넷 가입 현금 지원
```

**사이트 A와 B는 도메인이 다르다.** 콘텐츠가 겹치지 않게 설계했고, **B는 금액(원)을 텍스트로 쓰지 않는다.**

## 각 파일 구조

frontmatter → H1 → H2 섹션들. H2마다 `<!-- 섹션유형 -->` 주석이 붙어 있어서
퍼블리싱할 때 어떤 마크업으로 감쌀지 바로 알 수 있다.

| 주석 | 감쌀 마크업 |
|---|---|
| `hero` | `<section class="hero"><div class="container">` + `<h1>` + 리드 `<p>` |
| `definition` | `<h2>` + `<p>` 2~3문장 |
| `table` | `<h2>` + 요약 `<p>` + `<div class="table-wrap"><table>` + 해설 `<p>` |
| `detail` | `<h2>` + `<p>` (필요시 `<h3>`) |
| `list-ul` / `list-ol` | `<h2>` + 도입 `<p>` + `<ul>`/`<ol>` |
| `caution` | `<h2>` + `<ul>` |
| `trust` | `<h2>` + `<p>` + `<ul>` |
| `tool` | `<h2>` + `<p>` + 도구 링크 |
| `qa` | `<h2>` 질문형 + `<p>` |
| `faq` | `<h2>` + `<h3>` 질문형 반복 |
| `cta` | `<h2>` + `<p>` + `<form>` |
| `related` | `<h2>` + `<ul><li><a>` |

표 바로 아래 이탤릭으로 적은 문장이 `<caption>`에 들어갈 내용이다.

## 마크업 규칙 (원고에 이미 반영됨)

- 표는 반드시 진짜 `<table>`. **div 그리드 금지** — 구글 WebTables가 `<table>` 노드를 대상으로 데이터테이블을 판별한다
- `<caption>`에 출처와 기준일을 넣는다
- 셀은 3단어 / 한글 25자 이하, 표는 5행×3열 부근
- 모바일은 `overflow-x: auto`. **JS로 컬럼을 제거하지 말 것** (모바일 우선 색인에서 사라진다)
- **표를 이미지로 만들지 말 것** (네이버 명시 경고)
- 스키마는 **Article + BreadcrumbList + Organization만**. FAQPage는 2026-06 폐기, HowTo는 2023 폐기
- H1은 페이지당 1개
- `dl`/`dt`/`dd` 금지. 정의는 `<h2>` + `<p>`

## 데이터 출처 정책

| 대상 | 소스 |
|---|---|
| 3사 비교표 (`/`, `/price/`, `/speed/`) | **스마트초이스(KTOA)** — 3사를 같은 기준으로 비교할 수 있는 유일한 소스 |
| 통신사별 페이지 (`/kt/price/`, `/sk/price/`) | 각 사 공식 (shop.kt.com, bworld.co.kr) |
| LG 관련 전부 | **스마트초이스** — LG 공식 사이트가 SPA라 수치 미확보 |
| 위약금 · 최저보장속도 · 설치비 | 각 사 약관 · 공식 |
| IPTV 요금제 · 셋톱박스 | **SK만 공식(bworld.co.kr) 확보** — KT·LG 미확보 |

`_data/` 아래 CSV 3개가 표의 원본 데이터다. 요금이 바뀌면 **CSV만 고친다.**

- `plans.csv` — 인터넷 요금·설치비·위약금·최저보장속도·결합할인
- `tv_plans.csv` — IPTV 요금제 (SK 11개 요금제 × 약정 4단계 × 결합 3유형 + 채널수 + OTT)
- `tv_devices.csv` — 셋톱박스·모뎀 임대료

## 지역 페이지 템플릿

`site-a/area/_template.md`은 프로그래매틱 발행용이다. `{중괄호}` 안이 치환 변수다.

- 치환 변수 : `{시도}` `{시군구}` `{시도-slug}` `{시군구-slug}` `{주요동1~4}` `{인접시군구1~3}` 등
- **지역 고유 블록 3개**(주거 형태·주요 지역별 참고·설치 소요)에 지역마다 다른 값이 들어가야 발행 가능
- 요금표는 전국 동일하므로 전 지역 같은 값을 쓴다. 지역 페이지의 차별점은 **가능 여부와 일정**이다
- 고유 블록이 비면 얇은 콘텐츠가 되므로, 데이터가 없는 시군구는 발행하지 않는다

## 아직 안 쓴 페이지 — 3개

전부 같은 원인이다. **KT 지니TV와 LG U+tv 요금제**만 확보되면 3개가 동시에 풀린다.

| 순위 | URL | 볼륨 | 막힌 이유 |
|---|---|---|---|
| 20 | `/kt/tv/` | 2,740 | shop.kt.com이 SPA — HTTP 페치 404, 크롬 접근 불가 |
| 50 | `/tv/iptv/compare/` | 620 | 3사 비교표가 페이지 본체라 KT·LG 없이 성립 불가 |
| 55 | `/lg/tv/` | 440 | LG 공식 사이트 SPA |

수집 방법 두 가지. ① 크롬으로 shop.kt.com과 LG U+ TV 페이지를 열게 허용해 주면 바로 뽑는다.
② 두 페이지를 브라우저에서 열어 HTML이나 화면 텍스트를 넘겨주면 그걸로 표를 만든다.

### 순위 재계산에서 드러난 누락 (이번에 해결)

이전 README의 막힌 목록에 오류가 있었다. TOP100만으로 매긴 순위와 전체 358키워드로 매긴 순위가
달라서, 실제로는 **막힌 게 아니라 그냥 빠진 페이지 3개**가 있었다. 이번 배치에서 작성 완료.

| 순위 | URL | 볼륨 |
|---|---|---|
| 29 | `/guide/` | 1,860 |
| 32 | `/device/lan/` | 1,620 |
| 40 | `/switch/timing/` | 1,100 |

## 발행 전 확인 필요

- **LG 요금은 스마트초이스가 유일한 소스다.** 화면에 출처를 반드시 '스마트초이스'로 표기할 것.
  `/lg/`와 `/lg/price/` 상단에 출처 안내 문단을 이미 넣어 뒀다
- **KT 공식값과 스마트초이스값이 다르다.** 3년 약정 기준 슬림 18,150 대 22,000, 베이직 28,350 대 33,000,
  에센스 33,000 대 38,500. `/kt/price/`에 각주로 병기해 뒀다
- **LG 장비 임대료·LG AS 출동비는 미확인.** `/device/router/`, `/trouble/repair/` 해당 셀에 '확인 필요'로 표기해 뒀다
- **SK·LG 셋톱박스 임대료는 IPTV 상품 구성에 포함되는 구조**라 개별 확인 필요. `/device/settop/`에 그대로 적어 뒀다
- **스마트초이스 위약금 계산기는 2023년 개정 전 구 방식 테이블을 쓴다.** `/tools/penalty/`·`/tools/expiry/` 계산기는 반드시 3사 일수비례 계산식으로 구현할 것
- 원고의 모든 요금은 **2026-09-13 수집 기준**. 발행 전 재확인 필요
- 브랜드명이 확정되면 TITLE을 다시 계산할 것 (한글 22~25자 목표)

