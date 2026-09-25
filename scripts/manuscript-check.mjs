/**
 * 원고 파일 단위 검사 — 빌드 없이 규칙 16·25 를 원고에서 바로 본다.
 *
 *   규칙 16  표가 있는 H2 는 (1) H2 바로 다음 줄이 문단이고 그 길이가 150~200자,
 *            (2) 그 섹션 마지막 표 아래에 문단이 하나 더 있어야 한다.
 *   규칙 25  정의 섹션(`<!-- definition -->` 또는 "~란?")의 H2 바로 다음 문단이 150~200자.
 *
 * 글자수는 scripts/rules-audit.mjs 와 같은 기준 — 링크는 라벨만, 강조·코드 표시는 떼고 센다.
 * 표 바로 아래 *이탤릭* 한 줄은 <caption> 이 되므로 문단으로 세지 않는다.
 *
 * 사용: node scripts/manuscript-check.mjs content/site-a/sk/price.md …
 *       node scripts/manuscript-check.mjs content        (폴더면 하위 .md 전부)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const MIN = 150
const MAX = 200

const plain = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*([^*\s][^*]*)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
const len = (s) => [...plain(s)].length

/** 화면에서 <p> 로 나가는 줄인가 — 표·목록·제목·주석·인용은 아니다 */
const isParagraph = (t) => t && !/^([|\-#>]|\d+\.\s|<!--)/.test(t)

function sections(md) {
  const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const lines = body.split(/\r?\n/)
  const out = []
  let cur = null
  let type
  for (const raw of lines) {
    const t = raw.trim()
    if (/^-{3,}$/.test(t)) break // 본문 끝
    const comment = t.match(/^<!--\s*(.+?)\s*-->$/)
    if (comment) {
      type = comment[1]
      continue
    }
    if (/^##\s/.test(t)) {
      cur = { heading: t.slice(3).replace(/\s*\{#[^}]+\}\s*$/, '').trim(), type, lines: [] }
      out.push(cur)
      type = undefined
      continue
    }
    if (cur) cur.lines.push(t)
  }
  return out
}

function checkSection(s) {
  const issues = []
  const body = s.lines
  const firstIdx = body.findIndex(Boolean)
  const first = firstIdx === -1 ? '' : body[firstIdx]
  const hasTable = body.some((l) => l.startsWith('|'))
  const isDefinition = s.type === 'definition' || /란\s*[?？]$/.test(s.heading)

  if (hasTable || isDefinition) {
    if (!isParagraph(first)) issues.push(`H2 다음이 문단이 아님 (지금: ${first ? first.slice(0, 20) + '…' : '빈 줄'})`)
    else if (len(first) < MIN || len(first) > MAX) issues.push(`${hasTable ? '표 위 요약' : '정의 문단'} ${len(first)}자 → ${MIN}~${MAX}자`)
  }

  if (hasTable) {
    let lastTable = -1
    body.forEach((l, i) => {
      if (l.startsWith('|')) lastTable = i
    })
    const after = body.slice(lastTable + 1)
    // 표 바로 아래 이탤릭 한 줄은 caption 이라 문단이 아니다
    const rest = after.filter((l) => l && !/^\*[^*].*[^*]\*$/.test(l))
    if (!rest.some(isParagraph)) issues.push('표 아래 해설 문단 없음')
  }
  return issues
}

function collect(p, acc = []) {
  if (statSync(p).isDirectory()) {
    for (const n of readdirSync(p)) if (!n.startsWith('_')) collect(join(p, n), acc)
  } else if (p.endsWith('.md') && !p.endsWith('README.md')) acc.push(p)
  return acc
}

const targets = process.argv.slice(2).flatMap((p) => collect(p))
let total = 0
for (const file of targets) {
  const found = []
  for (const s of sections(readFileSync(file, 'utf8'))) {
    for (const i of checkSection(s)) found.push(`  ## ${s.heading} — ${i}`)
  }
  if (found.length) {
    console.log(`${file}  (${found.length}건)`)
    for (const f of found) console.log(f)
    total += found.length
  }
}
console.log(`\n합계 ${total}건 · 파일 ${targets.length}개`)
