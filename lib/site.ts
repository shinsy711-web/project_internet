/**
 * 사이트 상수 · 트리 탐색 · 내비게이션 (단일 소스)
 *
 * 한 코드베이스에서 사이트 A(본진)와 B(현금·사은품 위성)를 따로 빌드한다. 둘 다 '/' 를 쓰고 도메인이 다르다.
 *   A: npm run dev / npm run check          → out/
 *   B: npm run dev:b / npm run check:b      → out-b/   (scripts/site.mjs 가 NEXT_PUBLIC_SITE=B 로 돌린다)
 *
 * 페이지 목록 = 시트 레지스트리(lib/pages.ts) + 원고만 있는 페이지. 원고가 있으면 TITLE·H1 은 원고 프런트매터가 이긴다.
 * ⚠️ lib/manuscripts.ts(node:fs)를 import 한다 — 서버 전용. 클라이언트 컴포넌트는 props 로 받을 것(Header 참고).
 */
import { isReady, loadDoc } from './content'
import { manuscriptFor, manuscripts, siteAUrlSet } from './manuscripts'
import { PAGES, type PageDef, type SectionType } from './pages'
import { SITE_KEY, type SiteKey } from './siteKey'

export { SITE_KEY, type SiteKey }

export type QuickIcon = 'chat' | 'chart' | 'calc' | 'speed' | 'home' | 'gift' | 'tv' | 'switch'

type SiteConfig = {
  /** 오른쪽 빠른 메뉴 (components/QuickMenu.tsx). `#apply` 는 모든 페이지에 있다. 경로는 공개 페이지만 나간다 */
  quick: [href: string, label: string, icon: QuickIcon][]
  /** 확정 도메인(https://, 끝 슬래시 없이) — canonical · sitemap · robots · OG · 구조화 데이터의 기준. 비어 있으면 환경변수/Vercel 주소 */
  domain: string
  /** 브랜드명 — 미정. title 접미사. 비어 있으면 og:site_name · Organization 이 빠지고 감사 스크립트가 배포를 막는다 */
  name: string
  /** 푸터 필수 고지 — 미정. 비어 있으면 감사 스크립트가 배포를 막는다 */
  disclaimer: string
  ctaDockText: string
  header: [path: string, label: string][]
  /** 푸터 사이트맵 묶음. 여기 없는 페이지는 마지막 묶음에 자동으로 붙는다(고아 방지) */
  groups: [title: string, paths: string[]][]
}

const CONFIG: Record<SiteKey, SiteConfig> = {
  A: {
    // 2026-10-15 확정. jalkkalda.com · www 등 나머지 주소는 vercel.json 에서 301 로 여기로 보낸다
    domain: 'https://jalkkalda.kr',
    name: '잘깔다',
    disclaimer: '',
    ctaDockText: '',
    quick: [
      ['#apply', '상담 신청', 'chat'],
      ['/price/', '요금 비교', 'chart'],
      ['/tools/penalty/', '위약금 계산기', 'calc'],
      ['/speed/test/', '속도측정', 'speed'],
      ['/install/cost/', '설치비 비교', 'home'],
    ],
    header: [
      ['/kt/', 'KT'],
      ['/sk/', 'SK'],
      ['/price/', '요금 비교'],
      ['/speed/', '인터넷 속도'],
      ['/speed/test/', '속도측정'],
      ['/tv/iptv/', 'IPTV'],
      ['/bundle/tv/', 'TV 결합'],
      ['/install/', '설치'],
      ['/switch/', '통신사 변경'],
    ],
    groups: [
      ['통신사', ['/', '/kt/', '/kt/price/', '/kt/install/', '/kt/renew/', '/kt/tv/', '/sk/', '/sk/price/', '/sk/install/', '/sk/tv/', '/lg/', '/lg/price/', '/lg/install/', '/vs/kt-lg-sk/', '/vs/kt-lg/', '/vs/kt-sk/']],
      ['요금·결합', ['/guide/', '/price/', '/price/100m/', '/price/500m/', '/price/1g/', '/find/', '/contract/', '/bundle/', '/budget/', '/budget/free/', '/tv/iptv/', '/bundle/tv/']],
      ['속도·장비', ['/speed/', '/speed/test/', '/speed/compare/', '/speed/recommend/', '/speed/slow/', '/speed/wifi/', '/speed/kt/', '/device/lan/', '/device/modem/', '/device/router/', '/device/settop/', '/trouble/disconnect/', '/trouble/repair/']],
      ['설치·변경', ['/install/', '/install/cost/', '/install/fast/', '/install/self/', '/install/move/', '/switch/', '/switch/benefit/', '/switch/timing/', '/home/', '/home/apt/', '/home/villa/', '/home/officetel/', '/home/oneroom/', '/home/newlywed/', '/home/biz/']],
      ['계산기·기타', ['/tools/penalty/', '/tools/expiry/', '/tools/coverage/']],
    ],
  },
  B: {
    domain: '',
    name: '',
    disclaimer: '',
    ctaDockText: '',
    quick: [
      ['#apply', '상담 신청', 'chat'],
      ['/gift/', '사은품', 'gift'],
      ['/tv-cash/', 'TV 결합 혜택', 'tv'],
      ['/switch-cash/', '통신사 변경 혜택', 'switch'],
    ],
    header: [
      ['/', '현금 지원'],
      ['/gift/', '사은품'],
      ['/tv-cash/', 'TV 현금 지원'],
      ['/cash/kt/', 'KT 현금 지원'],
      ['/cash/sk/', 'SK 현금 지원'],
    ],
    groups: [['현금·사은품', ['/', '/gift/', '/tv-cash/', '/install-cash/', '/switch-cash/', '/cash/kt/', '/cash/sk/']]],
  },
}

