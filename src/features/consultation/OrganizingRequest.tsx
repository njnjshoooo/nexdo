import React, { useRef, useState } from 'react';
import { LINE_QUOTE_URL } from '../../data/organizingCatalog';
import { ORGANIZING_GOALS, ORGANIZING_PURPOSES } from './organizing';

export default function OrganizingRequest({ goal, purpose, choose }: { goal: string; purpose: string; choose: (key: string, value: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const requestId = useRef(crypto.randomUUID());
  const sending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true; setBusy(true); setError('');
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/organizing-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, goal, purpose, consent: fields.consent === 'on', requestId: requestId.current }),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok || !result.bookingId) throw new Error(result.error || '送出失敗，請稍後再試');
      setBookingId(result.bookingId);
      requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
    } catch (err) { setError(err instanceof Error && err.name !== 'TimeoutError' ? err.message : '連線逾時，請稍後重試；重試不會重複建立需求。'); }
    finally { sending.current = false; setBusy(false); }
  }
  if (bookingId) return <section className="request-success" aria-labelledby="request-success-title">
    <span className="success-check" aria-hidden="true">✓</span>
    <h2 id="request-success-title" tabIndex={-1} ref={heading}>已收到您的整理需求</h2>
    <p>資料已送至好齡居後台，顧問會依您留下的電話聯繫，與您確認整理範圍及安排。</p>
    <p className="booking-reference">案件編號<br /><strong>{bookingId}</strong></p>
    <h3>加入 LINE，加速諮詢</h3>
    <p>加入好友後，請傳送姓名或上方案件編號，讓顧問更快找到您的需求。未加入 LINE 也不影響這次送出。</p>
    <a className="brand-button line-button" href={LINE_QUOTE_URL} target="_blank" rel="noopener noreferrer">加入好齡居 LINE 好友 ↗</a>
    <a className="request-home-link" href="/">回到首頁</a>
  </section>;
  return <form onSubmit={submit} className="consultation-form" aria-busy={busy}>
    <p className="eyebrow">線上填單・不需註冊</p><h2>告訴我們，這次想怎麼整理</h2>
    <p>留下需求，顧問會與您確認範圍與報價。標示 * 為必填，尚未確定的細節可以之後再聊。</p>
    <fieldset disabled={busy} className="request-fields">
      {[{ key: 'goal', title: '本次目標', values: ORGANIZING_GOALS, selected: goal }, { key: 'purpose', title: '整理目的', values: ORGANIZING_PURPOSES, selected: purpose }].map(group => <fieldset key={group.key}><legend>{group.title} *</legend><div className="organizing-options">{group.values.map(value => <label key={value}><input required type="radio" name={group.key} value={value} checked={group.selected === value} onChange={() => choose(group.key, value)} /><span>{value}</span></label>)}</div></fieldset>)}
      <div className="request-contact-grid">
        <label>姓名 *<input name="name" autoComplete="name" required maxLength={80} placeholder="怎麼稱呼您" /></label>
        <label>聯絡電話 *<input name="phone" type="tel" autoComplete="tel" required minLength={8} maxLength={30} pattern="[+0-9 ()\-]{8,30}" placeholder="手機或市話（含區碼）" /></label>
      </div>
      <label>服務縣市／行政區 *<input name="area" required maxLength={100} placeholder="例如：台北市信義區，暫不需完整地址" autoComplete="address-level2" /></label>
      <label>電子郵件（選填）<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="填寫後可接收需求確認信" /></label>
      <label>需求說明（選填）<textarea name="notes" rows={3} maxLength={2000} placeholder="例如：想整理客廳與一間臥室，希望下個月安排" /></label>
      <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="request-consent"><input type="checkbox" name="consent" required /><span>我同意好齡居使用本次填寫的資料，聯繫並處理此整理需求。*</span></label>
      <p className="request-note">提交為諮詢需求，服務內容與費用確認後，再由您決定是否安排。</p>
      <button className="brand-button" type="submit">{busy ? '需求送出中…' : '送出整理需求 →'}</button>
    </fieldset>
    {error && <div role="alert" className="request-error"><p>{error}</p><a href={LINE_QUOTE_URL} target="_blank" rel="noopener noreferrer">也可透過 LINE 聯繫顧問</a></div>}
  </form>;
}
