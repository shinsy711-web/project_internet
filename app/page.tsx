import type { Metadata } from 'next'
import RoutePage, { metadataFor } from '@/components/RoutePage'

export const metadata: Metadata = metadataFor('/')

export default function Home() {
  return <RoutePage path="/" />
}
