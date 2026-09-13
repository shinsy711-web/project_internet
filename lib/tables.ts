/**
 * 비교표 59개 → 소스 테이블 매핑 — 시트 table_data_schema "②비교표_매핑"
 *
 * 페이지의 비교표 섹션(lib/pages.ts, type '비교표')은 (URL, H2 문구)로 여기 정의를 찾고, 값은 data/ 에서만 읽는다.
 *   - 운영규칙 1  표 숫자는 마스터 테이블에서만 — 원고·페이지 코드에 요금 숫자 금지
 *   - 운영규칙 2  검증상태 '미검증' 값은 출력하지 않는다 → '확인 중'
 *   - 운영규칙 3  부가세 포함 여부를 caption 에 표기
 *   - 운영규칙 4  caption 에 갱신일과 출처
 *   - 운영규칙 9  같은 표를 두 페이지가 쓰면 한쪽은 요약(3행) — `summary: true`
 *
 * `build` 가 없는 표는 아직 데이터 빌더가 없다 → 화면에 시트 크기(행×열)대로 회색 자리 표가 나오고, 그 페이지는 원고 대기로 남는다.
 * 빌더를 더할 때는 아래 buildTable 의 switch 에 kind 를 추가한다.
 */
import { carrierLabel } from '@/data/carriers'
import { bundles, lineTypes, speedRef, tvPlatforms } from '@/data/empty'
import { giftRules } from '@/data/giftRules'
import { installFees } from '@/data/installFees'
import { plans } from '@/data/plans'
import {
  LINE_TYPE_LABELS,
  SPEED_LABELS,
  TV_PLATFORM_LABELS,
  type CarrierId,
  type GiftRule,
  type InstallFee,
  type LineTypeId,
  type Plan,
  type Source,
  type SpeedLabel,
  type TvPlatformId,
} from '@/data/schema'
import { SITE_KEY } from './site'

type Build =
  | { kind: 'overview' }
  | { kind: 'carrierPlans'; carrier: CarrierId }
  | { kind: 'speedMatrix'; field: '월요금_3년' | '최저보장속도_mbps' }
  | { kind: 'contract'; carrier?: CarrierId }
  | { kind: 'installFees'; type: InstallFee['유형']; carrier?: CarrierId }
  | { kind: 'installDays'; carrier?: CarrierId }
  | { kind: 'speedRef'; view: 'normal' | 'diff' | 'recommend' | 'compare' }
  | { kind: 'lineTypes' }
  | { kind: 'tvPlatforms' }
  | { kind: 'giftTypes'; kinds: GiftRule['종류'][] }

export type TableDef = {
  no: number
  site: 'A' | 'B'
  path: string
  /** 페이지 H2 문구와 같은 글자 (공백·물음표 무시하고 짝을 맞춘다) */
  h2: string
  sources: string
  /** 시트 표 크기 '행×열' */
  size: string
  rule?: string
  summary?: boolean
  build?: Build
}

export type BuiltTable = { caption: string; head: string[]; rows: string[][]; allPending: boolean }

const t = (no: number, site: 'A' | 'B', path: string, h2: string, sources: string, size: string, extra: Partial<TableDef> = {}): TableDef => ({
  no,
  site,
  path,
  h2,
  sources,
  size,
  ...extra,
})

