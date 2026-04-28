import { Order } from '../types/admin';
import { productService } from './productService';
import localforage from 'localforage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'haolingju_orders';
const TABLE_NAME = 'orders';

// 用 createInstance 避免與其他 service 共享預設 localforage 實例導致 storeName 互相覆蓋
const store = localforage.createInstance({
  name: 'haolingju',
  storeName: 'orders',
});

function mapRow(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    items: Array.isArray(row.items) ? row.items : [],
    totalAmount: row.total_amount ?? 0,
    depositAmount: row.deposit_amount ?? undefined,
    balanceAmount: row.balance_amount ?? undefined,
    quotedAmount: row.quoted_amount ?? undefined,
    status: row.status,
    customerInfo: row.customer_info ?? {},
    paymentMethod: row.payment_method ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at ?? undefined,
    customerServiceNotes: row.customer_service_notes ?? undefined,
    vendorId: row.vendor_id ?? undefined,
    submissionId: row.submission_id ?? undefined,
    assignedStaffId: row.assigned_staff_id ?? undefined,
    assignedDate: row.assigned_date ?? undefined,
    assignedTime: row.assigned_time ?? undefined,
    vendorNotes: row.vendor_notes ?? undefined,
    cancelReason: row.cancel_reason ?? undefined,
    servicePhotoUrl: row.service_photo_url ?? undefined,
    receiptPhotoUrl: row.receipt_photo_url ?? undefined,
    paymentProofPhotoUrl: row.payment_proof_photo_url ?? undefined,
    statusUpdates: Array.isArray(row.status_updates) ? row.status_updates : [],
    statementId: row.statement_id ?? undefined,
    refundInfo: row.refund_info ?? undefined,
  } as Order;
}

function toRow(o: Partial<Order>): any {
  const row: any = {};
  if (o.id !== undefined) row.id = o.id;
  if ((o as any).userId !== undefined) row.user_id = (o as any).userId || null;
  if (o.items !== undefined) row.items = o.items;
  if (o.totalAmount !== undefined) row.total_amount = o.totalAmount;
  if (o.depositAmount !== undefined) row.deposit_amount = o.depositAmount;
  if (o.balanceAmount !== undefined) row.balance_amount = o.balanceAmount;
  if (o.quotedAmount !== undefined) row.quoted_amount = o.quotedAmount;
  if (o.status !== undefined) row.status = o.status;
  if (o.customerInfo !== undefined) row.customer_info = o.customerInfo;
  if (o.paymentMethod !== undefined) row.payment_method = o.paymentMethod;
  if (o.paidAt !== undefined) row.paid_at = o.paidAt;
  if (o.customerServiceNotes !== undefined) row.customer_service_notes = o.customerServiceNotes;
  if (o.vendorId !== undefined) row.vendor_id = o.vendorId;
  if (o.submissionId !== undefined) row.submission_id = o.submissionId;
  if (o.assignedStaffId !== undefined) row.assigned_staff_id = o.assignedStaffId;
  if (o.assignedDate !== undefined) row.assigned_date = o.assignedDate;
  if (o.assignedTime !== undefined) row.assigned_time = o.assignedTime;
  if (o.vendorNotes !== undefined) row.vendor_notes = o.vendorNotes;
  if (o.cancelReason !== undefined) row.cancel_reason = o.cancelReason;
  if (o.servicePhotoUrl !== undefined) row.service_photo_url = o.servicePhotoUrl;
  if (o.receiptPhotoUrl !== undefined) row.receipt_photo_url = o.receiptPhotoUrl;
  if (o.paymentProofPhotoUrl !== undefined) row.payment_proof_photo_url = o.paymentProofPhotoUrl;
  if (o.statusUpdates !== undefined) row.status_updates = o.statusUpdates;
  if (o.statementId !== undefined) row.statement_id = o.statementId;
  if (o.refundInfo !== undefined) row.refund_info = o.refundInfo;
  if (o.createdAt !== undefined) row.created_at = o.createdAt;
  return row;
}

