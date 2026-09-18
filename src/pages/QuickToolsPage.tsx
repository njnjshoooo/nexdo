import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LINE_QUOTE_URL } from '../data/organizingCatalog';
import { safetyQuestions, calculateRental, type RentalInputs } from '../features/consultation/toolLogic';

function ConsultationLinks() {
  return <div className="tool-next"><h2>想進一步討論？</h2><p>可以先看完結果，再依需要請顧問協助。</p><div className="tool-actions"><Link className="brand-button" to="/consultant">留下諮詢需求</Link><a className="brand-button secondary" href={LINE_QUOTE_URL} target="_blank" rel="noopener noreferrer">加入 LINE 諮詢 ↗</a></div></div>;
}
function useStepFocus(step: number) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, [step]);
  return ref;
}
export function SafetyTool() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(safetyQuestions.length).fill(''));
  const heading = useStepFocus(step);
  const complete = step === safetyQuestions.length;
  const concerns = safetyQuestions.filter((_, index) => answers[index] === 'yes');
  const unknown = safetyQuestions.filter((_, index) => answers[index] === 'unknown');
  return <section className="quick-tool retirement-container">
    <Helmet><title>一分鐘居家安全檢測｜好齡居</title></Helmet>
    <Link className="tool-back" to="/">← 回首頁</Link><p className="eyebrow">居住安全・6 題・不需註冊</p>
    <h1>一分鐘居家安全檢測</h1><p>依家中的日常情況回答，不確定也沒關係。完成就能看建議，不需先留聯絡資料。</p>
    <div className="tool-progress-label" aria-live="polite">{complete ? '已完成 6 題' : `第 ${step + 1} 題，共 6 題`}</div>
    <progress max={6} value={step} aria-label="檢測進度" />
    {!complete ? <div className="tool-panel">
      <h2 tabIndex={-1} ref={heading}>{safetyQuestions[step].title}</h2>
      <fieldset className="tool-options"><legend className="sr-only">請選擇符合家中情況的答案</legend>{[['yes', '有這個情況'], ['no', '沒有這個情況'], ['unknown', '不確定，想再確認']].map(([value, label]) => <label key={value} className={answers[step] === value ? 'selected' : ''}><input type="radio" name={`question-${step}`} value={value} checked={answers[step] === value} onChange={() => setAnswers(current => current.map((a, index) => index === step ? value : a))} /><span>{label}</span></label>)}</fieldset>
      <div className="tool-actions"><button type="button" className="brand-button secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>上一題</button><button type="button" className="brand-button" disabled={!answers[step]} onClick={() => setStep(step + 1)}>{step === 5 ? '查看我的建議' : '下一題 →'}</button></div>
    </div> : <div className="tool-panel">
      <h2 ref={heading} tabIndex={-1}>您的居家觀察摘要</h2>
      <p>{concerns.length ? `有 ${concerns.length} 個面向可以優先留意，從一件容易改善的事開始。` : '這次回答沒有指出明顯困擾，仍可定期留意日常環境的變化。'}</p>
      {concerns.map(item => <article className="safety-tip" key={item.area}><h3>{item.area}</h3><p>{item.tip}</p></article>)}
      {unknown.length > 0 && <p className="tool-assumptions">待確認：{unknown.map(q => q.area).join('、')}。可以與家人一起看看，再更新回答。</p>}
      <p className="request-note">這是日常環境自我觀察，不能取代現場專業評估，也不能保證居家安全。</p>
      <div className="tool-actions"><button className="brand-button secondary" onClick={() => setStep(0)}>返回修改回答</button></div><ConsultationLinks />
    </div>}
  </section>;
}

