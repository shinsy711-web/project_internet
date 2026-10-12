/**
 * 마스코트 '깔두'(안전모 쓴 두더지) — public/img/kkaldu_*.webp. 전부 장식이라 대체 텍스트를 비운다.
 *
 * - 글자·수치가 없는 그림만(규칙 37). **비교표 섹션에는 넣지 않는다** — 감사 [17] 이 표 섹션의 <img> 를 FAIL 로 잡는다.
 * - output:'export' 라 next/image 최적화가 없다. width·height 를 직접 줘서 자리(CLS)를 잡는다.
 */
const POSES = {
  basic: ['kkaldu_01_basic', 960, 1080],
  wave: ['kkaldu_02_wave', 960, 1080],
  lost: ['kkaldu_03_lost_404', 960, 1080],
  dig: ['kkaldu_04_digging_speedtest', 960, 1080],
  peek: ['kkaldu_05_peek_banner', 800, 528],
  face: ['kkaldu_06_face_icon', 512, 427],
} as const

export type MascotPose = keyof typeof POSES
export const mascotSrc = (pose: MascotPose) => `/img/${POSES[pose][0]}.webp`

export default function Mascot({ pose, className, eager = false }: { pose: MascotPose; className?: string; eager?: boolean }) {
  const [, width, height] = POSES[pose]
  return <img src={mascotSrc(pose)} alt="" aria-hidden="true" width={width} height={height} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}
