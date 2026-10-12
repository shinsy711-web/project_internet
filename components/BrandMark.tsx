import Mascot from './Mascot'

/** 브랜드 마크 — 마스코트 얼굴. 옆에 브랜드명(또는 자리 막대)이 있으므로 장식으로 숨긴다. 헤더 · 푸터 · 상담 모달 알림이 같이 쓴다 */
export default function BrandMark() {
  return <Mascot pose="face" className="h-8 w-auto shrink-0" eager />
}
