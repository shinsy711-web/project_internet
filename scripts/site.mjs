/**
 * 사이트 B(현금·사은품 위성) 실행기 — 같은 코드를 NEXT_PUBLIC_SITE=B 로 돌린다.
 *
 *   node scripts/site.mjs B dev     개발 서버
 *   node scripts/site.mjs B build   → out-b/
 *   node scripts/site.mjs B check   → out-b/ + 규칙 감사
 *
 * next build 는 out/ 을 지우고 다시 만든다. A 산출물(out/)은 B 빌드 동안 out-a.tmp/ 로 비켜 두었다가 되돌린다.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, renameSync, rmSync } from 'node:fs'

const site = (process.argv[2] || 'A').toUpperCase()
const cmd = process.argv[3] || 'build'
const env = { ...process.env, NEXT_PUBLIC_SITE: site }
const sh = (command) => spawnSync(command, { stdio: 'inherit', env, shell: true }).status ?? 1

if (cmd === 'dev') process.exit(sh('npx next dev'))

const outDir = site === 'B' ? 'out-b' : 'out'
const park = site === 'B' && existsSync('out')
if (park) {
  rmSync('out-a.tmp', { recursive: true, force: true })
  renameSync('out', 'out-a.tmp')
}

let code = sh('npx next build')

if (site === 'B') {
  rmSync('out-b', { recursive: true, force: true })
  if (existsSync('out')) renameSync('out', 'out-b')
}
if (park) renameSync('out-a.tmp', 'out')

if (code === 0 && cmd === 'check') code = sh(`node scripts/rules-audit.mjs ${outDir}`)
process.exit(code)
