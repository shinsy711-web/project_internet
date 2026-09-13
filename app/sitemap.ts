import type { MetadataRoute } from 'next'
import { isReady, loadDoc } from '@/lib/content'
import { SITE_PAGES, absUrl } from '@/lib/site'

/**
 * sitemap.xml — **공개 가능(isReady) 페이지만.** 원고 대기 페이지는 noindex 라 넣지 않는다.
 * ⚠️ `lastModified: new Date()` 금지 — 날짜는 원고 프런트매터 `updated` 에서만.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_PAGES.flatMap((p) => {
    const doc = loadDoc(p.path)
    if (!doc || !isReady(doc)) return []
    return [{ url: absUrl(p.path), ...(doc.updated ? { lastModified: doc.updated } : {}) }]
  })
}

export const dynamic = 'force-static'
