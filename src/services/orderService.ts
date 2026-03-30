import { Order } from '../types/admin';
import { productService } from './productService';

class OrderService {
  private load(): Order[] {
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
      return orders;
    }
    return [];
  }

  private save(orders: Order[]) {
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  getAll(): Order[] {
    return this.load();
  }

  getById(id: string): Order | undefined {
    return this.load().find(o => o.id === id);
  }

  getBySubmissionId(submissionId: string): Order | undefined {
    return this.load().find(o => o.submissionId === submissionId);
  }

  generateOrderId(productId: string): string {
    const product = productService.getById(productId);
    const orderCode = product?.orderCode || 'GEN';
    
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    const monthPrefix = `${yy}${mm}`;
    
    // Find orders in the same month with the same orderCode
    const orders = this.load();
    const monthOrders = orders.filter(o => {
      // Check if order ID matches the format YYMMDDCODE001
      // YYMMDD is 6 chars, sequence is 3 chars at the end
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

  create(order: Order) {
    const orders = this.load();
    orders.push(order);
    this.save(orders);
  }

  updateStatus(orderId: string, status: Order['status']) {
    const orders = this.load();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      this.save(orders);
    }
  }

  update(orderId: string, updates: Partial<Order>) {
    const orders = this.load();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      this.save(orders);
    }
  }
}

export const orderService = new OrderService();