const cfg = CONFIG[SITE_KEY]

export const SITE_NAME = cfg.name
/** <title> 끝에 ` | 브랜드명`. og:title 에는 붙이지 않는다(og:site_name 이 따로 있다) */
export const brandTitle = (title: string) => (SITE_NAME ? `${title} | ${SITE_NAME}` : title)
export const DISCLAIMER = cfg.disclaimer
export const CTA_DOCK_TEXT = cfg.ctaDockText

/**
 * 도메인 — 우선순위: 환경변수(A NEXT_PUBLIC_SITE_URL · B NEXT_PUBLIC_SITE_URL_B) → CONFIG.domain → Vercel 프로덕션 주소 → localhost.
 * A 는 jalkkalda.kr 로 확정(CONFIG.A.domain) — 공개값이라 코드에 둔다. 배포 환경변수가 없어도 canonical 이 틀어지지 않는다.
 * B 빌드(scripts/site.mjs)는 같은 .env.local 을 읽으므로 변수를 나누지 않으면 B 의 canonical·sitemap·robots 가 A 도메인을 가리킨다.
 * 다 비어 있으면 localhost 로 남고 감사 스크립트가 배포를 막는다.
 */
const SITE_URL_ENV = SITE_KEY === 'B' ? process.env.NEXT_PUBLIC_SITE_URL_B : process.env.NEXT_PUBLIC_SITE_URL
/** Vercel 빌드면 프로젝트의 프로덕션 도메인(커스텀 도메인을 붙이면 그 도메인)을 쓴다 — 변수를 안 넣어도 canonical 이 localhost 로 나가지 않게 */
const VERCEL_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ''
export const SITE_URL = (SITE_URL_ENV || cfg.domain || VERCEL_URL || 'http://localhost:3000').replace(/\/$/, '')
/** 사이트 A(본진) 도메인 — B 원고가 A 경로를 링크할 때 절대 URL 로 보낸다 */
export const SITE_A_URL = (process.env.NEXT_PUBLIC_SITE_URL || CONFIG.A.domain).replace(/\/$/, '')

/** OG 1200×630 (public/og.png — 브랜드명이 들어간 그림이라 A 만). 비어 있으면 og:image · Article.image 를 넣지 않는다 */
export const OG_IMAGE = SITE_KEY === 'A' ? '/og.png' : ''
/** Organization.logo · 파비콘 (public/icon.png 512×512 · apple-icon.png) */
export const LOGO_IMAGE = '/icon.png'

