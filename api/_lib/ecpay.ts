import crypto from 'node:crypto';

const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || '';
const HASH_KEY = process.env.ECPAY_HASH_KEY || '';
const HASH_IV = process.env.ECPAY_HASH_IV || '';
const API_URL = process.env.ECPAY_API_URL || '';

export function assertECPayEnv(): void {
  const missing: string[] = [];
  if (!MERCHANT_ID) missing.push('ECPAY_MERCHANT_ID');
  if (!HASH_KEY) missing.push('ECPAY_HASH_KEY');
  if (!HASH_IV) missing.push('ECPAY_HASH_IV');
  if (!API_URL) missing.push('ECPAY_API_URL');
  if (missing.length) {
    throw new Error(`Missing ECPay env vars: ${missing.join(', ')}`);
  }
}

// ECPay 規定的特殊 URL encoding（注意大小寫與替換規則）
function urlencode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function generateCheckMacValue(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const raw = `HashKey=${HASH_KEY}&${sorted}&HashIV=${HASH_IV}`;
  const encoded = urlencode(raw).toLowerCase();
  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
}

// ⚠️ MerchantTradeDate 必須是 yyyy/MM/dd HH:mm:ss（台北時間）
// 不能用 Node 的 toLocaleString，部分版本會輸出 24:xx:xx 被綠界拒
function formatTaipeiDate(d: Date): string {
  const tz = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${tz.getUTCFullYear()}/${pad(tz.getUTCMonth() + 1)}/${pad(tz.getUTCDate())} ${pad(tz.getUTCHours())}:${pad(tz.getUTCMinutes())}:${pad(tz.getUTCSeconds())}`;
}

// ⚠️ MerchantTradeNo 規則：只能英數字、最多 20 字元
// 我們的 orderId 格式是 YYMMDDCODE###（例：250601ABC001），通常 12-14 字元，已符合
export function toMerchantTradeNo(orderId: string): string {
  return orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
}

function cleanForECPay(value: string | undefined | null, max: number): string {
  if (!value) return '';
  return value.replace(/[\r\n\t]/g, ' ').replace(/['"&<>]/g, '').trim().slice(0, max);
}

// ItemName 多筆商品用 '#' 分隔，總長度 200，每筆建議不超過 50
export function buildItemName(items: Array<{ name: string; quantity: number }>): string {
  const joined = items
    .map((i) => cleanForECPay(`${i.name} x${i.quantity}`, 50))
    .filter(Boolean)
    .join('#');
  return joined.slice(0, 200) || '線上訂單';
}

export interface ECPayOrderInput {
  orderId: string;           // 系統內部訂單編號（會轉成 merchant_trade_no）
  amount: number;            // 本次要扣的金額（若有訂金，傳訂金，不是 total）
  itemName: string;          // 顯示在綠界付款頁
  tradeDesc?: string;        // 交易描述
  paymentMethod: 'ALL' | 'Credit' | 'WebATM' | 'ATM' | 'CVS' | 'BARCODE' | 'ApplePay';
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddr?: string;
  returnUrl: string;         // 後端 webhook URL
  clientBackUrl: string;     // 客戶付款後返回的網址
  orderResultUrl?: string;   // 信用卡：付款成功後背景 POST 到這（給結果頁用）
}

export interface ECPayFormResult {
  apiUrl: string;
  merchantTradeNo: string;
  params: Record<string, string>;
}

export function createECPayFormParams(order: ECPayOrderInput): ECPayFormResult {
  assertECPayEnv();
  const merchantTradeNo = toMerchantTradeNo(order.orderId);

  const params: Record<string, string> = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: formatTaipeiDate(new Date()),
    PaymentType: 'aio',
    TotalAmount: String(Math.round(order.amount)),
    TradeDesc: cleanForECPay(order.tradeDesc || '好齡居線上訂單', 200),
    ItemName: order.itemName,
    ReturnURL: order.returnUrl,
    ClientBackURL: order.clientBackUrl,
    ChoosePayment: order.paymentMethod,
    EncryptType: '1',
  };

  if (order.orderResultUrl) params.OrderResultURL = order.orderResultUrl;

  // 客戶資訊（顯示在綠界後台訂單明細）
  const customerName = cleanForECPay(order.customerName, 20);
  if (customerName) params.CustomerName = customerName;
  if (order.customerEmail) params.CustomerEmail = cleanForECPay(order.customerEmail, 200);
  if (order.customerPhone) {
    const phone = order.customerPhone.replace(/\D/g, '').slice(0, 20);
    if (phone) params.CustomerPhone = phone;
  }
  const customerAddr = cleanForECPay(order.customerAddr, 200);
  if (customerAddr) params.CustomerAddr = customerAddr;

  params.CheckMacValue = generateCheckMacValue(params);

  return { apiUrl: API_URL, merchantTradeNo, params };
}

export function verifyECPayCallback(params: Record<string, string>): boolean {
  assertECPayEnv();
  const { CheckMacValue, ...rest } = params;
  if (!CheckMacValue) return false;
  const computed = generateCheckMacValue(rest);
  return computed === CheckMacValue;
}

// 綠界 PaymentDate 格式：yyyy/MM/dd HH:mm:ss（台北時間）
export function parseECPayDate(s: string | undefined): string | null {
  if (!s) return null;
  // "2026/06/01 14:30:00" → ISO（視為台北時間 UTC+8）
  const m = s.match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, se] = m;
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${se}+08:00`;
  const date = new Date(iso);
  return isNaN(date.getTime()) ? null : date.toISOString();
}
