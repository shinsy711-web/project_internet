import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import JsonLd from '@/components/JsonLd'
import { orgGraph } from '@/lib/jsonld'
import { GA_ID, GOOGLE_VERIFICATION, HEADER_NAV, LOGO_IMAGE, NAVER_VERIFICATION, SITE_KEY, SITE_NAME, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(SITE_NAME ? { applicationName: SITE_NAME, publisher: SITE_NAME } : {}),
  // 규칙 39 — robots 메타를 전 페이지에. 원고 대기 페이지는 RoutePage 에서 noindex 로 덮는다
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  formatDetection: { telephone: false, date: false, address: false, email: false },
  // favicon.ico(16·32·48) — 네이버 검색결과·구형 브라우저는 /favicon.ico 를 먼저 찾는다. 512 PNG 는 고해상도용
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: LOGO_IMAGE, type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    ...(NAVER_VERIFICATION ? { other: { 'naver-site-verification': NAVER_VERIFICATION } } : {}),
    ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const org = orgGraph()

  return (
    // suppressHydrationWarning — 브라우저 확장(GA 차단 등)이 <html> 에 속성을 붙여 생기는 개발 경고만 끈다. 이 태그의 속성에만 적용된다
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Organization 은 루트에서 1회만 (규칙 27) */}
        {org && <JsonLd data={org} />}
        {/* NaverBot · Yeti 전용 메타를 두지 않는다 — 봇 이름 메타는 robots 메타보다 우선해서, "all" 로 박아 두면 noindex 페이지(원고 대기 · 404)가 네이버에 색인된다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      {/* data-site — 감사 스크립트가 사이트 B 전용 규칙(금액 표기 금지)을 켤 때 본다 */}
      <body data-site={SITE_KEY}>
        <a href="#content" className="skip-link">
          본문 바로가기
        </a>
        <Header nav={HEADER_NAV} siteName={SITE_NAME} />
        <main id="content" tabIndex={-1}>
          {children}
        </main>
        <Footer />

        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
