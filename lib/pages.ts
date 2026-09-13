/**
 * 페이지 레지스트리 — 시트 h2_top20 (1x31jzbaUG_Nj2tyJYjTuuGI4ZVHIZ_pPCNZvmB-cjlg)
 *   "H2설계_TOP20" : URL · TITLE · H1 · H2 문구 · 섹션 유형 · 소화 키워드 · 메모
 *   "페이지요약"   : 발행 순서 · 페이지 합계 볼륨 · 담당 키워드
 *
 * TITLE · H1 · H2 는 시트 문구 그대로다. 원고(content/)에는 본문만 쓴다 — 두 곳에 적으면 어긋난다.
 * 사이트 A(본진)와 B(현금·사은품 위성)는 도메인이 다르다. 한 번에 한 사이트만 빌드된다(lib/site.ts SITE_KEY).
 * 메모의 `→ /경로/` 는 내부링크 대상이다. 아직 없는 경로는 원고 대기 화면 설계 패널에 "미발행 링크 대상"으로 나온다.
 * 비교표 섹션의 표 데이터는 원고가 아니라 lib/tables.ts(시트 table_data_schema 매핑) → data/ 에서 온다.
 */

export type SectionType =
  | '정의'
  | '정의+상세'
  | '비교표'
  | '상세'
  | '상세 h3'
  | '목록 UL'
  | '목록 OL'
  | '주의사항'
  | '신뢰'
  | '도구'
  | 'Q&A'
  | 'FAQ'
  | '전환'
  | 'CTA'
  | '관련문서'

export type SectionDef = {
  /** 시트 H2 문구 — 원고의 `## ` 제목과 이 글자로 짝을 맞춘다(공백·물음표 무시) */
  h2: string
  type: SectionType
  /** 이 섹션에서 소화할 키워드 */
  kw?: string
  memo?: string
}

export type PageDef = {
  /** 발행 순서 */
  order: number
  site: 'A' | 'B'
  path: string
  title: string
  /** h1 — 헤더·푸터·브레드크럼·관련 문서 링크 글자로도 쓴다(앵커 = 대상 주키워드) */
  h1: string
  /** 페이지 합계 볼륨 */
  volume: number
  /** 담당 키워드 (TOP100 내) */
  keywords: string[]
  hero: { kw: string; memo?: string }
  /** h1 바로 아래 측정 버튼 (/speed/test/) — 위젯 미구현, 비활성 버튼만 */
  heroTool?: boolean
  sections: SectionDef[]
}

const s = (h2: string, type: SectionType, kw?: string, memo?: string): SectionDef => ({
  h2,
  type,
  ...(kw ? { kw } : {}),
  ...(memo ? { memo } : {}),
})

const FAQ = s('자주 묻는 질문', 'FAQ')
const CTA = s('무료 상담 신청', 'CTA')
const CTA_B = s('상담 신청', 'CTA')
const REL = s('함께 보면 좋은 글', '관련문서')

