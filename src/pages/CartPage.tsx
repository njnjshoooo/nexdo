import React from 'react';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingCart className="text-stone-400 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">您的購物車是空的</h1>
          <p className="text-stone-500 mb-10">快去探索我們的優質服務吧！</p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all"
          >
            <ArrowLeft size={18} />
            回到首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-900 mb-10 flex items-center gap-3">
          <ShoppingCart className="text-primary" />
          您的購物車
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-6"
              >
                <div className="w-24 h-24 bg-stone-100 rounded-2xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <ShoppingCart size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-stone-900 mb-1">{item.name}</h3>
                  {item.selectedVariant && (
                    <p className="text-stone-500 text-xs mb-1">規格: {item.selectedVariant.name}</p>
                  )}
                  {item.expectedDates && (
                    <p className="text-primary text-xs font-bold mb-1">期望日期: {item.expectedDates}</p>
                  )}
                  {item.expectedTime && (
                    <p className="text-primary text-xs font-bold mb-2">期望時段: {item.expectedTime}</p>
                  )}
                  <p className="text-stone-500 text-sm mb-2">單價: NT$ {item.price.toLocaleString()} / {item.unit}</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-stone-900 font-bold w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-stone-900 mb-4">
                    NT$ {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-stone-100 sticky top-24">
              <h2 className="text-xl font-bold text-stone-900 mb-6">訂單摘要</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-stone-500">
                  <span>小計</span>
                  <span>NT$ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>運費 / 服務費</span>
                  <span>NT$ 0</span>
                </div>
                <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-stone-900">總計</span>
                  <span className="text-2xl font-black text-primary">NT$ {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                前往結帳
                <ArrowRight size={18} />
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full mt-4 py-4 bg-stone-50 text-stone-600 rounded-2xl font-bold hover:bg-stone-100 transition-all"
              >
                繼續購物
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
