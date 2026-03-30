import { Order } from '../types/admin';
import { productService } from './productService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class OrderService {
  private orders: Order[] = [];

  constructor() {
    this.loadFromCache();

    // Background refresh from Supabase
    if (isSupabaseConfigured) {
      this.refresh().catch(err => console.error('OrderService: background refresh failed', err));
    }
  }

  private loadFromCache() {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      let orders = JSON.parse(storedOrders);
      // Fix-up: Ensure COMPLETED orders have a paidAt date
      let changed = false;
      orders = orders.map((order: Order) => {
        if (order.status === 'COMPLETED' && !order.paidAt) {
          changed = true;
          return { ...order, paidAt: order.createdAt };
        }
        return order;
      });
      if (changed) {
        localStorage.setItem('orders', JSON.stringify(orders));
      }
      this.orders = orders;
    } else {
      this.orders = [];
    }
  }

  private saveToCache() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }

  /** Map a Supabase row to a local Order object */
  private mapRowToOrder(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      items: row.items || [],
      totalAmount: row.total_amount,
      quotedAmount: row.quoted_amount,
      status: row.status,
      customerInfo: row.customer_info || {},
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
      paidAt: row.paid_at,
      customerServiceNotes: row.customer_service_notes,
      vendorId: row.vendor_id,
      submissionId: row.submission_id,
      assignedStaffId: row.assigned_staff_id,
      assignedDate: row.assigned_date,
      assignedTime: row.assigned_time,
      vendorNotes: row.vendor_notes,
      cancelReason: row.cancel_reason,
      servicePhotoUrl: row.service_photo_url,
      statusUpdates: row.status_updates || [],
    };
  }

  /** Map a local Order object to Supabase row data */
  private mapOrderToRow(order: Order): Record<string, any> {
    return {
      id: order.id,
      user_id: order.userId,
      items: order.items,
      total_amount: order.totalAmount,
      quoted_amount: order.quotedAmount || null,
      status: order.status,
      customer_info: order.customerInfo,
      payment_method: order.paymentMethod,
      created_at: order.createdAt,
      paid_at: order.paidAt || null,
      customer_service_notes: order.customerServiceNotes || null,
      vendor_id: order.vendorId || null,
      submission_id: order.submissionId || null,
      assigned_staff_id: order.assignedStaffId || null,
      assigned_date: order.assignedDate || null,
      assigned_time: order.assignedTime || null,
      vendor_notes: order.vendorNotes || null,
      cancel_reason: order.cancelReason || null,
      service_photo_url: order.servicePhotoUrl || null,
      status_updates: order.statusUpdates || [],
    };
  }

  /** Fetch all orders from Supabase and update local cache */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('OrderService.refresh error:', error);
      return;
    }
    if (data) {
      this.orders = data.map(row => this.mapRowToOrder(row));
      this.saveToCache();
    }
  }

  getAll(): Order[] {
    return this.orders;
  }

  getById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  getBySubmissionId(submissionId: string): Order | undefined {
    return this.orders.find(o => o.submissionId === submissionId);
  }

  async generateOrderId(productId: string): Promise<string> {
    const product = productService.getById(productId);
    const orderCode = product?.orderCode || 'GEN';

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('generate_order_id', { p_order_code: orderCode });
      if (!error && data) return data;
      console.warn('OrderService.generateOrderId RPC failed, falling back to local generation:', error);
    }

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    const monthPrefix = `${yy}${mm}`;

    // Find orders in the same month with the same orderCode
    const monthOrders = this.orders.filter(o => {
      if (o.id.length < 9) return false;
      const idDate = o.id.slice(0, 6);
      const idCode = o.id.slice(6, -3);
      const idSeq = o.id.slice(-3);
      return idDate.startsWith(monthPrefix) && idCode === orderCode && /^\d{3}$/.test(idSeq);
    });

    let maxSequence = 0;
    monthOrders.forEach(o => {
      const idSeq = o.id.slice(-3);
      const seq = parseInt(idSeq, 10);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    });

    const sequence = String(maxSequence + 1).padStart(3, '0');
    return `${datePrefix}${orderCode}${sequence}`;
  }

  async create(order: Order): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('orders').insert(this.mapOrderToRow(order));
      if (error) throw new Error(error.message);
    }

    this.orders.push(order);
    this.saveToCache();
  }

  async updateStatus(orderId: string, status: Order['status']): Promise<void> {
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index === -1) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw new Error(error.message);
    }

    this.orders[index].status = status;
    this.saveToCache();
  }

  async update(orderId: string, updates: Partial<Order>): Promise<void> {
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index === -1) return;

    if (isSupabaseConfigured) {
      const dbData: Record<string, any> = {};
      if (updates.userId !== undefined) dbData.user_id = updates.userId;
      if (updates.items !== undefined) dbData.items = updates.items;
      if (updates.totalAmount !== undefined) dbData.total_amount = updates.totalAmount;
      if (updates.quotedAmount !== undefined) dbData.quoted_amount = updates.quotedAmount;
      if (updates.status !== undefined) dbData.status = updates.status;
      if (updates.customerInfo !== undefined) dbData.customer_info = updates.customerInfo;
      if (updates.paymentMethod !== undefined) dbData.payment_method = updates.paymentMethod;
      if (updates.paidAt !== undefined) dbData.paid_at = updates.paidAt;
      if (updates.customerServiceNotes !== undefined) dbData.customer_service_notes = updates.customerServiceNotes;
      if (updates.vendorId !== undefined) dbData.vendor_id = updates.vendorId;
      if (updates.submissionId !== undefined) dbData.submission_id = updates.submissionId;
      if (updates.assignedStaffId !== undefined) dbData.assigned_staff_id = updates.assignedStaffId;
      if (updates.assignedDate !== undefined) dbData.assigned_date = updates.assignedDate;
      if (updates.assignedTime !== undefined) dbData.assigned_time = updates.assignedTime;
      if (updates.vendorNotes !== undefined) dbData.vendor_notes = updates.vendorNotes;
      if (updates.cancelReason !== undefined) dbData.cancel_reason = updates.cancelReason;
      if (updates.servicePhotoUrl !== undefined) dbData.service_photo_url = updates.servicePhotoUrl;
      if (updates.statusUpdates !== undefined) dbData.status_updates = updates.statusUpdates;

      const { error } = await supabase.from('orders').update(dbData).eq('id', orderId);
      if (error) throw new Error(error.message);
    }

    this.orders[index] = { ...this.orders[index], ...updates };
    this.saveToCache();
  }
}

export const orderService = new OrderService();
