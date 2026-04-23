export type OrderStatus = 
  | 'NEW_QUOTE'
  | 'QUOTING'
  | 'QUOTE_REVIEW'
  | 'UNPAID'
  | 'PENDING'
  | 'ACTIVE'
  | 'WAITING_BALANCE'
  | 'BALANCE_PAID'
  | 'COMPLETED'
  | 'UNAVAILABLE'
  | 'PAYOUT_REQUEST'
  | 'PENDING_PAYMENT'
  | 'PAYOUT_PROCESSING'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface OrderStatusDefinition {
  key: OrderStatus;
  adminLabel: string;
  vendorLabel: string | null;
  customerLabel: string;
  moneyFlow: string;
  color: 'blue' | 'yellow' | 'gray' | 'green' | 'red';
  description: string;
  action: string;
}

export const ORDER_STATUS_DEF: Record<OrderStatus, OrderStatusDefinition> = {
  NEW_QUOTE: {
    key: 'NEW_QUOTE',
    adminLabel: '新預約',
    vendorLabel: null,
    customerLabel: '預約處理中',
    moneyFlow: '-',
    color: 'green',
    description: '新產生的預約需求',
    action: '客戶提交預約表單'
  },
  QUOTING: {
    key: 'QUOTING',
    adminLabel: '待廠商報價',
    vendorLabel: '需報價',
    customerLabel: '預約處理中',
    moneyFlow: '-',
    color: 'blue',
    description: '正在等待廠商提供報價',
    action: '管理員完成指派廠商之後轉換'
  },
  QUOTE_REVIEW: {
    key: 'QUOTE_REVIEW',
    adminLabel: '待向客戶報價',
    vendorLabel: '已報價',
    customerLabel: '預約處理中',
    moneyFlow: '-',
    color: 'yellow',
    description: '廠商已報價，等待管理員轉發報價單給客戶',
    action: '廠商報價後轉換'
  },
  UNPAID: {
    key: 'UNPAID',
    adminLabel: '客戶未付款',
    vendorLabel: '已報價',
    customerLabel: '待付款',
    moneyFlow: '待入帳',
    color: 'gray',
    description: '客戶尚未支付定金或全額',
    action: '管理員已將報價單轉發給客戶'
  },
  PENDING: {
    key: 'PENDING',
    adminLabel: '待派案',
    vendorLabel: '新派案',
    customerLabel: '等待派案中',
    moneyFlow: '已收全款/定金 (平台代管)',
    color: 'blue',
    description: '已付款，等待管理員請廠商派案給具體的服務人員',
    action: '客戶已經付款'
  },
  ACTIVE: {
    key: 'ACTIVE',
    adminLabel: '已媒合',
    vendorLabel: '媒合成功/準備服務',
    customerLabel: '已媒合服務人員',
    moneyFlow: '平台代管中',
    color: 'green',
    description: '已媒合成功，準備開始服務',
    action: '廠商選定服務人員並回報'
  },
  WAITING_BALANCE: {
    key: 'WAITING_BALANCE',
    adminLabel: '待收尾款',
    vendorLabel: '準備服務',
    customerLabel: '已媒合服務人員',
    moneyFlow: '已收定金，待收尾款',
    color: 'yellow',
    description: '服務進行中，等待收取尾款',
    action: '服務當日，系統自動轉換'
  },
  BALANCE_PAID: {
    key: 'BALANCE_PAID',
    adminLabel: '已付尾款/待廠商結案',
    vendorLabel: '完成服務/客戶已付尾款/請申請結案',
    customerLabel: '已完成服務',
    moneyFlow: '已收定金，待收尾款',
    color: 'green',
    description: '已收到尾款',
    action: '服務當日，客戶付尾款'
  },
  COMPLETED: {
    key: 'COMPLETED',
    adminLabel: '廠商已申請結案',
    vendorLabel: '結案核可中',
    customerLabel: '已完成服務',
    moneyFlow: '服務結束',
    color: 'green',
    description: '服務已結束',
    action: '廠商上傳服務完成照片與簽收單，並回報'
  },
  UNAVAILABLE: {
    key: 'UNAVAILABLE',
    adminLabel: '廠商退回/需重新派案',
    vendorLabel: '無法承接/已退回',
    customerLabel: '等待派案中',
    moneyFlow: '-',
    color: 'blue',
    description: '廠商無法配合',
    action: '廠商在後台點擊「送出無法配合原因」'
  },
  PAYOUT_REQUEST: {
    key: 'PAYOUT_REQUEST',
    adminLabel: '待廠商申請撥款',
    vendorLabel: '待申請撥款',
    customerLabel: '已完成服務',
    moneyFlow: '-',
    color: 'blue',
    description: '等待廠商月底申請撥款中',
    action: '管理員點擊「核准結案」'
  },
  PENDING_PAYMENT: {
    key: 'PENDING_PAYMENT',
    adminLabel: '待撥款給廠商',
    vendorLabel: '申請撥款中',
    customerLabel: '已完成服務',
    moneyFlow: '平台準備出帳',
    color: 'blue',
    description: '廠商申請撥款中',
    action: '廠商申請當月撥款'
  },
  PAYOUT_PROCESSING: {
    key: 'PAYOUT_PROCESSING',
    adminLabel: '撥款處理中',
    vendorLabel: '撥款處理中',
    customerLabel: '已完成服務',
    moneyFlow: '會計處理撥款',
    color: 'blue',
    description: '管理員開始處理撥款',
    action: '管理員點擊「核准撥款」'
  },
  PAID: {
    key: 'PAID',
    adminLabel: '已撥款結案',
    vendorLabel: '已撥款結案',
    customerLabel: '已完成服務',
    moneyFlow: '錢已匯給廠商',
    color: 'gray',
    description: '平台已撥款給廠商，結案',
    action: '待月結撥款結案'
  },
  CANCELLED: {
    key: 'CANCELLED',
    adminLabel: '已取消',
    vendorLabel: '已取消',
    customerLabel: '訂單已取消',
    moneyFlow: '(若有付錢則轉退款流程)',
    color: 'red',
    description: '訂單取消',
    action: '廠商點擊申請取消訂單，或客戶想取消'
  },
  REFUND_PENDING: {
    key: 'REFUND_PENDING',
    adminLabel: '退款處理中',
    vendorLabel: '已取消',
    customerLabel: '退款處理中',
    moneyFlow: '錢退款給客戶',
    color: 'red',
    description: '退款處理中',
    action: '管理員發起退款流程，會計處理退款'
  },
  REFUNDED: {
    key: 'REFUNDED',
    adminLabel: '已退款給客戶',
    vendorLabel: '已取消',
    customerLabel: '已退款',
    moneyFlow: '完成客戶退款',
    color: 'gray',
    description: '已完成退款',
    action: '退款金流完成'
  }
};

export const getStatusColorClass = (color: OrderStatusDefinition['color']) => {
  switch (color) {
    case 'blue': return 'bg-blue-100 text-blue-700';
    case 'yellow': return 'bg-yellow-100 text-yellow-700';
    case 'gray': return 'bg-stone-100 text-stone-700';
    case 'green': return 'bg-green-100 text-green-700';
    case 'red': return 'bg-red-100 text-red-700';
    default: return 'bg-stone-100 text-stone-700';
  }
};

export const getOrderStatusDisplay = (status: OrderStatus, role: 'admin' | 'vendor' | 'customer' = 'admin') => {
  const def = ORDER_STATUS_DEF[status];
  if (!def) return status;

  if (role === 'vendor' && def.vendorLabel) {
    return def.vendorLabel;
  }

  if (role === 'customer' && def.customerLabel) {
    return def.customerLabel;
  }
  
  return def.adminLabel;
};

export const getOrderStatusColor = (status: OrderStatus) => {
  const def = ORDER_STATUS_DEF[status];
  return def ? getStatusColorClass(def.color) : 'bg-stone-100 text-stone-700';
};
