/**
 * 규칙 감사 — 빌드 산출물의 실제 HTML 로 시트 규칙을 확인한다.
 *   content_seo_rules "콘텐츠규칙" (No 1~39) · h2_top20 "섹션유형 범례" · table_data_schema "⑤운영규칙"
 *
 *   FAIL      = 필수 위반 → exit 1
 *   WARN      = 권장 미달 → 표시만
 *   원고 대기 = data-scaffold 페이지. 하나라도 있으면 exit 1
 *
 * 원고 대기 페이지도 TITLE·H1·H2·표 구조는 시트 문구로 이미 나가므로 **구조 검사는 한다.**
 * 글자수 검사(리드·정의·표 요약)는 원고가 들어간 섹션(data-sk 가 없는 섹션)에만 한다. 글자수는 공백 포함.
 *
 * 사용: npm run check (A → out/) · npm run check:b (B → out-b/) · node scripts/rules-audit.mjs <폴더>
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const DIR = process.argv[2] ?? 'out'
const OUT = join(process.cwd(), DIR)
if (!existsSync(OUT)) {
  console.error(`${DIR}/ 이 없습니다. 빌드를 먼저 실행하세요.`)
  process.exit(1)
}

// Next 16 + output:'export' 는 404 를 404.html · 404/ · _not-found/ 로 낸다
const SKIP_DIRS = new Set(['_next', '404', '_not-found'])

function collect(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) collect(full, acc)
    } else if (name === 'index.html') acc.push(full)
  }
  return acc
}

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
const strip = (h) =>
  decode(h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
const len = (s) => [...s].length
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1]
const meta = (html, key, val) => {
  const tag = (html.match(new RegExp(`<meta[^>]*\\s${key}="${val}"[^>]*>`)) || [])[0]
  return tag ? decode(attr(tag, 'content') ?? '') : null
}
const outOf = (n, lo, hi) => n < lo || n > hi

const SCHEMA_ALLOWED = new Set(['Organization', 'Article', 'BreadcrumbList'])
const SCHEMA_RULE = { FAQPage: 28, HowTo: 29, Product: 30, ItemList: 30, Table: 30 }

const files = collect(OUT)
const reports = new Map()
const titles = new Map()
const site = { domain: false, brand: false, disclaimer: false, key: 'A' }

for (const file of files) {
  const url = '/' + relative(OUT, file).split(sep).join('/').replace(/index\.html$/, '')
  const html = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  const r = { fails: [], warns: [], scaffold: html.includes('data-scaffold="true"') }
  reports.set(url, r)
  const F = (no, msg) => r.fails.push(`[${no}] ${msg}`)
  const W = (no, msg) => r.warns.push(`[${no}] ${msg}`)

  // ── 사이트 공통 ──
  if (/<body[^>]*\sdata-site="B"/.test(html)) site.key = 'B'
  const canonicalTag = (html.match(/<link[^>]*rel="canonical"[^>]*>/) || [])[0]
  if (canonicalTag && /\/\/(localhost|127\.0\.0\.1)/.test(attr(canonicalTag, 'href') ?? '')) site.domain = true
  if (!meta(html, 'property', 'og:site_name')) site.brand = true
  if (html.includes('data-disclaimer-missing="true"')) site.disclaimer = true

  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ?? '').trim()
  const articleTag = (html.match(/<article\b[^>]*>/) || [])[0] ?? ''
  const article = (html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/) || [])[1] ?? ''
  // 본문 링크 — 헤더·푸터·경로 표시(<article> 밖)는 세지 않는다
  r.links = [...article.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*)/g)].map((m) => (m[1].endsWith('/') ? m[1] : `${m[1]}/`))

  // ── TITLE · H1 ──
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]
  if (h1s.length !== 1) F(3, `h1 이 ${h1s.length}개`)
  const h1 = h1s[0] ? strip(h1s[0][1]) : ''

  if (!title) F(7, 'title 없음')
  else {
    if (h1 && title === h1) F(1, `title 과 h1 이 완전히 같음 — "${title}"`)
    const tokens = title
      .toLowerCase()
      .split(/[\s|·,:/\-–—]+/)
      .map((t) => t.replace(/[?？!.]+$/, '').replace(/^(.{2,})란$/, '$1'))
      .filter((t) => len(t) >= 2)
    const dup = [...new Set(tokens.filter((t, i) => tokens.indexOf(t) !== i))]
    if (dup.length) F(4, `title 에 같은 키워드 반복: ${dup.join(', ')} — "${title}"`)
    if (len(title) > 25) W(5, `title ${len(title)}자 (목표 22~25자, 모바일 20자)`)
    titles.set(title, [...(titles.get(title) ?? []), url])
  }
  if (!meta(html, 'property', 'og:title')) F(6, 'og:title 없음')
  if (!meta(html, 'property', 'og:description')) F(6, 'og:description 없음')
  if (!canonicalTag) F(39, 'canonical 없음')
  if (meta(html, 'name', 'robots') === null) F(39, 'robots 메타 없음')

  // ── 섹션 구조 ──
  const sections = [...article.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)].map((m) => ({
    id: attr(' ' + m[1], 'id') ?? '',
    sk: /\sdata-sk="true"/.test(' ' + m[1]),
    inner: m[2],
  }))

  const hero = sections.find((s) => s.id === 'hero')
  if (!hero) F(8, '히어로 section 없음')
  else {
    if (!/<\/h1>\s*<p class="hero-lead"/.test(hero.inner)) F(8, 'h1 바로 아래 리드 문단이 없음')
    const heroPs = (hero.inner.match(/<p\b/g) ?? []).length
    if (heroPs > 1) F(8, `히어로 안 문단이 ${heroPs}개 (리드 1개만)`)
    const lead = strip((hero.inner.match(/<p class="hero-lead">([\s\S]*?)<\/p>/) || [])[1] ?? '')
    if (!hero.sk && outOf(len(lead), 150, 200)) W('범례 히어로', `리드 문단 ${len(lead)}자 (150~200자)`)
  }

  for (const s of sections) {
    if (s.id === 'hero') continue
    if (!/^\s*<div class="container">\s*<h2\b/.test(s.inner)) {
      F(9, `section#${s.id || '(id 없음)'} 이 container > h2 로 시작하지 않음`)
      continue
    }
    const afterH2 = s.inner.replace(/^[\s\S]*?<\/h2>\s*/, '')
    if (!/^<p\b/.test(afterH2) && !/^(faq|related)/.test(s.id) && !/<ul\b/.test(afterH2.slice(0, 40)))
      W(9, `section#${s.id} 의 h2 다음이 p 가 아님`)
  }
  if (!sections.some((s) => s.id === 'apply')) F('범례 CTA', '상담 section(#apply) 없음')

  // ── 비교 섹션 ──
  const tableSections = sections.filter((s) => s.inner.includes('<table'))
  if (attr(articleTag, 'data-compare') === 'true' && tableSections.length === 0) F(13, '비교표 섹션이 있는데 <table> 이 없음')

  for (const s of tableSections) {
    const summary = s.inner.match(/<\/h2>\s*<p\b[^>]*>([\s\S]*?)<\/p>[\s\S]*?<div class="table-wrap"/)
    if (!summary) F(16, `section#${s.id} 표 위 요약 문단 없음`)
    else if (!s.sk && outOf(len(strip(summary[1])), 150, 200)) F(16, `section#${s.id} 표 위 요약 ${len(strip(summary[1]))}자 (150~200자)`)
    if (!/<p\b/.test(s.inner.split('</table>').pop() ?? '')) F(16, `section#${s.id} 표 아래 해설 문단 없음`)
    if (/<img\b/.test(s.inner)) F(17, `section#${s.id} 비교 섹션에 이미지 — 비교값은 텍스트로`)
    if (/<div class="table-wrap" data-pending="true"/.test(s.inner)) W('운영2', `section#${s.id} 표 값이 전부 '확인 중' (미검증 데이터)`)

    for (const [, t] of s.inner.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)) {
      const caption = strip((t.match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/) || [])[1] ?? '')
      if (!/<caption\b/.test(t)) W(14, `section#${s.id} caption 없음`)
      else if (!s.sk && !/기준|수집|확인|출처/.test(caption)) W('운영4', `section#${s.id} caption 에 갱신일·출처 없음`)
      if (!/<thead\b/.test(t) || !/<th scope="col"/.test(t)) W(14, `section#${s.id} thead / th scope=col 없음`)
      if (!/<th scope="row"/.test(t)) W(14, `section#${s.id} th scope=row 없음`)
      const rows = [...t.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)]
      const cols = rows[0] ? (rows[0][1].match(/<t[hd]\b/g) ?? []).length : 0
      if (outOf(rows.length - 1, 3, 8) || outOf(cols, 2, 5)) W(15, `section#${s.id} 표 ${rows.length - 1}행×${cols}열 (기준 5×3 부근)`)
      for (const [, c] of t.matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)) {
        const v = strip(c)
        if (len(v) > 25) F(15, `section#${s.id} 셀 ${len(v)}자 — "${v.slice(0, 22)}…"`)
        else if (v && v.split(/\s+/).length > 3) W(15, `section#${s.id} 셀 ${v.split(/\s+/).length}단어 — "${v}"`)
      }
    }
  }

  // ── 정의 ──
  for (const d of sections.filter((s) => /^define(-\d+)?$/.test(s.id))) {
    const h2 = strip((d.inner.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/) || [])[1] ?? '')
    if (!/란\s*[?？]$/.test(h2)) {
      W(23, `정의 유형인데 h2 가 "~란?" 질문형이 아님 — "${h2}" (시트 설계 확인)`)
      continue
    }
    const p = d.inner.match(/<\/h2>\s*<p\b[^>]*>([\s\S]*?)<\/p>/)
    if (!p) F(23, `정의 섹션 "${h2}" 바로 아래 p 없음`)
    else if (!d.sk && outOf(len(strip(p[1])), 150, 200)) F(25, `정의 문단 ${len(strip(p[1]))}자 (150~200자, 첫 문장이 답)`)
  }
  if (!sections.some((s) => s.id === 'faq')) W(33, 'FAQ 섹션 없음')
  if (/<dl\b/.test(html)) F(24, '<dl> 사용')

  // ── 운영규칙 1 · 사이트 B ──
  const mdTables = attr(articleTag, 'data-md-table')
  // 원고(content_manuscripts)가 표를 숫자째 쓰고 있다 — plans.csv / data/ 연동 전까지는 WARN 으로 표시만
  if (mdTables) W('운영1', `원고 표 ${mdTables}개에 숫자 직접 기입 — data/·plans.csv 연동 전`)
  if (site.key === 'B') {
    const money = strip(article).match(/\d[\d,]*\s*만?\s*원(?![가-힣])/)
    if (money) F('B 금액', `사이트 B 본문에 금액 표기 — "${money[0]}" (KAIT 가이드라인 위반 표시·광고)`)
  }

  // ── 구조화 데이터 ──
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data
    try {
      data = JSON.parse(json)
    } catch {
      F(31, 'JSON-LD 파싱 실패')
      continue
    }
    for (const node of data['@graph'] ?? [data]) {
      const types = [].concat(node['@type'] ?? [])
      for (const t of types) {
        if (SCHEMA_ALLOWED.has(t)) continue
        if (SCHEMA_RULE[t] === 29) W(29, 'HowTo 스키마 — 네이버 타겟일 때만 예외')
        else F(SCHEMA_RULE[t] ?? 27, `허용되지 않은 스키마 ${t}`)
      }
      if (types.includes('Article') && node.headline !== h1) F(31, `Article.headline("${node.headline}") 이 화면 h1 과 다름`)
    }
  }

  // ── 권장 ──
  const h2Count = (article.match(/<h2\b/g) ?? []).length
  if (outOf(h2Count, 7, 15)) W(10, `h2 ${h2Count}개 (목표 7~15)`)
  const firstSub = (article.replace(/<h1\b[\s\S]*?<\/h1>/, '').match(/<h([23])\b/) || [])[1]
  if (firstSub === '3') W(11, 'h2 보다 h3 가 먼저 나옴')
  if (!r.scaffold) {
    for (const [, ul] of article.matchAll(/<ul(?![^>]*class="(?:related|link-row)")[^>]*>([\s\S]*?)<\/ul>/g)) {
      const items = [...ul.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => strip(m[1]))
      const total = items.reduce((a, b) => a + len(b), 0)
      if (items.length > 8 || total > 370) W(21, `목록 ${items.length}개 · ${total}자 (8개 / 370자 이내)`)
    }
    if (!/<time\b/.test(article)) W(35, '보이는 최종 수정일(<time>) 없음 — 원고 프런트매터 updated')
  }
}

