import type { FormSubmission } from '../../types/form';
import { ORGANIZING_FORM_ID, ORGANIZING_LABELS } from './organizing';
export function csvCell(value: unknown): string {
  let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Excel 公式注入防護，也保留電話前導零。
  if (/^[\s]*[=+\-@]/.test(text) || /^0\d/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}
export function submissionsCsv(submissions: FormSubmission[], labelFor: (formId: string, key: string) => string) {
  const fields = [...new Set(submissions.flatMap(s => Object.keys(s.data)))];
  const rows: unknown[][] = [['案件編號', '送出時間', '狀態', '來源頁面', '表單', ...fields.map(key => {
    const match = submissions.find(s => key in s.data)!;
    return match.formId === ORGANIZING_FORM_ID ? ORGANIZING_LABELS[key] || key : labelFor(match.formId, key);
  })]];
  for (const s of submissions) rows.push([s.bookingId, s.createdAt, s.status, s.pageTitle, s.formId === ORGANIZING_FORM_ID ? '老前整理線上諮詢' : s.formId, ...fields.map(key => s.data[key])]);
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}
