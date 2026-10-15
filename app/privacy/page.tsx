import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { GA_ID, LEAD, OPERATOR, PRIVACY, PRIVACY_PATH, brandTitle, formatDate, og } from '@/lib/site'

/**
 * 개인정보 처리방침 — 사이트 A · B 공통(둘 다 같은 상담 폼을 쓴다). 푸터와 동의서 모달(PrivacyDialog)이 링크한다.
 *
 * - **폼이 실제로 보내는 것만 적는다**(components/LeadFormClient.tsx submit) — 폼 필드나 동의서 모달을 바꾸면 여기도 고칠 것.
 * - 수집 주체 · 제공받는 자 · 보호책임자 · 수탁자 · 시행일은 lib/site.ts(LEAD · OPERATOR · PRIVACY). 비어 있으면 자리 막대 + noindex.
 * - 원고 페이지가 아니다 — SITE_PAGES · sitemap 에 없고, 규칙 감사(scripts/rules-audit.mjs SKIP_DIRS)도 건너뛴다.
 * - 법무 검토 전.
 */

const TITLE = '개인정보 처리방침 안내'
const H1 = '개인정보 처리방침'
const DESCRIPTION = '상담 신청 과정에서 수집하는 개인정보 항목과 이용 목적, 보유 기간, 제3자 제공, 이용자 권리와 행사 방법을 안내합니다.'

const READY = Boolean(LEAD.collector && (!LEAD.thirdParty || LEAD.recipient) && PRIVACY.officer && PRIVACY.contact && PRIVACY.processors && PRIVACY.effective)

export const metadata: Metadata = {
  title: brandTitle(TITLE),
  description: DESCRIPTION,
  alternates: { canonical: PRIVACY_PATH },
  openGraph: og(TITLE, DESCRIPTION, PRIVACY_PATH),
  ...(READY ? {} : { robots: { index: false, follow: true } }),
}

const Blank = () => <span className="sk is-inline" style={{ width: '7rem' }} aria-hidden="true" />

