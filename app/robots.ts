import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * robots.txt — Disallow 를 두지 않는다(비공개 영역·필터 중복 URL 없음).
 * 나중에 Disallow 를 넣으면 아래 **모든** 그룹에 같이 넣을 것 — 이름이 명시된 그룹이 있으면 그 봇은 `*` 그룹을 무시한다.
 * AI 크롤러 전용 파일(llms.txt 등)은 만들지 않는다(규칙 36). 허용은 robots.txt 로만 한다.
 */

/** AI 검색·답변 크롤러 — `*` 로도 허용되지만, 사이트를 막는 기본 설정이 많아 명시해 둔다 */
const AI_BOTS = [
  // OpenAI — 학습 · ChatGPT 검색 · 사용자 요청
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google Gemini · Apple Intelligence 학습 허용 토큰
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  // Meta · Amazon · DuckDuckGo · Mistral · Common Crawl
  'meta-externalagent',
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      // 네이버(Yeti)·다음 — `*` 로도 커버되지만 국내 타겟임을 명시
      { userAgent: ['Yeti', 'Daumoa', 'NaverBot'], allow: '/' },
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

export const dynamic = 'force-static'
