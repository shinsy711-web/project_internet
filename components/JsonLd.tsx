/**
 * JSON-LD 주입. `next/script` 로 바꾸지 말 것 — App Router 에서 <Script type="application/ld+json"> 은
 * 서버 HTML 에 실제 태그가 아니라 `self.__next_s.push(...)` 로만 나가서 네이버 크롤러와 검증 도구가 못 본다.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
