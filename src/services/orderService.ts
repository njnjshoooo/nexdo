import { Order } from '../types/admin';
import { productService } from './productService';
import localforage from 'localforage';

const STORAGE_KEY = 'haolingju_orders';

// Configure localforage
localforage.config({
  name: 'haolingju',
  storeName: 'orders'
});

class OrderService {
  private async loadFromStorage(): Promise<Order[]> {
    try {
      const stored = await localforage.getItem<Order[]>(STORAGE_KEY);
      if (stored) {
        return stored;
      } else {
        // Migration from localStorage
        const oldStored = localStorage.getItem('orders');
        if (oldStored) {
          try {
            const parsed = JSON.parse(oldStored);
            await localforage.setItem(STORAGE_KEY, parsed);
            localStorage.removeItem('orders');
            return parsed;
          } catch (e) {
            console.error('Failed to parse old orders', e);
          }
        }
      }
      return [];
    } catch (e) {
      console.error('Failed to load orders', e);
      return [];
    }
  }

  private channel = new BroadcastChannel('haolingju_orders_channel');

  constructor() {
    this.channel.onmessage = () => {
      window.dispatchEvent(new Event('orders_updated'));
    };
  }

  private async saveToStorage(orders: Order[]) {
    try {
      await localforage.setItem(STORAGE_KEY, orders);
      // Trigger event for current tab
      window.dispatchEvent(new Event('orders_updated'));
      // Trigger event for other tabs
      this.channel.postMessage('updated');
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }

  async getAll(): Promise<Order[]> {
    return this.loadFromStorage();
  }

  async getById(id: string): Promise<Order | undefined> {
    const orders = await this.loadFromStorage();
    return orders.find(o => o.id === id);
  }

  async getBySubmissionId(submissionId: string): Promise<Order | undefined> {
    const orders = await this.loadFromStorage();
    return orders.find(o => o.submissionId === submissionId);
  }

  async generateOrderId(productId: string): Promise<string> {
    const orders = await this.loadFromStorage();
    const product = await productService.getById(productId);
    const orderCode = product?.orderCode || 'GEN';
    
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    const monthPrefix = `${yy}${mm}`;
    
    // Find orders in the same month with the same orderCode
    const monthOrders = orders.filter(o => {
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

  async update(orderId: string, updates: Partial<Order>): Promise<void> {
    const orders = await this.loadFromStorage();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      await this.saveToStorage(orders);
    }
  }

  async create(order: Order): Promise<void> {
    const orders = await this.loadFromStorage();
    orders.push(order);
    await this.saveToStorage(orders);
  }

  async updateStatus(orderId: string, status: Order['status']): Promise<void> {
    const orders = await this.loadFromStorage();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      await this.saveToStorage(orders);
    }
  }

  async delete(orderId: string): Promise<void> {
    const orders = await this.loadFromStorage();
    const filteredOrders = orders.filter(o => o.id !== orderId);
    await this.saveToStorage(filteredOrders);
  }
}

export const orderService = new OrderService();