export const TABLES: TableDef[] = [
  t(1, 'A', '/speed/test/', '측정 결과 이렇게 읽으세요', 'speed_ref', '5×3', { rule: '속도 구간별 정상범위. 6개 구간 중 주요 3개만', build: { kind: 'speedRef', view: 'normal' } }),
  t(2, 'A', '/speed/test/', '내 요금제에서 이 속도가 정상인가요?', 'plans + speed_ref', '5×3', { rule: 'plans.최저보장속도_mbps 와 speed_ref.정상범위_하한 조인' }),
  t(3, 'A', '/', 'KT·SK·LG 3사 한눈에 비교', 'carriers + plans + install_fees', '5×4', { rule: '★ 메인 표. 500M 기준 1행만 뽑아 3사 나열. 항목=월요금·설치비·최대속도·약정·결합', build: { kind: 'overview' } }),
  t(4, 'A', '/', '속도별 요금 비교', 'plans', '6×4', { rule: '/price/ 와 같은 표 — 여기는 3행 요약(운영규칙 9)', summary: true, build: { kind: 'speedMatrix', field: '월요금_3년' } }),
  t(5, 'A', '/', '인터넷만 가입 vs TV 결합', 'plans + tv_plans + bundles', '4×3', { rule: '단독 / +TV / +TV+전화 3행' }),
  t(6, 'A', '/kt/', 'KT 인터넷 요금제 전체', 'plans (carrier=kt)', '6×4', { rule: '★ /kt/ 는 3행 요약, /kt/price/ 는 전체', summary: true, build: { kind: 'carrierPlans', carrier: 'kt' } }),
  t(7, 'A', '/kt/', 'KT 인터넷 + 지니TV 결합', 'tv_plans + bundles (kt)', '4×4'),
  t(8, 'A', '/kt/', 'KT 설치비와 소요일', 'install_fees (kt, 유형=신규)', '4×3', { rule: '평일/주말 × 구성', build: { kind: 'installFees', type: '신규', carrier: 'kt' } }),
  t(9, 'A', '/kt/', 'KT 재약정 vs 타사 전환', 'penalty_rules + plans + gift_rules', '4×3', { rule: '★ gift_rules 는 금액 없이 상대규모_순서만' }),
  t(10, 'A', '/speed/', '100M·500M·1G 실제 차이', 'speed_ref', '3×4', { build: { kind: 'speedRef', view: 'diff' } }),
  t(11, 'A', '/speed/', '내게 맞는 속도 고르는 기준', 'speed_ref', '5×3', { rule: '권장_가구원수 × 권장_용도', build: { kind: 'speedRef', view: 'recommend' } }),
  t(12, 'A', '/speed/', '통신사별 속도 체감 차이', 'plans.최저보장속도_mbps', '3×3', { rule: '★ 근거 없는 우열 단정 금지. 약관상 최저보장 수치만 제시', summary: true, build: { kind: 'speedMatrix', field: '최저보장속도_mbps' } }),
  t(13, 'A', '/sk/', 'SK 인터넷 요금제 전체', 'plans (carrier=sk)', '6×4', { rule: '/sk/price/ 와 같은 표 — 여기는 3행 요약', summary: true, build: { kind: 'carrierPlans', carrier: 'sk' } }),
  t(14, 'A', '/sk/', 'SK 인터넷 + B tv 결합', 'tv_plans + bundles (sk)', '4×4'),
  t(15, 'A', '/sk/', 'SK 설치비와 소요일', 'install_fees (sk, 신규)', '4×3', { build: { kind: 'installFees', type: '신규', carrier: 'sk' } }),
  t(16, 'A', '/sk/', 'SKT 휴대폰 결합할인', 'bundles (sk, 인터넷+모바일)', '5×3', { rule: '★ 할인적용대상 필드가 핵심 — 인터넷에서 빠지나 모바일에서 빠지나. /sk/price/ 와 같은 표 — 여기는 요약', summary: true }),
  t(17, 'A', '/install/', '3사 설치비 비교', 'install_fees (유형=신규)', '4×4', { rule: '구성 행 × 3사 열', build: { kind: 'installFees', type: '신규' } }),
  t(18, 'A', '/install/', '설치 소요일과 예약 방법', 'install_fees.소요일_최소/최대', '3×4', { build: { kind: 'installDays' } }),
  t(19, 'A', '/bundle/tv/', '3사 인터넷+TV 요금 비교', 'plans + tv_plans + bundles', '5×4', { rule: '★ 결합 후 최종 월요금을 계산해서 출력. 계산식을 각주에 명시(운영규칙 11)' }),
  t(20, 'A', '/bundle/tv/', '채널 수와 OTT 포함 여부 비교', 'tv_plans', '4×5', { rule: 'ott포함 배열을 ○/× 로 전개' }),
  t(21, 'A', '/bundle/tv/', '인터넷만 vs 인터넷+TV, 얼마 차이나나', 'plans + tv_plans + bundles', '3×4'),
  t(22, 'B', '/', '상품권과 현금의 차이', 'gift_rules', '3×4', { rule: '★ 금액 컬럼 없음. 지급시점·방식·반환조건만', build: { kind: 'giftTypes', kinds: ['현금', '상품권'] } }),
  t(23, 'A', '/switch/', '지금 갈아타도 되는지 판단', 'penalty_rules', '4×3', { rule: '약정 잔여구간별 판단' }),
  t(24, 'A', '/switch/', '재약정 vs 갈아타기, 어느 쪽이 이득', 'penalty_rules + plans + gift_rules', '4×3', { rule: '★ 금액 대신 순서' }),
  t(25, 'A', '/switch/', '통신사별 전환 혜택 비교', 'bundles + gift_rules', '4×4', { rule: '★ 금액 표기 금지' }),
  t(26, 'A', '/kt/price/', 'KT 인터넷 요금제 전체', 'plans (carrier=kt)', '6×4', { rule: '★ 전체 버전 (/kt/ 는 요약)', build: { kind: 'carrierPlans', carrier: 'kt' } }),
  t(27, 'A', '/kt/price/', '약정 기간별 요금 차이', 'plans (3년/2년/1년/무약정)', '4×4', { rule: '월요금_* 필드를 행으로 전개', build: { kind: 'contract', carrier: 'kt' } }),
  t(28, 'A', '/kt/price/', 'TV 결합 시 요금', 'tv_plans + bundles', '4×4'),
  t(29, 'A', '/kt/price/', '휴대폰 결합할인 요율', 'bundles (인터넷+모바일)', '5×4'),
  t(30, 'A', '/kt/price/', '제휴카드 적용 시 실제 청구액', 'cards + plans', '5×5', { rule: '★ 기본할인만 적용한 값과 추가할인 포함한 값을 다른 열로. 전월실적·적용월수를 반드시 같은 행에' }),
  t(31, 'A', '/kt/price/', '설치비와 부가비용', 'install_fees + device_fees', '5×3'),
  t(32, 'A', '/price/', '3사 인터넷 요금 한눈에', 'plans', '6×4', { rule: '시트상 No.33 과 소스·크기가 같아 3행 요약으로 분리(운영규칙 9)', summary: true, build: { kind: 'speedMatrix', field: '월요금_3년' } }),
  t(33, 'A', '/price/', '속도별 요금 비교', 'plans', '6×4', { rule: 'speed_label 행 × 3사 열. 6구간이면 6행 — 5행 원칙 초과 허용', build: { kind: 'speedMatrix', field: '월요금_3년' } }),
  t(34, 'A', '/price/', '요금 외에 드는 비용', 'install_fees + device_fees', '4×4', { rule: '★ 광고가에서 빠지는 항목 전개. 차별화 지점' }),
  t(35, 'A', '/price/', '약정 기간별 요금 차이', 'plans (3년/2년/1년/무약정)', '4×4', { rule: '3사 × 약정 (500M 기준)', build: { kind: 'contract' } }),
  t(36, 'A', '/price/', '결합하면 얼마나 싸지나', 'bundles', '5×4'),
  t(37, 'A', '/kt/install/', 'KT 설치비', 'install_fees (kt)', '4×3', { build: { kind: 'installFees', type: '신규', carrier: 'kt' } }),
  t(38, 'A', '/kt/install/', '설치 소요일과 예약', 'install_fees.소요일_*', '3×3', { build: { kind: 'installDays', carrier: 'kt' } }),
  t(39, 'A', '/tv/iptv/', 'IPTV vs 케이블TV vs 위성방송', 'tv_platforms', '5×4', { rule: '★ 정적 참조표. 갱신 거의 불필요', build: { kind: 'tvPlatforms' } }),
  t(40, 'A', '/tv/iptv/', '3사 IPTV 비교', 'tv_plans', '5×4'),
  t(41, 'A', '/tv/iptv/', '채널 수와 편성', 'tv_plans.채널수', '4×4'),
  t(42, 'A', '/tv/iptv/', 'OTT 포함 요금제', 'tv_plans.ott포함', '4×5'),
  t(43, 'B', '/gift/', '사은품 종류 비교', 'gift_rules', '3×4', { rule: '★ 금액 없음', build: { kind: 'giftTypes', kinds: ['현금', '상품권', '기기'] } }),
  t(44, 'B', '/tv-cash/', '결합 조합별 지원 규모', 'gift_rules.상대규모_순서', '4×3', { rule: '★★ 금액 절대 금지. 순서(1·2·3)로만 표기' }),
  t(45, 'A', '/sk/install/', 'SK 설치비', 'install_fees (sk)', '4×3', { build: { kind: 'installFees', type: '신규', carrier: 'sk' } }),
  t(46, 'A', '/sk/install/', '설치 소요일과 예약', 'install_fees.소요일_*', '3×3', { build: { kind: 'installDays', carrier: 'sk' } }),
  t(47, 'A', '/speed/compare/', '회선 종류별 비교', 'line_types', '4×5', { rule: '★ 정적 참조표', build: { kind: 'lineTypes' } }),
  t(48, 'A', '/speed/compare/', '100M·500M·1G·2.5G·10G 비교', 'speed_ref', '6×5', { rule: '★ 핵심 표. 6구간 전체', build: { kind: 'speedRef', view: 'compare' } }),
  t(49, 'A', '/speed/compare/', '가구원수·용도별 권장 속도', 'speed_ref', '5×3', { build: { kind: 'speedRef', view: 'recommend' } }),
  t(50, 'A', '/kt/tv/', 'KT 인터넷+TV 요금', 'tv_plans + bundles (kt)', '5×4'),
  t(51, 'A', '/kt/tv/', '채널 수와 OTT 구성', 'tv_plans (kt)', '4×4'),
  t(52, 'A', '/install/move/', '이전설치 vs 해지 후 신규, 어느 쪽이 이득', 'install_fees(유형=이전설치) + penalty_rules + gift_rules', '4×3', { rule: '★ 이 표 때문에 install_fees.유형 필드를 추가했음' }),
  t(53, 'A', '/install/move/', '3사 이전설치 비용', 'install_fees (유형=이전설치)', '4×4', { rule: '★ 1차 스키마에 없던 데이터', build: { kind: 'installFees', type: '이전설치' } }),
  t(54, 'A', '/sk/price/', 'SK 인터넷 요금제 전체', 'plans (carrier=sk)', '6×4', { rule: '전체 버전 (/sk/ 는 요약)', build: { kind: 'carrierPlans', carrier: 'sk' } }),
  t(55, 'A', '/sk/price/', '약정 기간별 요금 차이', 'plans (3년/2년/1년/무약정)', '4×4', { build: { kind: 'contract', carrier: 'sk' } }),
  t(56, 'A', '/sk/price/', 'B tv 결합 시 요금', 'tv_plans + bundles (sk)', '4×4'),
  t(57, 'A', '/sk/price/', 'SKT 휴대폰 결합할인', 'bundles (sk, 인터넷+모바일)', '5×3', { rule: '★ 할인적용대상 필드가 핵심. 전체 버전 (/sk/ 는 요약)' }),
  t(58, 'A', '/sk/price/', '제휴카드 적용 시 실제 청구액', 'cards + plans', '5×5', { rule: '★ 기본할인만 적용한 값과 추가할인 포함한 값을 다른 열로. 전월실적·적용월수를 반드시 같은 행에' }),
  t(59, 'A', '/sk/price/', '설치비와 부가비용', 'install_fees + device_fees', '5×3'),
]

