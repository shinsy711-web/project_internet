/**
 * 비교표 마스터 데이터 스키마 — 시트 table_data_schema (12n6CmZSL07DjGyJx3rzJqomvt7vaVaaTDqq7dbN5_yo) "①스키마정의"
 *
 * 비교표 59개(lib/tables.ts)가 전부 이 테이블들에서만 값을 읽는다. 요금이 개정되면 data/ 한 곳만 고친다.
 * 페이지 코드·원고에 요금 숫자를 직접 쓰지 않는다 (운영규칙 1).
 *
 * 시트와 다른 점 — 이 파일에서 더한 것
 *   - device_fees · speed_ref · line_types · tv_platforms · gift_rules 에도 갱신일 · 출처url · 검증상태 를 뒀다.
 *     운영규칙 2(미검증 값 출력 금지)·4(caption 에 갱신일·출처)를 모든 표에 똑같이 적용하려면 필요하다.
 *   - 시트상 '필수' 숫자라도 초안 단계에서 모르는 값은 null 을 허용한다. null 은 화면에 '확인 중' 으로 나간다.
 */

export type CarrierId = 'kt' | 'sk' | 'lg' | 'hello' | 'dlive'

/** 미검증 값은 화면에 출력하지 않는다 (운영규칙 2) */
export type Verify = '미검증' | '공식확인'

export type Source = {
  /** 표 caption 에 그대로 출력 (운영규칙 4) */
  갱신일: string
  출처url: string
  검증상태: Verify
}

export const SPEED_LABELS = ['100M', '500M', '1G', '2.5G', '5G', '10G'] as const
export type SpeedLabel = (typeof SPEED_LABELS)[number]

export type Carrier = {
  carrier_id: CarrierId
  /** 화면용 짧은 이름 */
  표시명: string
  /** 푸터·법적 표기용 */
  정식명: string
  인터넷_브랜드?: string
  /** ★ 표기 혼동이 검색 수요를 만드는 지점 */
  tv_브랜드: string
  /** 본문 표기 변형 소화용 */
  별칭: string[]
  대표번호?: string
}

/** 인터넷 요금제 — 스키마의 심장 */
export type Plan = Source & {
  plan_id: string
  carrier_id: CarrierId
  speed_label: SpeedLabel
  speed_mbps: number
  /** 통신사 공식 상품명 그대로 */
  상품명: string
  월요금_3년: number | null
  월요금_2년?: number | null
  월요금_1년?: number | null
  월요금_무약정?: number | null
  /** ★ 이걸 안 적으면 표가 전부 틀림. 통신사별로 표기 관행이 다름 (운영규칙 3) */
  부가세포함: boolean | null
  /** 약관상 최저보장. /speed/test/ 진단표 근거 */
  최저보장속도_mbps?: number | null
  업로드_mbps?: number | null
  대칭형?: boolean | null
}

export type TvPlan = Source & {
  tv_plan_id: string
  carrier_id: CarrierId
  상품명: string
  채널수: number | null
  월요금_3년: number | null
  부가세포함: boolean | null
  /** ★ /tv/iptv/ OTT 비교표의 유일한 소스 */
  ott포함?: string[]
  vod_포함?: string
}

export type Bundle = Source & {
  bundle_id: string
  carrier_id: CarrierId
  결합유형: '인터넷+TV' | '인터넷+모바일' | '가족결합' | 'TPS'
  조건: string
  할인방식: '정액' | '정률'
  /** 정액이면 원, 정률이면 % */
  할인값: number | null
  /** ★ 어디서 빠지는지가 표의 핵심 */
  할인적용대상: '인터넷' | '모바일' | '양쪽'
  최대회선?: number
}

export type InstallFee = Source & {
  carrier_id: CarrierId
  /** ★ '이전설치' 는 매핑하면서 추가된 값 */
  유형: '신규' | '이전설치' | '추가설치'
  시간대: '평일' | '주말·야간'
  구성: '인터넷단독' | '인터넷+TV' | '인터넷+TV+전화'
  설치비: number | null
  부가세포함: boolean | null
  면제조건?: string
  소요일_최소?: number | null
  소요일_최대?: number | null
}

export type DeviceFee = Source & {
  carrier_id: CarrierId
  장비종류: '공유기' | '셋톱박스' | '모뎀'
  모델명?: string
  /** ★ '요금 외에 드는 비용' 표의 소스. 광고가에서 빠지는 항목 */
  월임대료: number | null
  무료조건?: string
}

export type Card = Source & {
  card_id: string
  carrier_id: CarrierId
  카드사: string
  카드명: string
  /** 월 원. 실적 조건 없이 상시 */
  기본할인: number | null
  /** ★ 신규 발급자 한정 */
  추가할인?: number | null
  /** ★ 보통 24개월. 이후 사라짐 — '월 0원' 광고의 핵심 함정 */
  추가할인_적용월수?: number | null
  전월실적: number | null
  /** ★ 세금·공과금·상품권 등. 이걸 안 쓰면 광고와 같은 짓이 됨 */
  실적제외항목: string[]
}

export type PenaltyRule = Source & {
  carrier_id: CarrierId
  약정기간: '1년' | '2년' | '3년'
  경과구간: string
  /** 수식 문자열 — 계산기(/tools/penalty/)가 그대로 파싱 */
  산정방식: string
  설치비_반환: boolean
  사은품_반환조건: string
  // 출처url 은 약관 원문(PDF)으로 (운영규칙 12)
}

/** 속도 기준 참조표 (통신사 무관) */
export type SpeedRef = Source & {
  speed_label: SpeedLabel
  공칭_mbps: number
  권장_가구원수: string
  권장_용도: string[]
  '4k_동시시청'?: number
  /** /speed/test/ 진단표. 실측이 이 아래면 문제 */
  정상범위_하한: number | null
  비고?: string
}

export type LineTypeId = 'ftth' | 'lan' | 'hfc'
export type LineType = Source & {
  type_id: LineTypeId
  표시명: string
  최대속도: string
  대칭성: '대칭' | '비대칭'
  안정성: string
  주_사용처: string
}

export type TvPlatformId = 'iptv' | 'cable' | 'satellite'
export type TvPlatform = Source & {
  platform_id: TvPlatformId
  표시명: string
  전송방식: string
  양방향: boolean
  /** ★ 'IPTV만 단독 가입 가능한가' 답의 근거 */
  인터넷_필수: boolean
  /** 균형 서술 — 표 셀이 아니라 본문용 */
  장단점: string
}

/**
 * 사은품 규칙 — ★★ 금액 필드가 없다. 만들지 말 것 (운영규칙 10).
 * KAIT 신고 유형에 '가이드라인 위반 표시·광고'가 독립 항목으로 있다. 상대규모_순서(1=가장 큼)만 둔다.
 */
export type GiftRule = Source & {
  종류: '현금' | '상품권' | '기기'
  지급시점: string
  지급방식: string
  상품권종류?: string[]
  반환조건: string
  상대규모_순서?: number | null
  비고?: string
}

/** 참조표 행 이름 — 스키마 설명에 적힌 표시명 */
export const LINE_TYPE_LABELS: Record<LineTypeId, string> = { ftth: 'FTTH(광가입자망)', lan: '광랜(FTTB)', hfc: '케이블(HFC)' }
export const TV_PLATFORM_LABELS: Record<TvPlatformId, string> = { iptv: 'IPTV', cable: '케이블TV', satellite: '위성방송' }