export const PAGES: PageDef[] = [
  {
    order: 1, site: 'A', path: '/speed/test/', volume: 431930, heroTool: true,
    title: '인터넷 속도측정 | 내 속도 확인하고 요금제 진단', h1: '인터넷 속도측정',
    keywords: ['인터넷 속도측정', '인터넷속도체크'],
    hero: { kw: '인터넷 속도측정', memo: 'h1 바로 아래 측정 버튼. 리드 문단 150~200자에 주키워드' },
    sections: [
      s('인터넷 속도측정이란?', '정의', undefined, '다운로드·업로드·핑·지터 뜻을 2~3문장으로. 첫 문장이 곧 정의'),
      s('측정 결과 이렇게 읽으세요', '비교표', undefined, '속도 구간별 정상 범위표. 5행×3열, 셀 25자 이하'),
      s('내 요금제에서 이 속도가 정상인가요?', '비교표', undefined, '100M/500M/1G 계약 대비 실측 하한 표. 통신사 품질보장 기준 인용'),
      s('속도가 안 나오는 5가지 원인', '목록 UL', undefined, '→ /speed/slow/ 로 내부링크. 8항목·350자 이내'),
      s('유선과 와이파이 속도가 다른 이유', '상세', undefined, '→ /speed/wifi/'),
      s('정확하게 측정하는 방법', '목록 OL', '인터넷속도체크', '측정 전 체크리스트. 순서가 있으니 ol'),
      s('통신사 공식 측정과 결과가 다를 때', '주의사항', undefined, '최저보장속도·품질보장제(SLA) 언급. 신뢰 신호'),
      s('속도가 부족하면 어떻게 해야 하나요', '전환', undefined, '→ /price/ · /switch/ 로 넘기는 동선. ★ 이 페이지의 유일한 수익 지점'),
      s('자주 묻는 질문', 'FAQ', undefined, 'h3 질문형 5개. FAQPage 스키마는 달지 않음'),
      s('무료 상담 신청', 'CTA', undefined, '1단계 폼(번호+동의)'),
      s('함께 보면 좋은 글', '관련문서', undefined, '앵커 텍스트에 대상 페이지 주키워드 그대로'),
    ],
  },
  {
    order: 2, site: 'A', path: '/', volume: 82080,
    title: '인터넷 가입 비교 | KT·SK·LG 요금·설치 한눈에', h1: '인터넷 가입 비교',
    keywords: ['인터넷가입', '인터넷비교사이트', '인터넷신청', '초고속인터넷', '인터넷신규가입', '인터넷가입비교', '인터넷가입비교사이트', '인터넷비교'],
    hero: { kw: '인터넷가입 / 인터넷비교사이트', memo: "리드 문단에 '인터넷 가입 비교'와 '비교사이트'를 자연스럽게 한 번씩" },
    sections: [
      s('인터넷 가입 비교란?', '정의', '인터넷비교', '비교사이트가 실제로 뭘 비교해주는지. 경쟁사 중 이 섹션 둔 곳 0개'),
      s('KT·SK·LG 3사 한눈에 비교', '비교표', '인터넷가입비교 / 인터넷가입비교사이트', '★ 메인 표. 월요금·설치비·최대속도·약정·결합 5행×3열'),
      s('속도별 요금 비교', '비교표', '초고속인터넷', '100M/500M/1G × 3사. → /price/'),
      s('통신사별 특징과 추천 대상', '상세 h3', undefined, 'h3로 KT/SK/LG 각각. 장단점 균형(네이버 권장)'),
      s('인터넷만 가입 vs TV 결합', '비교표', undefined, '→ /bundle/tv/'),
      s('가입 절차 5단계', '목록 OL', '인터넷신청 / 인터넷신규가입', '신청→상담→설치예약→개통→사은품'),
      s('가입 전 반드시 확인할 것', '목록 UL', undefined, '사전승낙서·설치 가능 여부·약정 기간·실청구액'),
      s('비교사이트 고를 때 주의사항', '신뢰', undefined, '→ /guide/scam/ · /guide/precon/. ★ 차별화 축'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 3, site: 'A', path: '/kt/', volume: 76530,
    title: 'KT 인터넷 가입 | 요금제·설치·결합 비교', h1: 'KT 인터넷 가입',
    keywords: ['KT인터넷', 'KT인터넷가입', 'KT인터넷전화기', 'KT인터넷신규가입'],
    hero: { kw: 'KT인터넷 / KT인터넷가입' },
    sections: [
      s('KT 인터넷이란?', '정의', undefined, '올레·지니TV 브랜드 명칭 정리. KT 표기 혼동 해소'),
      s('KT 인터넷 요금제 전체', '비교표', undefined, '속도별 월요금. → /kt/price/'),
      s('KT 인터넷 속도별 선택 기준', '상세', undefined, '→ /speed/recommend/'),
      s('KT 인터넷 + 지니TV 결합', '비교표', undefined, '→ /kt/tv/'),
      s('KT 설치비와 소요일', '비교표', undefined, '→ /kt/install/'),
      s('KT 집전화 결합', '상세', 'KT인터넷전화기', '620. 3사 중 집전화 수요가 KT에 몰림'),
      s('KT 신규가입 절차', '목록 OL', 'KT인터넷신규가입', '420'),
      s('KT 재약정 vs 타사 전환', '비교표', undefined, '→ /kt/renew/ · /tools/penalty/'),
      s('KT를 추천하는 경우 / 안 맞는 경우', '목록 UL', undefined, '★ 단점도 쓸 것. 네이버 자가진단 항목'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 4, site: 'A', path: '/speed/', volume: 31320,
    title: '인터넷 속도 | 100M·500M·1G 어떤 걸 골라야 하나', h1: '인터넷 속도',
    keywords: ['인터넷속도', '인터넷 속도 느릴때'],
    hero: { kw: '인터넷속도' },
    sections: [
      s('인터넷 속도란?', '정의', undefined, 'Mbps 개념과 다운로드/업로드 구분'),
      s('100M·500M·1G 실제 차이', '비교표', undefined, '→ /speed/compare/'),
      s('내게 맞는 속도 고르는 기준', '비교표', undefined, '가구원수 × 용도 매트릭스. → /speed/recommend/'),
      s('계약 속도와 실제 속도가 다른 이유', '상세', undefined, "'최대'의 의미. 최저보장속도 개념"),
      s('속도가 느릴 때 점검 순서', '목록 OL', '인터넷 속도 느릴때', '430. → /speed/slow/'),
      s('와이파이 속도와 유선 속도', '상세', undefined, '→ /speed/wifi/'),
      s('통신사별 속도 체감 차이', '비교표', undefined, '근거 없는 단정 금지. 공개 측정 자료만 인용'),
      s('지금 내 속도 측정하기', '도구', undefined, '→ /speed/test/'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 5, site: 'A', path: '/sk/', volume: 28210,
    title: 'SK 인터넷 가입 | 브로드밴드 요금·설치 비교', h1: 'SK 인터넷 가입',
    keywords: ['SK인터넷', 'SK브로드밴드 인터넷', 'SK인터넷가입', 'SKT인터넷가입'],
    hero: { kw: 'SK인터넷 / SK인터넷가입' },
    sections: [
      s('SK브로드밴드·SKT·B tv 명칭 정리', '정의', 'SK브로드밴드 인터넷 / SKT인터넷가입', "★ 이 페이지 핵심. 'SK브로드밴드 인터넷' 8,200 + SKT 표기 변형이 전부 여기로 모임"),
      s('SK 인터넷 요금제 전체', '비교표', undefined, '→ /sk/price/'),
      s('SK 인터넷 + B tv 결합', '비교표', undefined, '→ /sk/tv/'),
      s('SK 설치비와 소요일', '비교표', undefined, '→ /sk/install/'),
      s('SKT 휴대폰 결합할인', '비교표', undefined, '온가족할인 등. 정책 변경 잦으니 최종 수정일 표기'),
      s('SK 신규가입 절차', '목록 OL'),
      s('SK를 추천하는 경우 / 안 맞는 경우', '목록 UL'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 6, site: 'A', path: '/install/', volume: 13620,
    title: '인터넷 설치 | 설치비·소요일·당일설치 정리', h1: '인터넷 설치',
    keywords: ['인터넷설치', '인터넷와이파이설치', '인터넷티비설치', '인터넷개통'],
    hero: { kw: '인터넷설치' },
    sections: [
      s('인터넷 설치란?', '정의', undefined, '신청→상담→예약→개통 흐름을 2~3문장으로'),
      s('3사 설치비 비교', '비교표', undefined, '평일/주말·야간, 인터넷 단독/TV 동시. → /install/cost/'),
      s('설치 소요일과 예약 방법', '비교표'),
      s('설치 당일 이렇게 진행됩니다', '목록 OL', '인터넷개통', '490'),
      s('인터넷 + TV 동시 설치', '상세', '인터넷티비설치', '550. → /bundle/tv/'),
      s('와이파이(공유기) 설치', '상세', '인터넷와이파이설치', '600. → /device/router/'),
      s('설치 전 준비물과 확인사항', '목록 UL'),
      s('설치가 불가능한 경우', '주의사항', undefined, '→ /tools/coverage/ · /home/officetel/ (공용 인터넷)'),
      s('이사할 때는 이전설치', '상세', undefined, '→ /install/move/'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 7, site: 'A', path: '/bundle/tv/', volume: 12410,
    title: '인터넷 TV 결합 | 3사 요금·채널 비교', h1: '인터넷 TV 결합',
    keywords: ['인터넷티비', '인터넷TV', '티비인터넷', '인터넷TV요금', 'TV인터넷', '인터넷tv가입', '인터넷TV신청', 'TV인터넷가입', '인터넷티비가입'],
    hero: { kw: '인터넷티비 / 인터넷TV', memo: '표기 변형 9개가 이 페이지로 모임 — 본문에 자연 분산' },
    sections: [
      s('인터넷 TV 결합이란?', '정의', '티비인터넷 / TV인터넷'),
      s('3사 인터넷+TV 요금 비교', '비교표', '인터넷TV요금', '★ 900. 메인 표'),
      s('채널 수와 OTT 포함 여부 비교', '비교표', undefined, '넷플릭스·디즈니+ 포함 요금제. intermn이 H2로 따로 뺀 항목'),
      s('인터넷만 vs 인터넷+TV, 얼마 차이나나', '비교표', undefined, '단독 가입과의 실비용 차이'),
      s('셋톱박스 선택', '상세', undefined, '→ /device/settop/'),
      s('TV 결합 가입 절차', '목록 OL', '인터넷tv가입 / 인터넷TV신청 / TV인터넷가입 / 인터넷티비가입', '가입·신청 표기 4종을 절차 설명 안에서 소화'),
      s('결합 시 주의사항', '목록 UL', undefined, '약정 분리 여부, 해지 시 위약금 산정, TV만 해지 가능한지'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 8, site: 'B', path: '/', volume: 9050,
    title: '인터넷 가입 현금 지원 | 조건과 지급 절차', h1: '인터넷 가입 현금 지원',
    keywords: ['인터넷가입현금지원', '현금이벤트', '인터넷지원금', '인터넷현금지원', '인터넷현금', '현금지급이벤트'],
    hero: { kw: '인터넷가입현금지원 / 인터넷현금지원', memo: "★ 금액(원)을 텍스트로 쓰지 말 것. '조건 확인' 소구로" },
    sections: [
      s('인터넷 가입 현금 지원이란?', '정의', '인터넷현금', '어떤 성격의 돈이고 누가 지급하는지'),
      s('지원금이 결정되는 4가지 조건', '목록 UL', '인터넷지원금', '통신사·상품 구성·결합 여부·약정 기간'),
      s('지급 절차와 시점', '목록 OL', undefined, '★ 이 페이지의 실무 핵심. 개통 후 며칠, 어떤 방식'),
      s('상품권과 현금의 차이', '비교표', undefined, '→ /gift/'),
      s('지원금 받은 뒤 주의할 것', '주의사항', undefined, '1년 내 해지 시 반환, 요금 2회 미납 시 반환'),
      s('과도한 금액을 내세우는 곳 걸러내는 법', '신뢰', undefined, '★ 규제 방어 겸 차별화. KAIT 신고·사전승낙서 확인'),
      s('진행 중인 혜택 확인', '전환', '현금이벤트 / 현금지급이벤트', '→ /event/. 주기 갱신'),
      FAQ, CTA_B, REL,
    ],
  },
  {
    order: 9, site: 'A', path: '/switch/', volume: 8910,
    title: '인터넷 통신사 변경 | 갈아타기 손익 계산', h1: '인터넷 통신사 변경',
    keywords: ['통신사변경', '인터넷변경', '통신사이동', '인터넷교체', '인터넷해지', '인터넷통신사변경'],
    hero: { kw: '통신사변경 / 인터넷통신사변경' },
    sections: [
      s('통신사 변경이란?', '정의', '인터넷변경 / 통신사이동', '해지 후 신규 가입 구조임을 명확히'),
      s('변경 절차 6단계', '목록 OL', '인터넷교체', '신규 신청 → 설치 → 개통 확인 → 기존 해지 순서'),
      s('지금 갈아타도 되는지 판단', '비교표', undefined, '약정 잔여기간별 손익. 만료/3개월내/1년이상'),
      s('위약금 계산하기', '도구', undefined, '→ /tools/penalty/'),
      s('재약정 vs 갈아타기, 어느 쪽이 이득', '비교표', undefined, '→ /switch/timing/'),
      s('통신사별 전환 혜택 비교', '비교표', undefined, '→ /switch/benefit/'),
      s('해지를 먼저 하면 안 되는 이유', '주의사항', '인터넷해지', '★ 580. 공백 발생·위약금 이중 부담. 실무상 가장 중요한 경고'),
      s('인터넷만 바꿀 때 / TV까지 바꿀 때', '상세'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 10, site: 'A', path: '/kt/price/', volume: 8380,
    title: 'KT 인터넷 요금제 | 속도별 월요금 총정리', h1: 'KT 인터넷 요금제',
    keywords: ['KT인터넷요금제', 'KT인터넷요금'],
    hero: { kw: 'KT인터넷요금제' },
    sections: [
      s('KT 인터넷 요금제 전체', '비교표', 'KT인터넷요금', '★ 핵심 표. 속도별 월요금·부가세 포함 여부 명시'),
      s('약정 기간별 요금 차이', '비교표', undefined, '3년/2년/1년. → /contract/'),
      s('속도별 추천 대상', '상세 h3', undefined, 'h3로 100M/500M/1G 각각'),
      s('TV 결합 시 요금', '비교표', undefined, '→ /kt/tv/'),
      s('휴대폰 결합할인 요율', '비교표', undefined, '→ /bundle/mobile/'),
      s('제휴카드 적용 시 실제 청구액', '비교표', undefined, '★ 차별화. 전월실적 조건까지 표기. → /bundle/card/'),
      s('설치비와 부가비용', '비교표', undefined, '장비 임대료 포함'),
      s('요금에 포함되지 않는 것', '주의사항', undefined, '광고가와 실청구액 차이'),
      s('실청구액 계산기', '도구', undefined, '→ /tools/bill/'),
      FAQ, CTA,
    ],
  },
  {
    order: 11, site: 'A', path: '/price/', volume: 6500,
    title: '인터넷 요금 비교 | 3사 속도별 월요금 총정리', h1: '인터넷 요금 비교',
    keywords: ['인터넷요금비교', '인터넷요금', '인터넷요금제', '인터넷비용', '인터넷가격비교'],
    hero: { kw: '인터넷요금비교 / 인터넷요금', memo: '구글 상업성 점수 1위 키워드축(53.8)' },
    sections: [
      s('3사 인터넷 요금 한눈에', '비교표', '인터넷요금제', '★ 메인 표'),
      s('속도별 요금 비교', '비교표', undefined, '100M/500M/1G/2.5G/10G × 3사'),
      s('요금 외에 드는 비용', '비교표', '인터넷비용', '설치비·장비임대료·부가세'),
      s('약정 기간별 요금 차이', '비교표', undefined, '→ /contract/'),
      s('결합하면 얼마나 싸지나', '비교표', undefined, 'TV·휴대폰 결합 요율'),
      s('제휴카드 할인의 실제', '상세', undefined, "★ '월 0원' 광고의 구조를 해설. 전월실적·24개월 조건"),
      s('가장 싼 조합 찾기', '상세', '인터넷가격비교', '→ /budget/'),
      s('광고 요금과 실제 청구액이 다른 이유', '주의사항', undefined, '★ 차별화 핵심 섹션'),
      s('실청구액 계산기', '도구', undefined, '→ /tools/bill/'),
      FAQ, CTA,
    ],
  },
  {
    order: 12, site: 'A', path: '/kt/install/', volume: 6300,
    title: 'KT 인터넷 설치 | 설치비·소요일·당일설치', h1: 'KT 인터넷 설치',
    keywords: ['KT인터넷설치'],
    hero: { kw: 'KT인터넷설치' },
    sections: [
      s('KT 설치비', '비교표', undefined, '평일/주말·야간, 인터넷 단독/TV 동시'),
      s('설치 소요일과 예약', '비교표'),
      s('설치 당일 진행 순서', '목록 OL'),
      s('KT 설치 가능 지역 확인', '도구', undefined, '→ /tools/coverage/. help.kt.com 가능지역 조회가 상위 노출 중'),
      s('이전설치(이사)', '상세', undefined, '→ /install/move/'),
      s('설치 전 준비물', '목록 UL'),
      s('설치가 지연·불가한 경우', '주의사항'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 13, site: 'A', path: '/tv/iptv/', volume: 5970,
    title: 'IPTV란? | 3사 IPTV 요금·채널 비교', h1: 'IPTV',
    keywords: ['IPTV', 'IPTV비교'],
    hero: { kw: 'IPTV' },
    sections: [
      s('IPTV란?', '정의', undefined, "★ 이 페이지는 정의가 본체. 5,470이 '그게 뭔지' 찾는 검색"),
      s('IPTV vs 케이블TV vs 위성방송', '비교표', undefined, '전송 방식·채널·양방향 기능 차이'),
      s('3사 IPTV 비교', '비교표', 'IPTV비교', '500. 지니TV / B tv / U+tv'),
      s('채널 수와 편성', '비교표'),
      s('OTT 포함 요금제', '비교표', undefined, '넷플릭스·디즈니+·티빙 포함 상품'),
      s('셋톱박스 종류', '상세', undefined, '→ /device/settop/'),
      s('IPTV만 단독으로 가입할 수 있나요', 'Q&A', undefined, '대부분 인터넷 결합 필수 — 실제 검색 의도에 직접 답'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 14, site: 'B', path: '/gift/', volume: 5140,
    title: '인터넷 가입 사은품 | 종류·조건·지급 시점', h1: '인터넷 가입 사은품',
    keywords: ['인터넷가입사은품많이주는곳', '인터넷가입사은품', '인터넷사은품'],
    hero: { kw: '인터넷가입사은품많이주는곳 / 인터넷가입사은품', memo: '★ 금액 표기 금지' },
    sections: [
      s('인터넷 가입 사은품이란?', '정의', '인터넷사은품', '현금·상품권·기기 세 종류'),
      s('사은품 종류 비교', '비교표', undefined, '현금 / 상품권 / 공유기·기기. 수령 시점과 방식이 다름'),
      s('사은품이 결정되는 조건', '목록 UL', undefined, '통신사·상품 구성·결합·약정'),
      s('지급 시점과 방법', '목록 OL', undefined, '개통 후 며칠, 계좌 입금 vs 발송'),
      s('상품권 사용처', '상세', undefined, '이마트·다이소·농협·SSG 등 실제 종류'),
      s('반환 조건', '주의사항', undefined, '★ 1년 내 해지·요금 2회 미납 시 반환. 분쟁 최다 항목'),
      s("'많이 준다'는 곳 판별법", '신뢰', undefined, '사전승낙서 확인 + 지급 약정 서면화'),
      FAQ, CTA_B, REL,
    ],
  },
  {
    order: 15, site: 'B', path: '/tv-cash/', volume: 4780,
    title: '인터넷 TV 현금 지원 | 결합 가입 혜택 정리', h1: '인터넷 TV 현금 지원',
    keywords: ['인터넷티비현금많이주는곳', '인터넷TV현금'],
    hero: { kw: '인터넷티비현금많이주는곳 / 인터넷TV현금', memo: '★ 금액 표기 금지' },
    sections: [
      s('TV를 결합하면 지원이 커지는 이유', '정의+상세', undefined, '판매 수수료 구조를 원리로 설명. 금액 아님'),
      s('결합 조합별 지원 규모', '비교표', undefined, "★ 금액이 아니라 '상대적 크기 순서'로 표기 — 규제 회피"),
      s('지급 절차와 시점', '목록 OL'),
      s('기존 인터넷에 TV만 추가할 때', '상세', undefined, '→ /bundle/tv/'),
      s('반환·약정 주의사항', '주의사항'),
      s('과장 금액 판별법', '신뢰'),
      FAQ, CTA_B, REL,
    ],
  },
  {
    order: 16, site: 'A', path: '/sk/install/', volume: 3830,
    title: 'SK 인터넷 설치 | 설치비·소요일·당일설치', h1: 'SK 인터넷 설치',
    keywords: ['SK인터넷설치', 'SKT인터넷설치'],
    hero: { kw: 'SK인터넷설치' },
    sections: [
      s('SK브로드밴드와 SKT, 어디로 신청하나', '정의', 'SKT인터넷설치', '★ 1,860. 표기 혼동이 이 페이지의 차별 포인트'),
      s('SK 설치비', '비교표'),
      s('설치 소요일과 예약', '비교표'),
      s('설치 당일 진행 순서', '목록 OL'),
      s('SK 설치 가능 지역 확인', '도구', undefined, '→ /tools/coverage/'),
      s('설치 전 준비물', '목록 UL'),
      s('설치가 지연·불가한 경우', '주의사항'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 17, site: 'A', path: '/speed/compare/', volume: 3030,
    title: '인터넷 종류와 속도 차이 | 100M·500M·1G 비교', h1: '인터넷 종류와 속도 차이',
    keywords: ['인터넷종류', '인터넷100메가속도'],
    hero: { kw: '인터넷종류', memo: '1,860' },
    sections: [
      s('인터넷 종류란?', '정의', undefined, '★ 광랜·FTTH·케이블·기가 구분. 이 페이지의 본체'),
      s('회선 종류별 비교', '비교표', undefined, '광랜 vs 케이블 vs FTTH. 속도·안정성·대칭성'),
      s('100M·500M·1G·2.5G·10G 비교', '비교표', undefined, '★ 핵심 표'),
      s('100메가는 실제로 얼마나 나오나', '상세', '인터넷100메가속도', '1,170. 최저보장속도 기준 제시'),
      s('가구원수·용도별 권장 속도', '비교표', undefined, '→ /speed/recommend/'),
      s('속도를 올리면 체감이 달라지나요', 'Q&A', undefined, '솔직하게 — 용도에 따라 체감 없음을 인정. 신뢰 신호'),
      s('대칭형과 비대칭형 차이', '상세', undefined, '업로드 속도가 중요한 경우'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 18, site: 'A', path: '/kt/tv/', volume: 2740,
    title: 'KT 인터넷 TV | 지니TV 요금·채널 비교', h1: 'KT 인터넷 TV',
    keywords: ['KT인터넷TV', 'KTTV인터넷'],
    hero: { kw: 'KT인터넷TV / KTTV인터넷' },
    sections: [
      s('지니TV란?', '정의', undefined, '올레TV → 지니TV 명칭 변경 정리'),
      s('KT 인터넷+TV 요금', '비교표', undefined, '★ 메인 표'),
      s('채널 수와 OTT 구성', '비교표'),
      s('지니TV 셋톱박스 종류', '상세', undefined, '→ /device/settop/'),
      s('결합 가입 절차', '목록 OL'),
      s('결합 주의사항', '주의사항', undefined, '약정 분리·TV만 해지 가능 여부'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 19, site: 'A', path: '/install/move/', volume: 2350,
    title: '이사 인터넷 이전설치 | 신청 시점과 비용', h1: '인터넷 이전설치',
    keywords: ['KT이전설치', '이사 인터넷 이전설치', '인터넷이전설치'],
    hero: { kw: '인터넷이전설치 / 이사 인터넷 이전설치' },
    sections: [
      s('이전설치란?', '정의', undefined, '해지가 아니라 회선 이동임을 명확히'),
      s('이전설치 vs 해지 후 신규, 어느 쪽이 이득', '비교표', undefined, '★ 이 페이지의 핵심. 약정 승계 vs 신규 사은품 손익'),
      s('신청 시점과 절차', '목록 OL', 'KT이전설치', '이사 며칠 전에 신청해야 하는지. 890'),
      s('3사 이전설치 비용', '비교표', undefined, '→ /install/cost/'),
      s('이전이 불가한 경우', '주의사항', undefined, '새 주소에 해당 통신사 미설치. → /tools/coverage/'),
      s('약정은 어떻게 되나요', 'Q&A', undefined, '승계 여부와 잔여 기간'),
      s('이사하면서 통신사를 바꾸는 경우', '상세', undefined, '★ → /switch/. 이사 = 전환 최적 타이밍'),
      FAQ, CTA, REL,
    ],
  },
  {
    order: 20, site: 'A', path: '/sk/price/', volume: 2240,
    title: 'SK 인터넷 요금제 | 속도별 월요금 총정리', h1: 'SK 인터넷 요금제',
    keywords: ['SK인터넷요금제'],
    hero: { kw: 'SK인터넷요금제' },
    sections: [
      s('SK 인터넷 요금제 전체', '비교표', undefined, '★ 핵심 표'),
      s('약정 기간별 요금 차이', '비교표', undefined, '→ /contract/'),
      s('속도별 추천 대상', '상세 h3'),
      s('B tv 결합 시 요금', '비교표', undefined, '→ /sk/tv/'),
      s('SKT 휴대폰 결합할인', '비교표', undefined, '온가족할인. 정책 변경 잦음'),
      s('제휴카드 적용 시 실제 청구액', '비교표', undefined, '→ /bundle/card/'),
      s('설치비와 부가비용', '비교표'),
      s('요금에 포함되지 않는 것', '주의사항'),
      FAQ, CTA,
    ],
  },
]