// ── 사이트 전체 ──
for (const [t, urls] of titles) if (urls.length > 1) for (const u of urls) reports.get(u).fails.push(`[7] 같은 title: ${urls.join(', ')} — "${t}"`)

// 내부링크 고립 (규칙 9) — 공개 페이지끼리, 본문 링크만. 푸터 사이트맵으로만 닿는 페이지는 고립이다 (lib/links.ts 가 막는다)
const live = [...reports].filter(([, r]) => !r.scaffold).map(([u]) => u)
const liveSet = new Set(live)
const inbound = new Map(live.map((u) => [u, new Set()]))
for (const u of live) for (const t of reports.get(u).links) if (t !== u && liveSet.has(t)) inbound.get(t).add(u)
const reach = new Set(liveSet.has('/') ? ['/'] : [])
for (const q = [...reach]; q.length; ) {
  const c = q.shift()
  for (const t of reports.get(c).links) if (liveSet.has(t) && !reach.has(t)) reach.add(t), q.push(t)
}
for (const u of live) {
  if (u === '/') continue
  const r = reports.get(u)
  const n = inbound.get(u).size
  if (n === 0) r.fails.push('[9 고립] 다른 공개 페이지 본문에서 들어오는 링크 0개 (푸터로만 닿음)')
  else if (!reach.has(u)) r.fails.push('[9 고립] 홈에서 본문 링크만 따라가면 닿지 않음')
  else if (n < 2) r.warns.push(`[9] 본문 인바운드 링크 ${n}개 (2개 이상)`)
}

