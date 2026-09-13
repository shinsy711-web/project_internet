/** @type {import('next').NextConfig} */
const nextConfig = {
  // 전 페이지 정적 생성 — 네이버 크롤러는 JS 를 거의 실행하지 않으므로 본문·표·FAQ 가 서버 HTML 에 있어야 한다.
  output: 'export',

  // 슬래시 표기를 내부링크 · canonical · sitemap 에서 한 가지로 맞춘다 (시트 URL 도 전부 슬래시로 끝난다).
  trailingSlash: true,

  images: { unoptimized: true },
}

export default nextConfig