/** 프런트매터 날짜(YYYY-MM-DD)에 한국 시간대를 붙인다 — 구조화 데이터 · og article 시각은 시간대가 있어야 한다 */
export const isoDate = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00+09:00` : d)

/** 검색엔진 소유확인 · GA — 값이 없으면 태그 자체를 렌더하지 않는다 (플레이스홀더 금지) */
export const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_VERIFICATION || ''
export const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ''
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

/** 운영 법인 = 개인정보 수집 주체(2026-10-15 확정). 동의서 · 처리방침 · 푸터가 같은 표기를 쓰도록 이 상수만 참조한다 — '(주)' 약칭 금지 */
const COMPANY = '주식회사 와야미디어'

/** 운영 주체 — 확인된 값만. 빈 값은 푸터에서 줄 자체가 빠진다 */
export const OPERATOR = { name: COMPANY, email: '' }

/**
 * 상담 폼 — project21_db 공용 수집 서버(`/api/submit?api_key=`, project31 등과 같은 서버). 키는 사이트마다 sites 테이블에 등록해 받는다.
 *   collector  개인정보 수집 주체(운영 법인명) — 동의 문구에 그대로 나간다
 *   thirdParty false = 운영자가 직접 상담한다(제3자 제공 없음 — 백메가 100mb.kr 방식). 폼 동의 항목 · 동의서 · 처리방침에서 제3자 제공이 빠진다.
 *              ⚠️ 접수한 번호를 다른 업체(판매점 등)에 넘기면 반드시 true + recipient(제공받는 자 상호). 동의 없이 넘기면 개인정보 보호법 위반이다.
 * 엔드포인트·수집 주체(+ thirdParty 면 제공받는 자) 중 하나라도 비면 폼은 "준비 중". 플레이스홀더 금지.
 */
export const LEAD = { collector: COMPANY, thirdParty: false, recipient: '', category: '인터넷' }
/**
 * 접수 서버(project_db_bd) — 키는 브라우저 요청 주소에 그대로 실리는 공개값이라 코드에 둔다(환경변수가 있으면 그쪽이 이긴다).
 * A 키 = DB 관리자 '인터넷' 업종 jalkkalda.kr (2026-10-15 등록). B 는 등록 전.
 * ⚠️ 키 확인용으로 실제 키에 POST 하지 말 것 — 빈 본문도 저장되고 디스코드 알림이 간다.
 */
const DB_SUBMIT_URL = process.env.NEXT_PUBLIC_DB_SUBMIT_URL || 'https://project-db-bd.vercel.app/api/submit'
const DB_API_KEY_DEFAULT: Record<SiteKey, string> = { A: '83072aae-c8e3-46e1-b95f-6a4ade83966e', B: '' }
const DB_API_KEY = (SITE_KEY === 'B' ? process.env.NEXT_PUBLIC_DB_API_KEY_B : process.env.NEXT_PUBLIC_DB_API_KEY) || DB_API_KEY_DEFAULT[SITE_KEY]
export const LEAD_ENDPOINT = DB_SUBMIT_URL && DB_API_KEY ? `${DB_SUBMIT_URL}?api_key=${encodeURIComponent(DB_API_KEY)}` : ''
export const FORM_READY = Boolean(LEAD_ENDPOINT && LEAD.collector && (!LEAD.thirdParty || LEAD.recipient))
export const CTA_LABEL = '상담 신청하기'

/**
 * 개인정보 처리방침(app/privacy/page.tsx) — 확인된 값만. 빈 값은 자리 막대로 나가고 페이지가 noindex 로 남는다.
 *   officer     개인정보 보호책임자 성명·직책 · contact  책임자 연락처(전화 또는 이메일)
 *   processors  처리위탁 [수탁자 상호, 위탁 업무] — null 은 미확정, [] 는 "위탁 없음" 으로 나간다
 *   effective   시행일 YYYY-MM-DD
 */
export const PRIVACY: { officer: string; contact: string; processors: [name: string, task: string][] | null; effective: string } = {
  officer: '',
  contact: '',
  processors: null,
  effective: '',
}
export const PRIVACY_PATH = '/privacy/'

// ── 트리 ─────────────────────────────────────────────────

const registry = PAGES.filter((p) => p.site === SITE_KEY)

/** 원고가 있으면 TITLE·H1 은 원고 프런트매터 (원고가 시트보다 나중에 확정된 문구다) */
const merged = registry.map((p) => {
  const m = manuscriptFor(p.path)
  return m ? { ...p, title: m.fm.title || p.title, h1: m.fm.h1 || p.h1 } : p
})

/** 시트 TOP20 에는 없고 원고만 있는 페이지 (예: /install/cost/) */
const extra: PageDef[] = manuscripts()
  .filter((m) => !registry.some((p) => p.path === m.fm.url))
  .map((m, i) => ({
    order: 100 + i,
    site: SITE_KEY,
    path: m.fm.url,
    title: m.fm.title,
    h1: m.fm.h1,
    volume: 0,
    keywords: m.fm.keywords,
    hero: { kw: m.fm.keywords[0] ?? '' },
    sections: [],
  }))

/** 이번 빌드 사이트의 페이지만, 발행 순서대로 */
export const SITE_PAGES = [...merged, ...extra].sort((a, b) => a.order - b.order)

const byPath = new Map(SITE_PAGES.map((p) => [p.path, p]))

export const pageByPath = (path: string) => byPath.get(path)
export const isPage = (path: string) => byPath.has(path)
/**
 * 이 사이트에 없는 경로의 링크 대상. B 원고가 A 경로(/switch/ 등)를 걸면 A 도메인 절대 URL 로 보낸다.
 * 그 밖에 없는 경로는 null — 호출부가 일반 텍스트로 떨군다(깨진 링크 금지).
 */
export const crossSiteHref = (path: string): string | null =>
  SITE_KEY === 'B' && SITE_A_URL && siteAUrlSet().has(path) ? `${SITE_A_URL}${path}` : null
export const absUrl = (path: string) => `${SITE_URL}${path}`

/** 등록된 가장 가까운 조상. /tv/ 처럼 없는 중간 경로는 건너뛰고 홈에 붙는다 */
export function parentOf(path: string): string | null {
  if (path === '/') return null
  const segs = path.split('/').filter(Boolean)
  for (let i = segs.length - 1; i > 0; i--) {
    const cand = `/${segs.slice(0, i).join('/')}/`
    if (byPath.has(cand)) return cand
  }
  return byPath.has('/') ? '/' : null
}

export const childrenOf = (path: string) => SITE_PAGES.filter((p) => p.path !== '/' && parentOf(p.path) === path)

export function trailOf(path: string): PageDef[] {
  const out: PageDef[] = []
  let cur: string | null = path
  while (cur) {
    const p = byPath.get(cur)
    if (p) out.unshift(p)
    cur = parentOf(cur)
  }
  return out
}

/** 시트 메모의 `→ /경로/` 들 */
export const linksOf = (memo?: string) => [...new Set(memo?.match(/\/(?:[a-z][a-z0-9-]*\/)+/g) ?? [])]

// ── 내비게이션 ───────────────────────────────────────────

/** 헤더·푸터는 공개 가능한 페이지만 — 원고 대기(noindex) 페이지를 전 페이지에서 링크하면 준비 중 화면으로 크롤 예산과 사용자를 보낸다 */
const linkable = (path: string) => isPage(path) && isReady(loadDoc(path))

export const HEADER_NAV = cfg.header.filter(([p]) => linkable(p)).map(([path, label]) => ({ path, label }))

export const QUICK_MENU = cfg.quick.filter(([href]) => href.startsWith('#') || linkable(href)).map(([href, label, icon]) => ({ href, label, icon }))

/** 섹션 h2 위 영문 키커 — h2 의 data-kicker 속성을 CSS 의사요소로 그린다(DOM 글자가 아니라 본문·감사 스크립트에 안 섞인다) */
const KICKER: Record<SectionType, string> = {
  정의: 'OVERVIEW',
  '정의+상세': 'OVERVIEW',
  비교표: 'COMPARE',
  상세: 'IN DETAIL',
  '상세 h3': 'IN DETAIL',
  '목록 UL': 'KEY POINTS',
  '목록 OL': 'EASY STEPS',
  주의사항: 'CHECK POINT',
  신뢰: 'TRUST',
  도구: 'TOOLS',
  'Q&A': 'Q&A',
  FAQ: 'FAQ',
  전환: 'NEXT STEP',
  CTA: 'FREE CONSULTING',
  관련문서: 'MORE GUIDES',
}
export const kickerOf = (type: SectionType) => KICKER[type]

const listed = new Set(cfg.groups.flatMap(([, paths]) => paths))
const leftovers = SITE_PAGES.filter((p) => !listed.has(p.path) && linkable(p.path))

export const FOOTER_GROUPS = cfg.groups
  .map(([title, paths], i, all) => ({
    title,
    pages: [...paths.filter(linkable).map((p) => byPath.get(p)!), ...(i === all.length - 1 ? leftovers : [])],
  }))
  .filter((g) => g.pages.length > 0)

const EYEBROW: Record<SiteKey, Record<string, string>> = {
  A: {
    kt: 'KT',
    sk: 'SK브로드밴드',
    lg: 'LG U+',
    vs: '통신사 비교',
    find: '인터넷 추천',
    guide: '가입 가이드',
    price: '요금 비교',
    speed: '인터넷 속도',
    tv: 'IPTV',
    bundle: '결합상품',
    budget: '알뜰 인터넷',
    install: '인터넷 설치',
    switch: '통신사 변경',
    home: '주거형태별',
    device: '장비',
    trouble: '고장·AS',
    tools: '계산기',
  },
  B: { gift: '사은품', 'tv-cash': 'TV 결합 혜택', cash: '통신사별 현금 지원' },
}
export const eyebrowOf = (path: string) => EYEBROW[SITE_KEY][path.split('/')[1] ?? ''] ?? ''

/** openGraph — 규칙 6. 페이지에서 정의하면 루트 값이 통째로 덮이므로 type·locale 을 여기서 전부 채운다 */
export function og(title: string, description: string, path: string, article?: { published?: string; modified?: string }) {
  const base = ogBase(title, description, path)
  if (!article) return { ...base, type: 'website' as const }
  return {
    ...base,
    type: 'article' as const,
    ...(article.published ? { publishedTime: isoDate(article.published) } : {}),
    ...(article.modified ? { modifiedTime: isoDate(article.modified) } : {}),
  }
}

function ogBase(title: string, description: string, path: string) {
  return {
    locale: 'ko_KR',
    title,
    description,
    url: path,
    ...(SITE_NAME ? { siteName: SITE_NAME } : {}),
    ...(OG_IMAGE ? { images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }] } : {}),
  }
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}