function Rows({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return (
    <div className="privacy-rows">
      {rows.map(([label, value]) => (
        <div className="privacy-row" key={label}>
          <b>{label}</b>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id}>
      <div className="container">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  const collector = LEAD.collector || <Blank />
  const recipient = LEAD.recipient || <Blank />
  const mail = OPERATOR.email ? <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a> : <Blank />

  return (
    <article>
      <section id="hero" className="hero">
        <div className="container">
          <h1>{H1}</h1>
          <p className="hero-lead">
            {collector}(이하 &lsquo;운영자&rsquo;)는 개인정보 보호법에 따라 이용자의 개인정보를 보호하고, 관련 고충을 신속하게 처리하기 위해 아래와 같이 처리방침을 두고 있습니다.
          </p>
        </div>
      </section>

      <Section id="purpose" title="1. 개인정보의 처리 목적">
        <p>운영자는 아래 목적으로만 개인정보를 처리하며, 목적이 바뀌면 별도의 동의를 받습니다.</p>
        <ul>
          <li>인터넷 가입·변경 상담 신청 접수와 상담 연락</li>
          <li>요금·가입 조건 안내</li>
          <li>문의 경로 확인과 중복 신청 방지</li>
        </ul>
      </Section>

      <Section id="items" title="2. 처리하는 개인정보 항목">
        <p>상담 신청 폼에는 휴대폰 번호 하나만 입력받습니다. 주민등록번호 같은 고유식별정보와 민감정보는 수집하지 않습니다.</p>
        <Rows
          rows={[
            ['필수', '휴대폰 번호'],
            ['자동 기록', '신청한 페이지의 주소와 제목, 동의 여부, 접속 IP, 브라우저 정보'],
          ]}
        />
        <p>만 14세 미만 아동의 개인정보는 수집하지 않습니다. 만 14세 미만이라면 보호자가 신청해 주세요.</p>
      </Section>

      <Section id="period" title="3. 개인정보의 처리 및 보유 기간">
        <p>접수일로부터 7일 동안 상담에 이용하고, 90일이 지나면 지체 없이 파기합니다. 그 전에 삭제를 요청하면 바로 파기합니다.</p>
        <p>관계 법령에 따라 보존해야 하는 경우에는 해당 법령에서 정한 기간 동안 보관합니다.</p>
      </Section>

      <Section id="third" title="4. 개인정보의 제3자 제공">
        {LEAD.thirdParty ? (
          <>
            <p>운영자는 이용자가 상담 신청 시 동의한 범위 안에서만 아래와 같이 개인정보를 제공합니다.</p>
            <Rows
              rows={[
                ['제공받는 자', recipient],
                ['제공 목적', '인터넷 가입 조건 안내 및 유선 상담'],
                ['제공 항목', '휴대폰 번호'],
                ['보유·이용 기간', '상담 목적 달성 시 즉시 파기 (최대 접수일로부터 90일)'],
              ]}
            />
            <p>그 밖에는 법령에 특별한 규정이 있거나 수사기관이 법령에 정해진 절차에 따라 요구하는 경우에만 제공합니다.</p>
          </>
        ) : (
          <>
            <p>운영자는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 접수된 상담은 운영자가 직접 진행합니다.</p>
            <p>법령에 특별한 규정이 있거나 수사기관이 법령에 정해진 절차에 따라 요구하는 경우에만 예외로 합니다.</p>
          </>
        )}
      </Section>

      <Section id="entrust" title="5. 개인정보 처리의 위탁">
        {PRIVACY.processors === null ? (
          <Rows rows={[['수탁자', <Blank key="b" />]]} />
        ) : PRIVACY.processors.length === 0 ? (
          <p>운영자는 개인정보 처리 업무를 외부에 위탁하지 않습니다. 위탁하게 되면 수탁자와 위탁 업무를 이 방침에 공개합니다.</p>
        ) : (
          <>
            <p>운영자는 원활한 업무 처리를 위해 아래와 같이 개인정보 처리 업무를 위탁하고, 수탁자가 개인정보를 안전하게 처리하도록 관리·감독합니다.</p>
            <Rows rows={PRIVACY.processors} />
          </>
        )}
      </Section>

      <Section id="destroy" title="6. 개인정보의 파기 절차와 방법">
        <p>보유 기간이 지났거나 처리 목적을 달성한 개인정보는 지체 없이 파기합니다.</p>
        <ul>
          <li>전자 파일 — 복구할 수 없는 방법으로 영구 삭제합니다</li>
          <li>종이 문서 — 분쇄하거나 소각합니다</li>
        </ul>
      </Section>

      <Section id="rights" title="7. 이용자의 권리와 행사 방법">
        <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지, 동의 철회를 요구할 수 있습니다. 법정대리인이나 위임받은 대리인을 통해서도 할 수 있습니다.</p>
        <p>요청은 아래 연락처로 받으며, 운영자는 요청을 받은 날부터 10일 이내에 조치하고 결과를 알려 드립니다.</p>
        <Rows rows={[['요청 접수', mail]]} />
      </Section>

      <Section id="safety" title="8. 개인정보의 안전성 확보 조치">
        <ul>
          <li>개인정보를 다루는 인원을 상담에 필요한 최소한으로 제한합니다</li>
          <li>개인정보가 저장된 시스템의 접근 권한을 관리합니다</li>
          <li>상담 신청 정보는 암호화된 구간(HTTPS)으로 전송합니다</li>
        </ul>
      </Section>

      <Section id="cookie" title="9. 자동 수집 장치의 설치·운영과 거부">
        {GA_ID ? (
          <>
            <p>운영자는 방문 통계를 내기 위해 Google Analytics를 사용하며, 이 과정에서 쿠키가 브라우저에 저장됩니다. 쿠키로 개인을 식별하지 않습니다.</p>
            <p>브라우저 설정에서 쿠키 저장을 거부할 수 있으며, 거부해도 상담 신청을 포함한 사이트 이용에는 제한이 없습니다.</p>
          </>
        ) : (
          <p>운영자는 이용자의 이용 정보를 저장하고 불러오는 쿠키를 설치하지 않습니다.</p>
        )}
      </Section>

      <Section id="officer" title="10. 개인정보 보호책임자">
        <p>개인정보 처리에 관한 문의, 불만 처리, 피해 구제는 아래 책임자에게 요청할 수 있습니다.</p>
        <Rows
          rows={[
            ['책임자', PRIVACY.officer || <Blank />],
            ['연락처', PRIVACY.contact || <Blank />],
          ]}
        />
      </Section>

      <Section id="remedy" title="11. 권익침해 구제 방법">
        <p>개인정보 침해로 인한 상담이나 구제가 필요하면 아래 기관에 문의할 수 있습니다.</p>
        <Rows
          rows={[
            ['분쟁조정', '개인정보분쟁조정위원회 · 1833-6972 · www.kopico.go.kr'],
            ['침해신고', '개인정보침해신고센터 · 118 · privacy.kisa.or.kr'],
            ['검찰', '대검찰청 · 1301 · www.spo.go.kr'],
            ['경찰', '경찰청 · 182 · ecrm.police.go.kr'],
          ]}
        />
      </Section>

      <Section id="change" title="12. 처리방침의 변경">
        <p>이 방침의 내용이 바뀌면 시행 7일 전부터 이 페이지에 알립니다.</p>
        <Rows rows={[['시행일', PRIVACY.effective ? <time dateTime={PRIVACY.effective}>{formatDate(PRIVACY.effective)}</time> : <Blank />]]} />
      </Section>
    </article>
  )
}
