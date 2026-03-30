import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || 'N/A';

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-stone-200/50 p-12 text-center border border-stone-100"
      >
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="text-emerald-500 w-12 h-12" />
        </div>
        
        <h1 className="text-3xl font-bold text-stone-900 mb-2">下單成功！</h1>
        <p className="text-stone-500 mb-8">感謝您的訂購，我們已收到您的需求。</p>
        
        <div className="bg-stone-50 p-6 rounded-2xl mb-10 border border-stone-100">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">訂單編號</p>
          <p className="text-xl font-mono font-bold text-stone-800">{orderId}</p>
        </div>
        
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
          稍後將有專人與您聯繫確認細節
        </p>
      </motion.div>
    </div>
  );
}
