import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RoutePage, { metadataFor } from '@/components/RoutePage'
import { SITE_PAGES, isPage } from '@/lib/site'

/** 홈을 뺀 이번 빌드 사이트(A 또는 B)의 전 페이지. 경로는 lib/pages.ts 가 정한다 */
export function generateStaticParams() {
  return SITE_PAGES.filter((p) => p.path !== '/').map((p) => ({ slug: p.path.split('/').filter(Boolean) }))
}

export const dynamicParams = false

type Props = { params: Promise<{ slug: string[] }> }

const toPath = (slug: string[]) => `/${slug.join('/')}/`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = toPath((await params).slug)
  return isPage(path) ? metadataFor(path) : {}
}

export default async function Page({ params }: Props) {
  const path = toPath((await params).slug)
  if (!isPage(path)) notFound()
  return <RoutePage path={path} />
}