const money = (value: number) => `NT$ ${Math.round(value).toLocaleString('zh-TW')}`;
export function RentalTool() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ rent: '', vacancy: '0', management: '0', repairs: '0', setup: '0' });
  const [result, setResult] = useState<ReturnType<typeof calculateRental> | null>(null);
  const [error, setError] = useState('');
  const heading = useStepFocus(step);
  function field(key: keyof RentalInputs, label: string, max: number, unit: string) {
    return <label key={key}>{label}<div className="number-with-unit"><input aria-label={label} type="number" inputMode="decimal" required min={key === 'rent' ? 1 : 0} max={max} step={key === 'vacancy' || key === 'management' ? '0.5' : '1'} value={values[key]} onChange={event => setValues({ ...values, [key]: event.target.value })} /><span>{unit}</span></div></label>;
  }
  function next(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (step === 0) { setStep(1); return; }
    try {
      if (Object.values(values).some(value => value === '')) throw new Error('請填妥每個數值；沒有此項成本可填 0');
      setResult(calculateRental(Object.fromEntries(Object.entries(values).map(([k,v]) => [k, Number(v)])) as RentalInputs)); setStep(2);
    } catch (err) { setError((err as Error).message); }
  }
  return <section className="quick-tool retirement-container">
    <Helmet><title>代租代管租金試算｜好齡居</title></Helmet>
    <Link className="tool-back" to="/">← 回首頁</Link><p className="eyebrow">出租收支・2 步試算・不需註冊</p><h1>代租代管租金試算</h1>
    <p>從您預期的月租金出發，看看不同成本下的第一年收支。完成即可看結果。</p>
    <div className="tool-progress-label" aria-live="polite">{step === 2 ? '試算完成' : `第 ${step + 1} 步，共 2 步`}</div><progress value={step} max={2} aria-label="試算進度" />
    {step < 2 ? <form className="tool-panel consultation-form" onSubmit={next}>
      <h2 ref={heading} tabIndex={-1}>{step === 0 ? '您預期每月收多少租金？' : '調整您的成本假設'}</h2>
      {step === 0 ? <>{field('rent', '預期每月租金', 1000000, '元／月')}<p className="request-note">請填您預期或目前的月租金。本工具不推估市場租金；還不確定時，可先洽顧問了解。</p></> : <>
        <p className="tool-assumptions">預期月租金：{money(Number(values.rent))}。以下預填 0，請依自己的情況調整；不代表好齡居報價。</p>
        <div className="rental-fields">{field('vacancy', '每年預計空置', 12, '個月')}{field('management', '代管費率（按實收租金）', 100, '%')}{field('repairs', '每年修繕／其他支出', 1000000, '元／年')}{field('setup', '首年一次性費用（招租、整理等）', 10000000, '元')}</div>
      </>}
      {error && <p role="alert" className="request-error">{error}</p>}
      <div className="tool-actions">{step === 1 && <button type="button" className="brand-button secondary" onClick={() => setStep(0)}>上一步</button>}<button className="brand-button" type="submit">{step === 0 ? '下一步：調整成本 →' : '查看試算結果'}</button></div>
    </form> : result && <div className="tool-panel">
      <h2 tabIndex={-1} ref={heading}>您的第一年出租收支</h2><p className="rental-total">{money(result.net)}<span>第一年預估結餘</span></p>
      <dl className="rental-breakdown"><div><dt>租金收入（扣除空置）</dt><dd>{money(result.gross)}</dd></div><div><dt>代管費（{values.management}%）</dt><dd>− {money(result.fee)}</dd></div><div><dt>修繕／其他支出</dt><dd>− {money(Number(values.repairs))}</dd></div><div><dt>首年一次性費用</dt><dd>− {money(Number(values.setup))}</dd></div><div><dt>換算每月平均結餘</dt><dd>{money(result.monthly)}</dd></div></dl>
      <p className="tool-assumptions">計算方式：月租金 ×（12 − 空置月數）×（1 − 代管費率）− 年度支出 − 首年一次性費用。依您輸入的數值計算，未自動計入稅費、貸款、保險或租金變動；非市場估價、正式報價或收益保證。</p>
      {result.net < 0 && <p>目前假設下，第一年支出高於租金收入。可返回調整數值，或與顧問討論安排。</p>}
      <button type="button" className="brand-button secondary" onClick={() => setStep(0)}>修改數值，重新試算</button><ConsultationLinks />
    </div>}
  </section>;
}