class OrderService {
  private channel = new BroadcastChannel('haolingju_orders_channel');

  constructor() {
    this.channel.onmessage = () => {
      window.dispatchEvent(new Event('orders_updated'));
    };
  }

  private async loadCache(): Promise<Order[]> {
    try {
      const stored = await store.getItem<Order[]>(STORAGE_KEY);
      if (stored) return stored;
      const oldStored = localStorage.getItem('orders');
      if (oldStored) {
        try {
          const parsed = JSON.parse(oldStored);
          await store.setItem(STORAGE_KEY, parsed);
          localStorage.removeItem('orders');
          return parsed;
        } catch {}
      }
      return [];
    } catch (e) {
      console.error('[orderService] loadCache failed', e);
      return [];
    }
  }

  private async saveCache(orders: Order[]) {
    try {
      await store.setItem(STORAGE_KEY, orders);
      window.dispatchEvent(new Event('orders_updated'));
      this.channel.postMessage('updated');
    } catch (e) {
      console.warn('[orderService] saveCache failed', e);
    }
  }

  async getAll(): Promise<Order[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const mapped = data.map(mapRow);
          await this.saveCache(mapped);
          return mapped;
        }
        if (error) console.warn('[orderService] Supabase getAll failed', error);
      } catch (e) {
        console.warn('[orderService] Supabase getAll error', e);
      }
    }
    return this.loadCache();
  }

  async getById(id: string): Promise<Order | undefined> {
    const orders = await this.getAll();
    return orders.find(o => o.id === id);
  }

  async getBySubmissionId(submissionId: string): Promise<Order | undefined> {
    const orders = await this.getAll();
    return orders.find(o => o.submissionId === submissionId);
  }

  async generateOrderId(productId: string): Promise<string> {
    const product = await productService.getById(productId);
    const orderCode = product?.orderCode || 'GEN';

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('generate_order_id', { p_order_code: orderCode });
        if (!error && typeof data === 'string') return data;
      } catch (e) {
        console.warn('[orderService] generate_order_id RPC failed, falling back', e);
      }
    }

    // Fallback：本地計算
    const orders = await this.loadCache();
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    const monthPrefix = `${yy}${mm}`;
    const monthOrders = orders.filter(o => {
      if (o.id.length < 9) return false;
      const idDate = o.id.slice(0, 6);
      const idCode = o.id.slice(6, -3);
      const idSeq = o.id.slice(-3);
      return idDate.startsWith(monthPrefix) && idCode === orderCode && /^\d{3}$/.test(idSeq);
    });
    let maxSequence = 0;
    monthOrders.forEach(o => {
      const seq = parseInt(o.id.slice(-3), 10);
      if (!isNaN(seq) && seq > maxSequence) maxSequence = seq;
    });
    const sequence = String(maxSequence + 1).padStart(3, '0');
    return `${datePrefix}${orderCode}${sequence}`;
  }

  async create(order: Order): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).insert(toRow(order));
      if (error) {
        console.error('[orderService] create failed in Supabase', error);
        throw new Error(`建立訂單失敗：${error.message}`);
      }
    }
    const orders = await this.loadCache();
    orders.push(order);
    await this.saveCache(orders);
  }

  async update(orderId: string, updates: Partial<Order>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).update(toRow(updates)).eq('id', orderId);
      if (error) {
        console.error('[orderService] update failed in Supabase', error);
        throw new Error(`更新訂單失敗：${error.message}`);
      }
    }
    const orders = await this.loadCache();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      await this.saveCache(orders);
    }
  }

  async updateStatus(orderId: string, status: Order['status']): Promise<void> {
    await this.update(orderId, { status });
  }

  async delete(orderId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', orderId);
      if (error) {
        console.error('[orderService] delete failed in Supabase', error);
        throw new Error(`刪除訂單失敗：${error.message}`);
      }
    }
    const orders = await this.loadCache();
    await this.saveCache(orders.filter(o => o.id !== orderId));
  }
}

export const orderService = new OrderService();