const norm = (s: string) => s.replace(/[\s?？]/g, '')

export const tableFor = (path: string, h2: string) =>
  TABLES.find((d) => d.site === SITE_KEY && d.path === path && norm(d.h2) === norm(h2))

// ── 빌더 ─────────────────────────────────────────────────

const PENDING = '확인 중'
const MAIN: CarrierId[] = ['kt', 'sk', 'lg']
const COMBOS: InstallFee['구성'][] = ['인터넷단독', '인터넷+TV', '인터넷+TV+전화']
const TERMS = [
  ['3년', '월요금_3년'],
  ['2년', '월요금_2년'],
  ['1년', '월요금_1년'],
  ['무약정', '월요금_무약정'],
] as const

const verified = (s: Source | undefined): s is Source => s?.검증상태 === '공식확인'
const num = (s: Source | undefined, v: number | null | undefined, unit: string) =>
  verified(s) && v != null ? `${v.toLocaleString('ko-KR')}${unit}` : PENDING
const won = (s: Source | undefined, v: number | null | undefined) => num(s, v, '원')
const text = (s: Source | undefined, v: string | null | undefined) => (verified(s) && v ? v : PENDING)
const yesNo = (s: Source | undefined, v: boolean | undefined, yes: string, no: string) => (verified(s) && v != null ? (v ? yes : no) : PENDING)

