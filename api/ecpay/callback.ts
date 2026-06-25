import { verifyECPayCallback, parseECPayDate } from '../_lib/ecpay.js';
import { getSupabaseAdmin } from '../_lib/supabase-admin.js';
import { sendOrderPaidEmails, sendOrderFailedEmails } from '../_lib/email.js';

// 綠界 PaymentType 對映成中文（給通知信用）
function paymentTypeLabel(t: string | undefined): string {
  if (!t) return '-';
  if (t.startsWith('Credit')) return '信用卡';
  if (t.startsWith('WebATM')) return '網路 ATM';
  if (t.startsWith('ATM')) return 'ATM 虛擬帳號';
  if (t.startsWith('CVS')) return '超商代碼';
  if (t.startsWith('BARCODE')) return '超商條碼';
  if (t.startsWith('ApplePay')) return 'Apple Pay';
  if (t.startsWith('GooglePay')) return 'Google Pay';
  return t;
}

// 綠界要求回 plain text "1|OK"（200）才會停止重試
// 即使失敗也回 200 plain text，避免無限重送
function sendPlainText(res: any, body: string): void {
  res.status(200).setHeader('content-type', 'text/plain').send(body);
}

// 把 Vercel 自動解析的 form body（或 raw string）統一轉成 Record<string,string>
function normalizeBody(body: unknown): Record<string, string> {
  // application/x-www-form-urlencoded → Vercel 會解析成 object
  if (body && typeof body === 'object') {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      out[k] = typeof v === 'string' ? v : String(v ?? '');
    }
    return out;
  }
  // 若收到的是 raw string，自己 parse
  if (typeof body === 'string') {
    const params = new URLSearchParams(body);
    const out: Record<string, string> = {};
    params.forEach((v, k) => { out[k] = v; });
    return out;
  }
  return {};
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    sendPlainText(res, '0|MethodNotAllowed');
    return;
  }

  const params = normalizeBody(req.body);

  // 1. 驗簽
  if (!verifyECPayCallback(params)) {
    console.error('[ecpay/callback] signature verification failed', {
      MerchantTradeNo: params.MerchantTradeNo,
      RtnCode: params.RtnCode,
      hasCheckMacValue: !!params.CheckMacValue,
    });
    sendPlainText(res, '0|SignatureFailed');
    return;
  }

  const {
    MerchantTradeNo,
    TradeNo,
    RtnCode,
    RtnMsg,
    PaymentType,
    PaymentDate,
    TradeAmt,
  } = params;

  if (!MerchantTradeNo) {
    sendPlainText(res, '0|MissingTradeNo');
    return;
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e: any) {
    console.error('[ecpay/callback] supabase init failed', e?.message);
    sendPlainText(res, '0|ServerConfigError');
    return;
  }

  // 2. 對應到 orders（用 merchant_trade_no）
  // 同時取出原本的 ecpay_rtn_code 判斷是否首次收到 callback
  const { data: order, error: lookupError } = await supabase
    .from('orders')
    .select('id, status, total_amount, deposit_amount, items, customer_info, ecpay_rtn_code')
    .eq('merchant_trade_no', MerchantTradeNo)
    .maybeSingle();

  if (lookupError) {
    console.error('[ecpay/callback] order lookup failed', lookupError);
    sendPlainText(res, '0|DBLookupFailed');
    return;
  }
  if (!order) {
    console.error('[ecpay/callback] order not found', MerchantTradeNo);
    // 即使找不到也回 1|OK 避免綠界一直重試
    sendPlainText(res, '1|OK');
    return;
  }

  const rtnCodeNum = Number(RtnCode);
  const isPaid = rtnCodeNum === 1;
  const paymentDateIso = parseECPayDate(PaymentDate);

  const updatePayload: Record<string, unknown> = {
    ecpay_trade_no: TradeNo || null,
    ecpay_payment_type: PaymentType || null,
    ecpay_rtn_code: rtnCodeNum || null,
    ecpay_rtn_msg: RtnMsg || null,
    ecpay_payment_date: paymentDateIso,
    ecpay_callback_raw: params,
    ecpay_callback_received_at: new Date().toISOString(),
  };

  if (isPaid) {
    // 只在「還沒標記為已付款」時才轉狀態 + 寄信，避免綠界重試導致重複寄信
    if (order.status !== 'PENDING' && order.status !== 'WAITING_BALANCE') {
      updatePayload.status = 'PENDING';
      updatePayload.paid_at = paymentDateIso || new Date().toISOString();
      updatePayload.payment_method = paymentTypeLabel(PaymentType);
    }
  } else {
    console.warn('[ecpay/callback] payment failed', { MerchantTradeNo, RtnCode, RtnMsg });
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', order.id);

  if (updateError) {
    console.error('[ecpay/callback] update order failed', updateError);
    sendPlainText(res, '0|UpdateFailed');
    return;
  }

  // 3. 寄通知信 — 區分成功 / 失敗，並做 idempotency
  const customerInfo = (order.customer_info || {}) as {
    name?: string;
    email?: string;
    phone?: string;
  };
  const items = Array.isArray(order.items) ? order.items : [];
  const amount = Number(TradeAmt) || order.deposit_amount || order.total_amount;

  if (isPaid) {
    // 只在「還沒標記為已付款」時寄成功信，避免綠界重試重複寄
    const wasJustPaid = order.status === 'UNPAID';
    if (wasJustPaid && customerInfo.email) {
      sendOrderPaidEmails({
        orderId: order.id,
        customerName: customerInfo.name || '',
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        amount,
        paymentType: paymentTypeLabel(PaymentType),
        paymentDate: PaymentDate,
        items,
      }).catch(e => console.error('[ecpay/callback] sendOrderPaidEmails failed', e));
    }
  } else {
    // 只在「首次收到失敗 callback」時寄失敗信
    // 判斷依據：原本資料庫的 ecpay_rtn_code 還是 null（沒收過任何 callback）
    const isFirstCallback = order.ecpay_rtn_code === null || order.ecpay_rtn_code === undefined;
    if (isFirstCallback && customerInfo.email) {
      sendOrderFailedEmails({
        orderId: order.id,
        customerName: customerInfo.name || '',
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        amount,
        paymentType: paymentTypeLabel(PaymentType),
        items,
        failureCode: RtnCode,
        failureReason: RtnMsg,
      }).catch(e => console.error('[ecpay/callback] sendOrderFailedEmails failed', e));
    }
  }

  sendPlainText(res, '1|OK');
}
