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
import { manuscriptFor, manuscripts } from './manuscripts'
import { PAGES, type PageDef } from './pages'
import { SITE_KEY, type SiteKey } from './siteKey'

export { SITE_KEY, type SiteKey }

type SiteConfig = {
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
    name: '',
    disclaimer: '',
    ctaDockText: '',
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
    name: '',
    disclaimer: '',
    ctaDockText: '',
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
export const DISCLAIMER = cfg.disclaimer
export const CTA_DOCK_TEXT = cfg.ctaDockText

/**
 * 도메인 — 미정. A 는 NEXT_PUBLIC_SITE_URL, B 는 NEXT_PUBLIC_SITE_URL_B.
 * B 빌드(scripts/site.mjs)는 같은 .env.local 을 읽으므로 변수를 나누지 않으면 B 의 canonical·sitemap·robots 가 A 도메인을 가리킨다.
 * 비어 있으면 localhost 로 남고 감사 스크립트가 배포를 막는다.
 */
const SITE_URL_ENV = SITE_KEY === 'B' ? process.env.NEXT_PUBLIC_SITE_URL_B : process.env.NEXT_PUBLIC_SITE_URL
export const SITE_URL = (SITE_URL_ENV || 'http://localhost:3000').replace(/\/$/, '')

/** OG 는 JPEG 1200×630. 파일을 받으면 채운다. 비어 있으면 og:image 를 넣지 않는다 */
export const OG_IMAGE = ''

/** 검색엔진 소유확인 · GA — 값이 없으면 태그 자체를 렌더하지 않는다 (플레이스홀더 금지) */
export const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_VERIFICATION || ''
export const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ''
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

/** 운영 주체 — 확인된 값만. 빈 값은 푸터에서 줄 자체가 빠진다 */
export const OPERATOR = { name: '', email: '' }

/**
 * 상담 폼 — project21_db 공용 수집 서버(`/api/submit?api_key=`, project31 등과 같은 서버). 키는 사이트마다 sites 테이블에 등록해 받는다.
 *   collector  개인정보 수집 주체(운영 법인명) · recipient  제3자 제공받는 자 상호 — 동의 문구에 그대로 나간다
 * 엔드포인트·수집 주체·제공받는 자 중 하나라도 비면 폼은 "준비 중". 플레이스홀더 금지.
 */
export const LEAD = { collector: '', recipient: '', category: '인터넷' }
const DB_SUBMIT_URL = process.env.NEXT_PUBLIC_DB_SUBMIT_URL || ''
const DB_API_KEY = (SITE_KEY === 'B' ? process.env.NEXT_PUBLIC_DB_API_KEY_B : process.env.NEXT_PUBLIC_DB_API_KEY) || ''
export const LEAD_ENDPOINT = DB_SUBMIT_URL && DB_API_KEY ? `${DB_SUBMIT_URL}?api_key=${encodeURIComponent(DB_API_KEY)}` : ''
export const FORM_READY = Boolean(LEAD_ENDPOINT && LEAD.collector && LEAD.recipient)
export const CTA_LABEL = '상담 신청하기'

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
export function og(title: string, description: string, path: string) {
  return {
    type: 'website' as const,
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