const planAt = (c: CarrierId, label: SpeedLabel) => plans.find((p) => p.carrier_id === c && p.speed_label === label)
const installAt = (c: CarrierId, type: InstallFee['유형'], time: InstallFee['시간대'], combo: InstallFee['구성']) =>
  installFees.find((r) => r.carrier_id === c && r.유형 === type && r.시간대 === time && r.구성 === combo)

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function buildTable(def: TableDef): BuiltTable | null {
  const b = def.build
  if (!b) return null

  const used: (Source | undefined)[] = []
  function use<T extends Source | undefined>(row: T): T {
    used.push(row)
    return row
  }
  let money = false
  let head: string[] = []
  let rows: string[][] = []
  const labels: readonly SpeedLabel[] = def.summary ? SPEED_LABELS.slice(0, 3) : SPEED_LABELS

  switch (b.kind) {
    case 'overview': {
      money = true
      const p500 = MAIN.map((c) => use(planAt(c, '500M')))
      const inst = MAIN.map((c) => use(installAt(c, '신규', '평일', '인터넷단독')))
      head = ['항목', ...MAIN.map(carrierLabel)]
      rows = [
        ['월요금(500M·3년)', ...p500.map((p) => won(p, p?.월요금_3년))],
        ['설치비(평일·단독)', ...inst.map((r) => won(r, r?.설치비))],
        [
          '최대속도',
          ...MAIN.map((c) => plans.filter((p) => p.carrier_id === c && verified(p)).sort((x, y) => y.speed_mbps - x.speed_mbps)[0]?.speed_label ?? PENDING),
        ],
        [
          '약정',
          ...MAIN.map((c) => {
            const p = plans.find((x) => x.carrier_id === c && verified(x))
            const terms = p ? TERMS.filter(([, f]) => p[f] != null).map(([label]) => label) : []
            return terms.length ? terms.join('·') : PENDING
          }),
        ],
        [
          '결합',
          ...MAIN.map((c) => {
            const kinds = [...new Set(bundles.filter((x) => x.carrier_id === c && verified(x)).map((x) => x.결합유형))]
            return kinds.length ? kinds.slice(0, 2).join('·') : PENDING
          }),
        ],
      ]
      break
    }
    case 'carrierPlans': {
      money = true
      head = ['속도', '상품명', '월요금(3년)', '최저보장속도']
      rows = labels.map((l) => {
        const p = use(planAt(b.carrier, l))
        return [l, text(p, p?.상품명), won(p, p?.월요금_3년), num(p, p?.최저보장속도_mbps, 'Mbps')]
      })
      break
    }
    case 'speedMatrix': {
      money = b.field === '월요금_3년'
      head = ['속도', ...MAIN.map(carrierLabel)]
      rows = labels.map((l) => [
        l,
        ...MAIN.map((c) => {
          const p = use(planAt(c, l))
          return b.field === '월요금_3년' ? won(p, p?.월요금_3년) : num(p, p?.최저보장속도_mbps, 'Mbps')
        }),
      ])
      break
    }
    case 'contract': {
      money = true
      const cols: Plan[] | (Plan | undefined)[] = b.carrier
        ? (['100M', '500M', '1G'] as const).map((l) => use(planAt(b.carrier!, l)))
        : MAIN.map((c) => use(planAt(c, '500M')))
      head = b.carrier ? ['약정', '100M', '500M', '1G'] : ['약정(500M)', ...MAIN.map(carrierLabel)]
      rows = TERMS.map(([label, field]) => [label, ...cols.map((p) => won(p, p?.[field]))])
      break
    }
    case 'installFees': {
      money = true
      if (b.carrier) {
        const carrier = b.carrier
        head = ['구성', '평일', '주말·야간']
        rows = COMBOS.map((k) => [k, ...(['평일', '주말·야간'] as const).map((time) => { const r = use(installAt(carrier, b.type, time, k)); return won(r, r?.설치비) })])
      } else {
        head = ['구성(평일)', ...MAIN.map(carrierLabel)]
        rows = COMBOS.map((k) => [k, ...MAIN.map((c) => { const r = use(installAt(c, b.type, '평일', k)); return won(r, r?.설치비) })])
      }
      break
    }
    case 'installDays': {
      if (b.carrier) {
        const carrier = b.carrier
        head = ['구성', '최소 소요일', '최대 소요일']
        rows = COMBOS.map((k) => {
          const r = use(installAt(carrier, '신규', '평일', k))
          return [k, num(r, r?.소요일_최소, '일'), num(r, r?.소요일_최대, '일')]
        })
      } else {
        head = ['통신사', '최소 소요일', '최대 소요일']
        rows = MAIN.map((c) => {
          const r = use(installAt(c, '신규', '평일', '인터넷단독'))
          return [carrierLabel(c), num(r, r?.소요일_최소, '일'), num(r, r?.소요일_최대, '일')]
        })
      }
      break
    }
    case 'speedRef': {
      const at = (l: SpeedLabel) => use(speedRef.find((r) => r.speed_label === l))
      if (b.view === 'normal') {
        head = ['계약 속도', '정상범위 하한', '비고']
        rows = SPEED_LABELS.slice(0, 3).map((l) => { const r = at(l); return [l, num(r, r?.정상범위_하한, 'Mbps'), text(r, r?.비고)] })
      } else if (b.view === 'diff') {
        head = ['속도', '공칭 속도', '권장 가구원수', '4K 동시시청']
        rows = SPEED_LABELS.slice(0, 3).map((l) => { const r = at(l); return [l, num(r, r?.공칭_mbps, 'Mbps'), text(r, r?.권장_가구원수), num(r, r?.['4k_동시시청'], '대')] })
      } else if (b.view === 'recommend') {
        head = ['속도', '권장 가구원수', '권장 용도']
        rows = SPEED_LABELS.slice(0, 5).map((l) => { const r = at(l); return [l, text(r, r?.권장_가구원수), text(r, r?.권장_용도.join('·'))] })
      } else {
        head = ['속도', '공칭 속도', '권장 가구원수', '권장 용도', '정상범위 하한']
        rows = SPEED_LABELS.map((l) => { const r = at(l); return [l, num(r, r?.공칭_mbps, 'Mbps'), text(r, r?.권장_가구원수), text(r, r?.권장_용도.join('·')), num(r, r?.정상범위_하한, 'Mbps')] })
      }
      break
    }
    case 'lineTypes': {
      head = ['회선 종류', '최대속도', '대칭성', '안정성', '주 사용처']
      rows = (Object.keys(LINE_TYPE_LABELS) as LineTypeId[]).map((id) => {
        const r = use(lineTypes.find((x) => x.type_id === id))
        return [LINE_TYPE_LABELS[id], text(r, r?.최대속도), text(r, r?.대칭성), text(r, r?.안정성), text(r, r?.주_사용처)]
      })
      break
    }
    case 'tvPlatforms': {
      head = ['구분', '전송방식', '양방향', '인터넷 필수']
      rows = (Object.keys(TV_PLATFORM_LABELS) as TvPlatformId[]).map((id) => {
        const r = use(tvPlatforms.find((x) => x.platform_id === id))
        return [TV_PLATFORM_LABELS[id], text(r, r?.전송방식), yesNo(r, r?.양방향, '가능', '불가'), yesNo(r, r?.인터넷_필수, '필수', '불필요')]
      })
      break
    }
    case 'giftTypes': {
      head = ['종류', '지급시점', '지급방식', '반환조건']
      rows = b.kinds.map((k) => {
        const r = use(giftRules.find((g) => g.종류 === k))
        return [k, text(r, r?.지급시점), text(r, r?.지급방식), text(r, r?.반환조건)]
      })
      break
    }
  }

  const ok = used.filter(verified)
  const date = ok.map((s) => s.갱신일).sort().at(-1)
  const hosts = [...new Set(ok.map((s) => hostOf(s.출처url)))].join(', ')

  // 운영규칙 3 — 금액 표는 부가세 포함 여부를 caption 에
  let vat = ''
  if (money) {
    const flags = ok.map((s) => (s as Partial<Plan>).부가세포함).filter((v): v is boolean => typeof v === 'boolean')
    if (flags.length) vat = flags.every(Boolean) ? ' (VAT 포함)' : flags.every((v) => !v) ? ' (VAT 별도)' : ' (VAT 표기 혼재 — 확인 필요)'
  }

  return {
    caption: `${def.h2}${vat} — ${date ? `${date} 기준 · 출처 ${hosts}` : '기준일·출처 공식 확인 전'}`,
    head,
    rows,
    allPending: rows.every((r) => r.slice(1).every((c) => c === PENDING)),
  }
}
