export const ORGANIZING_GOALS = ['退休整理', '老前整理', '遺物整理', '搬家整理'];
export const ORGANIZING_PURPOSES = ['空間調整', '搬家', '出租房屋', '出售房屋'];
export const ORGANIZING_FORM_ID = 'organizing-consultation';
export const ORGANIZING_LABELS: Record<string, string> = {
  name: '姓名', phone: '聯絡電話', email: '電子郵件', goal: '本次目標', purpose: '整理目的',
  area: '服務縣市／行政區', notes: '需求說明', consent: '同意聯繫',
};
export function validateOrganizing(input: Record<string, unknown>): Record<string, string> {
  const limits: Record<string, number> = { name: 80, phone: 30, email: 254, goal: 20, purpose: 20, area: 100, notes: 2000 };
  const data: Record<string, string> = {};
  for (const [key, limit] of Object.entries(limits)) {
    if (input[key] != null && typeof input[key] !== 'string') throw new Error('請確認欄位格式');
    data[key] = String(input[key] || '').trim();
    if (data[key].length > limit) throw new Error('欄位內容過長，請精簡後再送出');
  }
  if (!data.name || !data.area) throw new Error('請填寫姓名與服務地區');
  if (!/^[+\d\s()-]{8,30}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 8) throw new Error('請填寫有效的聯絡電話');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('請確認電子郵件格式');
  if (!ORGANIZING_GOALS.includes(data.goal) || !ORGANIZING_PURPOSES.includes(data.purpose)) throw new Error('請選擇整理目標與目的');
  if (input.consent !== true) throw new Error('請同意好齡居使用本次資料聯繫您');
  return { ...data, consent: '已同意本次需求聯繫' };
}
