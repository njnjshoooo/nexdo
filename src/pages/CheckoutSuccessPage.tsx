import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Package, Home, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { orderService } from '../services/orderService';
import { Order } from '../types/admin';

type PageState = 'loading' | 'paid' | 'unpaid' | 'failed' | 'unknown';

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 綠界跳回時用 query string；保留 state fallback 給其他場景
  const orderId = searchParams.get('orderId') || (location.state as any)?.orderId || '';
  const [pageState, setPageState] = useState<PageState>('loading');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) {
      setPageState('unknown');
      return;
    }

    let cancelled = false;
    let pollCount = 0;
    const MAX_POLLS = 6; // 約 30 秒，等綠界 callback 進來

    const fetchOrder = async () => {
      try {
        const o = await orderService.getById(orderId);
        if (cancelled) return;
        if (!o) {
          setPageState('unknown');
          return;
        }
        setOrder(o);

        // 已付款 → 顯示成功
        if (o.status === 'PENDING' || o.status === 'ACTIVE' || o.status === 'WAITING_BALANCE' || o.status === 'BALANCE_PAID' || o.status === 'COMPLETED') {
          setPageState('paid');
          return;
        }

        // 還是 UNPAID：可能是 ATM / 超商代碼還沒繳，或 callback 還沒到
        if (o.status === 'UNPAID') {
          // 信用卡通常 callback 很快，多 poll 幾次再放棄
          if (pollCount < MAX_POLLS) {
            pollCount++;
            setTimeout(fetchOrder, 5000);
            return;
          }
          setPageState('unpaid');
          return;
        }

        if (o.status === 'CANCELLED' || o.status === 'REFUND_PENDING' || o.status === 'REFUNDED') {
          setPageState('failed');
          return;
        }

        setPageState('paid'); // 其他狀態視為已處理
      } catch (e) {
        console.error('CheckoutSuccess fetch failed', e);
        if (!cancelled) setPageState('unknown');
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const renderContent = () => {
    if (pageState === 'loading') {
      return (
        <>
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Loader2 className="text-stone-400 w-12 h-12 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">確認付款中…</h1>
          <p className="text-stone-500 mb-8">正在向綠界確認您的付款結果</p>
        </>
      );
    }

    if (pageState === 'paid') {
      return (
        <>
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-emerald-500 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">付款成功！</h1>
          <p className="text-stone-500 mb-8">感謝您的訂購，付款已完成，確認信將寄至您的信箱。</p>
        </>
      );
    }

    if (pageState === 'unpaid') {
      return (
        <>
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Clock className="text-amber-500 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">訂單已建立，等待付款</h1>
          <p className="text-stone-500 mb-8">
            若您選擇 ATM 或超商代碼，請於期限內前往繳費；款項入帳後我們會以 Email 通知您。
          </p>
        </>
      );
    }

    if (pageState === 'failed') {
      return (
        <>
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="text-red-500 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">訂單未完成</h1>
          <p className="text-stone-500 mb-8">這筆訂單已取消或退款；如有疑問請與我們聯繫。</p>
        </>
      );
    }

    return (
      <>
        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="text-stone-400 w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">查不到訂單</h1>
        <p className="text-stone-500 mb-8">請從會員中心查看您的訂單記錄，或與我們聯繫。</p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 pt-32 pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-stone-200/50 p-12 text-center border border-stone-100"
      >
        {renderContent()}

        {orderId && (
          <div className="bg-stone-50 p-6 rounded-2xl mb-10 border border-stone-100">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">訂單編號</p>
            <p className="text-xl font-mono font-bold text-stone-800">{orderId}</p>
            {order?.totalAmount ? (
              <p className="text-sm text-stone-500 mt-2">
                訂單金額 NT$ {order.totalAmount.toLocaleString()}
              </p>
            ) : null}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => navigate('/profile/orders')}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
          >
            <Package size={18} />
            查看我的訂單
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white text-stone-600 border border-stone-200 rounded-2xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            回到首頁
          </button>
        </div>

        <p className="mt-8 text-sm text-stone-400">
          稍後將有專人與您聯繫確認服務細節
        </p>
      </motion.div>
    </div>
  );
}
