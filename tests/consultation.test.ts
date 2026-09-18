import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrganizing } from '../src/features/consultation/organizing';
import { calculateRental } from '../src/features/consultation/toolLogic';
import { csvCell, submissionsCsv } from '../src/features/consultation/csv';
import { createOrganizingHandler } from '../api/organizing-request';

const valid = { name: '測試使用者', phone: '0912345678', area: '台北市信義區', goal: '退休整理', purpose: '空間調整', consent: true };
test('整理表單保留選擇、接受選填 email 空白，拒絕無效必填與未同意', () => {
  assert.equal(validateOrganizing(valid).goal, '退休整理');
  assert.equal(validateOrganizing(valid).email, '');
  for (const patch of [{ phone: 'abcdefgh' }, { phone: '----    ' }, { consent: false }, { goal: 'invalid' }, { area: '' }, { email: 'invalid' }, { notes: 'x'.repeat(2001) }]) assert.throws(() => validateOrganizing({ ...valid, ...patch }));
});
test('試算以實收租金扣代管費，首年費用僅扣一次', () => {
  assert.deepEqual(calculateRental({ rent: 20000, vacancy: 1, management: 10, repairs: 12000, setup: 6000 }), { gross: 220000, fee: 22000, net: 180000, monthly: 15000 });
});
test('試算處理全年空置、負結餘與非法數值', () => {
  assert.equal(calculateRental({ rent: 20000, vacancy: 12, management: 10, repairs: 1000, setup: 0 }).net, -1000);
  for (const patch of [{ rent: NaN }, { rent: 0 }, { vacancy: 13 }, { repairs: -1 }, { management: 101 }]) assert.throws(() => calculateRental({ rent: 20000, vacancy: 0, management: 0, repairs: 0, setup: 0, ...patch }));
});
test('CSV 保留中文、電話前導零並防止公式執行，正確跳脫引號換行', () => {
  assert.equal(csvCell('0912345678'), '"\'0912345678"');
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  const csv = submissionsCsv([{ id: '1', formId: 'organizing-consultation', pageTitle: '整理', pageSlug: 'services/organizing', createdAt: '2026-09-18', data: { name: '測試', goal: '退休整理' } }], (_, k) => k);
  assert.ok(csv.startsWith('\uFEFF')); assert.ok(csv.includes('本次目標')); assert.ok(csv.includes('退休整理'));
});

const requestId = '71827c81-9672-4f20-a625-e88c935a7f10';
function response() {
  return { statusCode: 200, body: {} as any, setHeader() {}, status(code: number) { this.statusCode = code; return this; }, json(body: any) { this.body = body; return this; } };
}
function setup(dbError: any = null) {
  const saved: any[] = []; const sent: any[] = [];
  const handler = createOrganizingHandler({
    getDb: (() => ({ from: () => ({ insert: async (row: any) => { saved.push(row); return { error: dbError }; } }) })) as any,
    notify: async (ctx: any) => { sent.push(ctx); return { internal: true, customer: false }; },
  });
  return { handler, saved, sent };
}
test('伺服器先儲存名單並等候通知，才回傳完成編號', async () => {
  const { handler, saved, sent } = setup(); const res = response();
  await handler({ method: 'POST', body: { ...valid, requestId } } as any, res as any);
  assert.equal(res.statusCode, 200); assert.equal(saved.length, 1); assert.equal(sent.length, 1);
  assert.equal(saved[0].form_id, 'organizing-consultation'); assert.equal(sent[0].customerPhone, valid.phone);
  assert.equal(res.body.bookingId, saved[0].booking_id); assert.equal(res.body.data, undefined);
});
test('寫入失敗不回傳成功、不寄送通知', async () => {
  const { handler, sent } = setup({ code: 'DB_ERROR' }); const res = response();
  await handler({ method: 'POST', body: { ...valid, requestId } } as any, res as any);
  assert.equal(res.statusCode, 503); assert.equal(res.body.ok, undefined); assert.equal(sent.length, 0);
});
test('同一 requestId 重試時不重複寄信，沿用案件編號', async () => {
  const { handler, sent } = setup({ code: '23505' }); const res = response();
  await handler({ method: 'POST', body: { ...valid, requestId } } as any, res as any);
  assert.equal(res.body.bookingId, `ORGA-${requestId.toUpperCase()}`); assert.equal(sent.length, 0);
});
test('拒絕 honeypot 與無效資料，不存檔', async () => {
  const { handler, saved } = setup();
  for (const patch of [{ website: 'bot' }, { consent: false }, { requestId: 'invalid' }]) {
    const res = response(); await handler({ method: 'POST', body: { ...valid, requestId, ...patch } } as any, res as any); assert.equal(res.statusCode, 400);
  }
  assert.equal(saved.length, 0);
});