const siteFails = []
if (existsSync(join(OUT, 'llms.txt')) || existsSync(join(OUT, 'llms-full.txt'))) siteFails.push('[36] llms.txt 같은 AI 전용 파일을 만들지 않는다')
if (site.domain) siteFails.push('[배포] canonical 이 localhost — NEXT_PUBLIC_SITE_URL 확정 필요')
if (site.brand) siteFails.push(`[배포] 사이트 ${site.key} 브랜드명 미정 — lib/site.ts CONFIG.${site.key}.name`)
if (site.disclaimer) siteFails.push(`[배포] 사이트 ${site.key} 푸터 고지문 비어 있음 — lib/site.ts CONFIG.${site.key}.disclaimer`)

// ── 출력 ──
const scaffolds = [...reports].filter(([, r]) => r.scaffold).map(([u]) => u)
console.log(`\n규칙 감사 — 사이트 ${site.key} · ${DIR}/ · 페이지 ${files.length}개 (공개 가능 ${files.length - scaffolds.length} · 원고 대기 ${scaffolds.length})\n`)

for (const [url, r] of reports) {
  const tag = r.scaffold ? ' (원고 대기)' : ''
  if (!r.fails.length && !r.warns.length) {
    console.log(`  OK    ${url}${tag}`)
    continue
  }
  console.log(`  ${r.fails.length ? 'FAIL' : 'WARN'}  ${url}${tag}`)
  for (const f of r.fails) console.log(`        ✗ ${f}`)
  for (const w of r.warns) console.log(`        · ${w}`)
}

if (siteFails.length) {
  console.log('\n사이트 전체')
  for (const f of siteFails) console.log(`  ✗ ${f}`)
}

const pageFails = [...reports.values()].reduce((n, r) => n + r.fails.length, 0)
const pageWarns = [...reports.values()].reduce((n, r) => n + r.warns.length, 0)
console.log(`\n필수 위반 ${pageFails + siteFails.length}건 · 권장 미달 ${pageWarns}건 · 원고 대기 ${scaffolds.length}개`)
process.exit(pageFails + siteFails.length + scaffolds.length > 0 ? 1 : 0)
