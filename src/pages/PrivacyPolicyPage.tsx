import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * 隱私權政策
 * 依《個人資料保護法》第 8 條告知事項撰寫，內容需與網站實際蒐集行為一致；
 * 新增表單欄位、第三方服務或行銷活動時，請同步更新本頁與「最後更新日期」。
 */

const LAST_UPDATED = '2026 年 9 月 22 日';
const CONTACT_EMAIL = 'service@nexdo.tw';
const CONTACT_PHONE = '02-7755-0920';
const LINE_URL = 'https://line.me/R/ti/p/@021souxl';

type Section = { id: string; title: string; body: React.ReactNode };

const sections: Section[] = [
  {
    id: 'scope',
    title: '一、適用範圍',
    body: (
      <>
        <p>
          本隱私權政策適用於您使用好齡居 NEXDO（以下稱「好齡居」或「我們」）官方網站 www.nexdo.tw（以下稱「本網站」），以及透過本網站提供之預約、諮詢、購物、會員與付款等服務時，我們對您個人資料之蒐集、處理及利用。
        </p>
        <p>
          本網站內可能連結至其他網站（例如 LINE、Facebook、Instagram、YouTube、合作夥伴網站或綠界科技付款頁面），各該網站之個人資料處理方式依其自身隱私權政策辦理，不適用本政策。
        </p>
      </>
    ),
  },
  {
    id: 'purpose',
    title: '二、蒐集目的',
    body: (
      <>
        <p>我們依《個人資料保護法》及相關法令，於下列特定目的範圍內蒐集您的個人資料：</p>
        <ul>
          <li>提供居家整理、居家安全、居家改善、房屋出租管理、健康促進等服務之諮詢、預約、到府評估與服務執行（契約、類似契約或其他法律關係事務）。</li>
          <li>會員帳號之註冊、登入、身分確認與會員服務管理。</li>
          <li>訂單成立、付款、開立憑證、退換貨、客訴處理與售後服務（消費者、客戶管理與服務）。</li>
          <li>以電子郵件、電話、簡訊或 LINE 通知訂單、預約與服務進度。</li>
          <li>網站使用情形統計與分析、網站功能改善及資訊安全維護。</li>
          <li>經您同意後，寄送活動、講座與服務資訊（行銷）。</li>
          <li>依法令規定或配合主管機關、司法機關之要求辦理。</li>
        </ul>
      </>
    ),
  },
  {
    id: 'categories',
    title: '三、蒐集之個人資料類別',
    body: (
      <>
        <p>依您使用的服務不同，我們可能蒐集下列資料：</p>
        <ul>
          <li><strong>識別類資料：</strong>姓名、電話、電子郵件、服務地址、LINE ID、會員帳號。</li>
          <li><strong>緊急聯絡資料：</strong>您於下單或預約時提供之緊急聯絡人姓名與電話。</li>
          <li><strong>服務需求資料：</strong>您於表單中填寫的需求說明、居住狀況、房屋資訊、特殊需求與其他您主動提供之內容。</li>
          <li><strong>交易資料：</strong>訂單內容、金額、付款方式、交易編號與付款狀態。信用卡等付款資料由綠界科技（ECPay）於其付款頁面直接處理，本網站不會取得或儲存您的完整信用卡號碼、有效期限及安全碼。</li>
          <li><strong>網站使用資料：</strong>IP 位址、瀏覽器與裝置類型、瀏覽頁面、停留時間、來源網址等，由 Cookie 及分析工具自動蒐集。</li>
        </ul>
        <p>
          請避免在表單或訊息中提供與服務無關的敏感資料（例如病歷、身分證統一編號、銀行帳號）。若服務需要了解長輩身體狀況，我們僅會請您提供執行服務所必要的範圍。
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: '四、利用期間、地區、對象及方式',
    body: (
      <>
        <p><strong>期間：</strong>自蒐集時起，至蒐集之特定目的消失為止；惟依法令須保存者（例如《商業會計法》規定會計憑證保存 5 年、帳簿及財務報表保存 10 年），或因執行業務、處理爭議所必須者，依其較長期間保存。期間屆滿後，我們將刪除、停止處理利用或以無法識別特定個人之方式處理。</p>
        <p><strong>地區：</strong>中華民國境內，以及下列服務供應商之伺服器所在地區（可能位於境外）。</p>
        <p><strong>對象：</strong>好齡居及為完成上述目的而受委託之對象，包括：</p>
        <ul>
          <li>實際到府提供服務之合作廠商、專業人員及安心顧問（僅提供執行該次服務所需資料）。</li>
          <li>綠界科技股份有限公司（金流付款處理）。</li>
          <li>Supabase（資料庫與會員帳號服務）、Vercel（網站主機服務）、Resend（通知信件寄送服務）。</li>
          <li>Google（Google Analytics／Google Tag Manager 網站流量分析）。</li>
          <li>依法令有權調閱之主管機關或司法機關。</li>
        </ul>
        <p><strong>方式：</strong>以自動化機器或其他非自動化之方式，於上述目的範圍內蒐集、處理、利用及國際傳輸。我們不會出售、出租您的個人資料，亦不會提供給與上述目的無關之第三人。</p>
      </>
    ),
  },
  {
    id: 'cookie',
    title: '五、Cookie 與網站分析',
    body: (
      <>
        <p>本網站使用 Cookie 及瀏覽器本機儲存（localStorage）以提供下列功能：</p>
        <ul>
          <li><strong>必要功能：</strong>維持登入狀態、購物車內容、網站設定快取。</li>
          <li><strong>偏好設定：</strong>記住您選擇的字級大小（A／A+）。</li>
          <li><strong>AI 助理「好好」：</strong>對話內容僅保存在您自己的瀏覽器中，用於延續對話，不會上傳至我們的伺服器。</li>
          <li><strong>流量分析：</strong>透過 Google Tag Manager 與 Google Analytics 了解網站使用情形，以改善內容與服務。相關資料以統計方式呈現，不用於識別特定個人。</li>
        </ul>
        <p>
          您可以在瀏覽器設定中拒絕或刪除 Cookie，或安裝 Google 提供的「Google Analytics 停用瀏覽器外掛程式」。拒絕 Cookie 可能使部分功能（例如登入、購物車）無法正常運作。
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: '六、資料安全與外洩通報',
    body: (
      <>
        <p>
          我們採取合理之技術及管理措施保護您的個人資料，包括全站 HTTPS 加密傳輸、資料庫存取權限控管、後台帳號權限分級，並僅授權因業務需要之人員存取。
        </p>
        <p>
          如發生個人資料被竊取、洩漏、竄改或其他侵害事故，我們將立即採取應變措施，並依《個人資料保護法》及主管機關規定，以適當方式通知受影響之當事人，並向主管機關通報。
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: '七、您的權利與行使方式',
    body: (
      <>
        <p>依《個人資料保護法》第 3 條，您就您的個人資料享有下列權利，且不得預先拋棄或以特約限制：</p>
        <ol>
          <li>查詢或請求閱覽。</li>
          <li>請求製給複製本。</li>
          <li>請求補充或更正。</li>
          <li>請求停止蒐集、處理或利用。</li>
          <li>請求刪除。</li>
        </ol>
        <p>
          您可登入會員中心自行修改部分資料，或透過本政策第十一條之聯絡方式提出申請。為保護您的資料，我們將先確認申請人身分。查詢、閱覽或製給複製本之請求，我們將於 15 日內回覆；補充、更正、停止或刪除之請求，將於 30 日內處理；必要時得延長並以書面告知原因。製給複製本時，得依法酌收必要成本費用。
        </p>
        <p>
          如您請求停止利用或刪除，而該資料為履行契約、處理爭議或依法令須保存者，我們將於說明原因後依法保存至期間屆滿。
        </p>
      </>
    ),
  },
  {
    id: 'not-provide',
    title: '八、不提供個人資料之影響',
    body: (
      <p>
        您可自由選擇是否提供個人資料。惟若您未提供表單中標示為必填之資料，或提供之資料不正確，我們可能無法與您聯繫、確認預約、完成訂單、安排到府服務或提供會員功能。
      </p>
    ),
  },
  {
    id: 'marketing',
    title: '九、行銷資訊',
    body: (
      <p>
        我們僅在您同意後，才會寄送活動、講座或服務推薦等行銷資訊。您可隨時透過信件中的說明或本政策之聯絡方式表示拒絕，我們將停止寄送。訂單、預約與服務進度等交易必要通知，不屬於行銷資訊。
      </p>
    ),
  },
  {
    id: 'minors',
    title: '十、未成年人',
    body: (
      <p>
        本網站服務主要提供成年人使用。未成年人使用本網站或提供個人資料前，應經法定代理人同意。
      </p>
    ),
  },
  {
    id: 'contact',
    title: '十一、聯絡我們',
    body: (
      <>
        <p>如您對本政策或個人資料處理有任何疑問，或欲行使前述權利，歡迎與我們聯繫：</p>
        <ul>
          <li>電子郵件：<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
          <li>客服電話：<a href={`tel:${CONTACT_PHONE.replace(/-/g, '')}`}>{CONTACT_PHONE}</a></li>
          <li>LINE 官方帳號：<a href={LINE_URL} target="_blank" rel="noopener noreferrer">@021souxl</a></li>
        </ul>
      </>
    ),
  },
  {
    id: 'changes',
    title: '十二、政策修訂',
    body: (
      <p>
        我們將因應法令修正、服務內容調整或技術變更，不定期修訂本政策，修訂後內容將公布於本頁並更新最後更新日期。如有重大變更，我們將於網站公告或以電子郵件通知您。
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-policy bg-[#FFF9EF] pt-28 pb-12 md:pt-32 md:pb-16">
      <Helmet>
        <title>隱私權政策｜好齡居 NEXDO</title>
        <meta name="description" content="好齡居 NEXDO 如何蒐集、處理及利用您的個人資料，以及您依個人資料保護法享有的權利。" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <header className="mb-8">
          <h1 className="font-bold text-[#00464B] mb-3">隱私權政策</h1>
          <p className="text-stone-600">
            好齡居重視您與家人的隱私。本政策說明我們如何蒐集、處理及利用您的個人資料，以及您可以如何行使您的權利。
          </p>
          <p className="text-sm text-stone-500 mt-2">最後更新日期：{LAST_UPDATED}</p>
        </header>

        <nav aria-label="目錄" className="bg-white rounded-2xl p-5 mb-8 border border-stone-200">
          <p className="font-bold text-[#00464B] mb-2">目錄</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-stone-700 hover:text-[#EB5514]">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="bg-white rounded-2xl p-6 md:p-10 border border-stone-200 space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-bold text-[#00464B] mb-4">{s.title}</h2>
              <div className="privacy-body space-y-3 text-stone-700 leading-relaxed">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
