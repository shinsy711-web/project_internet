/**
 * 원고 동기화 — 데스크톱 원고 폴더 → content/
 *
 *   원본: CONTENT_SRC 환경변수, 없으면 C:/Users/PC/Desktop/content_manuscripts_71/content
 *   복사: site-a/ · site-b/ (통째로 새로 만든다) · README.md
 *
 * 원고는 원본 폴더에서 고치고, 빌드 전에 `npm run sync` 를 돌린다.
 * 배포 서버에는 원본 폴더가 없으므로 복사본(content/)을 저장소에 함께 둔다.
 */
import { cpSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const SRC = process.env.CONTENT_SRC || 'C:/Users/PC/Desktop/content_manuscripts_71/content'
const DEST = join(process.cwd(), 'content')

if (!existsSync(SRC)) {
  console.error(`원고 폴더가 없습니다: ${SRC}`)
  process.exit(1)
}

for (const name of ['site-a', 'site-b']) {
  const from = join(SRC, name)
  if (!existsSync(from)) continue
  rmSync(join(DEST, name), { recursive: true, force: true })
  cpSync(from, join(DEST, name), { recursive: true })
  console.log(`복사  ${name}/`)
}
if (existsSync(join(SRC, 'README.md'))) {
  cpSync(join(SRC, 'README.md'), join(DEST, 'README.md'))
  console.log('복사  README.md')
}
