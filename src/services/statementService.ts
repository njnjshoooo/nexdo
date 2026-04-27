import { Statement } from '../types/admin';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'statements';
const TABLE_NAME = 'statements';

function mapRow(row: any): Statement {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    month: row.month,
    totalOrders: row.total_orders ?? 0,
    totalAmount: row.total_amount ?? 0,
    payoutAmount: row.payout_amount ?? 0,
    status: row.status,
    createdAt: row.created_at,
    paidAt: row.paid_at ?? undefined,
  } as Statement;
}

function toRow(s: Partial<Statement>): any {
  const row: any = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.vendorId !== undefined) row.vendor_id = s.vendorId;
  if (s.month !== undefined) row.month = s.month;
  if (s.totalOrders !== undefined) row.total_orders = s.totalOrders;
  if (s.totalAmount !== undefined) row.total_amount = s.totalAmount;
  if (s.payoutAmount !== undefined) row.payout_amount = s.payoutAmount;
  if (s.status !== undefined) row.status = s.status;
  if (s.paidAt !== undefined) row.paid_at = s.paidAt;
  return row;
}

function loadCache(): Statement[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCache(items: Statement[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

let refreshing = false;
async function backgroundRefresh() {
  if (!isSupabaseConfigured || refreshing) return;
  refreshing = true;
  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').order('month', { ascending: false });
    if (!error && data) {
      saveCache(data.map(mapRow));
      window.dispatchEvent(new Event('statements_refreshed'));
    }
  } catch (e) {
    console.warn('[statementService] refresh failed', e);
  } finally {
    refreshing = false;
  }
}

if (isSupabaseConfigured) {
  backgroundRefresh();
}

export const statementService = {
  getAll: (): Statement[] => {
    backgroundRefresh();
    return loadCache();
  },

  getById: (id: string): Statement | undefined => loadCache().find(s => s.id === id),

  getByVendorId: (vendorId: string): Statement[] =>
    loadCache().filter(s => s.vendorId === vendorId),

  create: (statement: Statement): Statement => {
    const all = loadCache();
    all.push(statement);
    saveCache(all);

    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).insert(toRow(statement)).then(({ error }) => {
        if (error) console.error('[statementService] create failed in Supabase', error);
      });
    }
    return statement;
  },

  update: (id: string, updates: Partial<Statement>): Statement | undefined => {
    const all = loadCache();
    const index = all.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    const updated = { ...all[index], ...updates };
    all[index] = updated;
    saveCache(all);

    if (isSupabaseConfigured) {
      supabase.from(TABLE_NAME).update(toRow(updates)).eq('id', id).then(({ error }) => {
        if (error) console.error('[statementService] update failed in Supabase', error);
      });
    }
    return updated;
  }
};
