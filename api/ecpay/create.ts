import { createECPayFormParams, buildItemName } from '../_lib/ecpay.js';
import { getSupabaseAdmin } from '../_lib/supabase-admin.js';

// ECPay ChoosePayment 可用值
// https://developers.ecpay.com.tw/?p=2509
type ECPayMethod = 'ALL' | 'Credit' | 'WebATM' | 'ATM' | 'CVS' | 'BARCODE' | 'ApplePay';

function mapPaymentMethod(input: unknown): ECPayMethod {
  if (typeof input !== 'string') return 'ALL';
  const key = input.toUpperCase();
  switch (key) {
    case 'CREDIT_CARD':
    case 'CREDIT':
      return 'Credit';
    case 'TRANSFER':
    case 'ATM':
      return 'ATM';
    case 'WEBATM':
      return 'WebATM';
    case 'CVS':
    case 'CONVENIENCE_STORE':
      return 'CVS';
    case 'BARCODE':
      return 'BARCODE';
    case 'APPLEPAY':
    case 'APPLE_PAY':
      return 'ApplePay';
    case 'ALL':
    default:
      return 'ALL';
  }
}

interface CartItemInput {
  id: string;
  pageId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: { id?: string; name?: string; price?: number };
  expectedDates?: string;
  expectedTime?: string;
  notes?: string;
  unit?: string;
  image?: string;
}

interface CreateOrderBody {
  items: CartItemInput[];
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    lineId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    specialRequirements?: string;
  };
  totalAmount: number;
  depositAmount?: number;
  balanceAmount?: number;
  paymentMethod?: string;
  userId?: string;
}

function validateBody(b: unknown): CreateOrderBody | null {
  if (!b || typeof b !== 'object') return null;
  const body = b as Partial<CreateOrderBody>;
  if (!Array.isArray(body.items) || body.items.length === 0) return null;
  if (!body.customerInfo || typeof body.customerInfo !== 'object') return null;
  const c = body.customerInfo;
  if (!c.name || !c.email || !c.phone || !c.address) return null;
  if (typeof body.totalAmount !== 'number' || body.totalAmount <= 0) return null;
  return body as CreateOrderBody;
}

// Vercel Node 函式 — 使用穩定的 legacy (req, res) 風格
// req / res 用寬鬆型別，避免引入 @vercel/node 型別套件
export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Vercel Node runtime 會自動把 JSON body 解析到 req.body
  const body = validateBody(req.body);
  if (!body) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e: any) {
    console.error('[ecpay/create] supabase init failed', e?.message);
    res.status(500).json({ error: '伺服器設定錯誤', detail: e?.message });
    return;
  }

  // 1. 取得第一個商品的 order_code（用來組訂單編號）
  const firstProductId = body.items[0]?.pageId;
  let orderCode = 'GEN';
  if (firstProductId) {
    const { data: product } = await supabase
      .from('products')
      .select('order_code')
      .eq('id', firstProductId)
      .maybeSingle();
    if (product?.order_code) orderCode = product.order_code;
  }

  // 2. 透過 RPC 產生訂單編號（YYMMDD + code + 流水號）
  const { data: orderId, error: idError } = await supabase
    .rpc('generate_order_id', { p_order_code: orderCode });
  if (idError || typeof orderId !== 'string') {
    console.error('[ecpay/create] generate_order_id failed', idError);
    res.status(500).json({ error: '產生訂單編號失敗' });
    return;
  }

  // 3. 決定本次要扣的金額（有訂金就只扣訂金）
  const hasDeposit =
    typeof body.depositAmount === 'number' &&
    body.depositAmount > 0 &&
    body.depositAmount < body.totalAmount;
  const chargeAmount = hasDeposit ? Math.round(body.depositAmount!) : Math.round(body.totalAmount);
  const tradeDesc = hasDeposit ? '好齡居訂金' : '好齡居線上訂單';

  // 4. 寫入 Supabase（status = UNPAID，等付款 callback）
  const merchantTradeNo = orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  const nowIso = new Date().toISOString();

  const { error: insertError } = await supabase.from('orders').insert({
    id: orderId,
    user_id: body.userId || null,
    items: body.items,
    total_amount: body.totalAmount,
    deposit_amount: body.depositAmount ?? null,
    balance_amount: body.balanceAmount ?? null,
    status: 'UNPAID',
    customer_info: body.customerInfo,
    payment_method: body.paymentMethod || 'ALL',
    merchant_trade_no: merchantTradeNo,
    created_at: nowIso,
  });

  if (insertError) {
    console.error('[ecpay/create] insert order failed', insertError);
    res.status(500).json({ error: '建立訂單失敗', detail: insertError.message });
    return;
  }

  // 5. 產生綠界表單參數
  const siteUrl = (process.env.PUBLIC_SITE_URL || req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : '') || '').replace(/\/$/, '');
  if (!siteUrl) {
    res.status(500).json({ error: 'Missing PUBLIC_SITE_URL and could not determine origin' });
    return;
  }

  const itemName = buildItemName(body.items.map(i => ({ name: i.name, quantity: i.quantity })));

  try {
    const result = createECPayFormParams({
      orderId,
      amount: chargeAmount,
      itemName,
      tradeDesc,
      paymentMethod: mapPaymentMethod(body.paymentMethod),
      customerName: body.customerInfo.name,
      customerEmail: body.customerInfo.email,
      customerPhone: body.customerInfo.phone,
      customerAddr: body.customerInfo.address,
      returnUrl: `${siteUrl}/api/ecpay/callback`,
      clientBackUrl: `${siteUrl}/checkout-success?orderId=${encodeURIComponent(orderId)}`,
    });

    res.status(200).json({
      orderId,
      merchantTradeNo: result.merchantTradeNo,
      apiUrl: result.apiUrl,
      params: result.params,
    });
  } catch (e: any) {
    console.error('[ecpay/create] sign failed', e);
    res.status(500).json({ error: '產生綠界表單失敗', detail: e?.message });
  }
}
