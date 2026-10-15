import LeadForm from './LeadForm'
import Mascot from './Mascot'

/**
 * 히어로 상담 폼 — 말풍선 + 깔두(손 흔들기) + 번호 하나 받는 폼. 모든 페이지 히어로 오른쪽(모바일은 리드 아래).
 *
 * ⚠️ section#hero 안이라 <p> 를 쓰지 않는다 — 감사 [8] 이 히어로 문단을 리드 1개로 센다(폼 안내 문구도 div).
 * ⚠️ 금액·지원금 약속 금지(사이트 B 공용). 문구는 "번호만 → 상담원 연결" 사실만.
 */
export default function HeroLead() {
  return (
    <div className="hero-lead-box">
      <div className="hero-talk">
        <div className="hero-bubble">
          <b>전화번호</b>만 남겨 주시면 <b>전문 상담원이 바로 연결</b>해 드립니다. 내 조건에 맞는 통신사, 속 시원하게 알려 드릴게요!
        </div>
        <Mascot pose="wave" className="hero-talk-mascot" eager />
      </div>
      <LeadForm />
    </div>
  )
}
