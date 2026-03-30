import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { CreditCard, Truck, User, Phone, MapPin, Mail, ArrowRight, ArrowLeft, CheckCircle2, MessageSquare, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types/admin';
import { orderService } from '../services/orderService';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    lineId: user?.lineId || '',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
    specialRequirements: user?.specialRequirements || '',
    paymentMethod: 'CREDIT_CARD'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 模擬訂單生成
    setTimeout(async () => {
      const mainProductId = cartItems[0]?.pageId || 'unknown';
      const orderId = orderService.generateOrderId(mainProductId);

      const newOrder: Order = {
        id: orderId,
        userId: user?.id || 'guest',
        items: [...cartItems],
        totalAmount: totalPrice,
        status: 'PENDING',
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          lineId: formData.lineId,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          specialRequirements: formData.specialRequirements
        },
        paymentMethod: formData.paymentMethod,
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString()
      };

      // 存入 localStorage
      orderService.create(newOrder);

      // 如果有登入，更新使用者資料
      if (user) {
        try {
          await updateProfile({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            lineId: formData.lineId,
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            specialRequirements: formData.specialRequirements
          });
        } catch (error) {
          console.error('Failed to update user profile:', error);
        }
      }

      // 清空購物車
      clearCart();
      setLoading(false);
      
      // 跳轉至成功頁面
      navigate('/checkout-success', { state: { orderId: newOrder.id } });
    }, 1500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">購物車內無商品</h1>
          <button onClick={() => navigate('/')} className="text-primary font-bold">回到首頁</button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
  const labelClass = "block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Checkout Form */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-stone-900 mb-8">結帳資訊</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Info Section */}
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <User className="text-primary" size={20} />
                  收件人資料
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}><User size={16}/> 姓名</label>
                    <input 
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClass} 
                      placeholder="您的姓名"
                    />
                  </div>
                  <div>
                    <label className={labelClass}><Phone size={16}/> 聯絡電話</label>
                    <input 
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClass} 
                      placeholder="0912-345-678"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}><Mail size={16}/> 電子郵件</label>
                    <input 
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass} 
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}><MapPin size={16}/> 服務地址</label>
                    <input 
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={inputClass} 
                      placeholder="請輸入完整地址"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}><MessageSquare size={16}/> LINE ID (選填)</label>
                    <input 
                      name="lineId"
                      value={formData.lineId}
                      onChange={handleInputChange}
                      className={inputClass} 
                      placeholder="您的 LINE ID"
                    />
                  </div>
                </div>
              </section>

              {/* Other Requirements Section */}
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <ClipboardList className="text-primary" size={20} />
                  其他需求
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}><User size={16}/> 緊急聯絡人姓名 (選填)</label>
                    <input 
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className={inputClass} 
                      placeholder="聯絡人姓名"
                    />
                  </div>
                  <div>
                    <label className={labelClass}><Phone size={16}/> 緊急聯絡人電話 (選填)</label>
                    <input 
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className={inputClass} 
                      placeholder="聯絡人電話"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}><MessageSquare size={16}/> 特殊需求 (選填)</label>
                    <textarea 
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                      className={`${inputClass} h-32 resize-none`} 
                      placeholder="請輸入任何需要我們特別注意的事項..."
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method Section */}
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <CreditCard className="text-primary" size={20} />
                  付款方式
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'CREDIT_CARD' ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="CREDIT_CARD" 
                      checked={formData.paymentMethod === 'CREDIT_CARD'}
                      onChange={handleInputChange}
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'CREDIT_CARD' ? 'border-primary' : 'border-stone-300'}`}>
                      {formData.paymentMethod === 'CREDIT_CARD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-bold text-stone-700">信用卡 / 金融卡</span>
                  </label>
                  
                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'TRANSFER' ? 'border-primary bg-primary/5' : 'border-stone-100 hover:border-stone-200'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="TRANSFER" 
                      checked={formData.paymentMethod === 'TRANSFER'}
                      onChange={handleInputChange}
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'TRANSFER' ? 'border-primary' : 'border-stone-300'}`}>
                      {formData.paymentMethod === 'TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-bold text-stone-700">銀行轉帳</span>
                  </label>
                </div>
              </section>

              <div className="flex items-center justify-between pt-4">
                <button 
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="flex items-center gap-2 text-stone-500 font-bold hover:text-stone-900 transition-colors"
                >
                  <ArrowLeft size={18} />
                  返回購物車
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '處理中...' : '確認下單'}
                  {!loading && <CheckCircle2 size={18} />}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-stone-100 sticky top-24">
              <h2 className="text-xl font-bold text-stone-900 mb-6">訂單摘要</h2>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-stone-800">{item.name}</p>
                      {item.selectedVariant && (
                        <p className="text-[10px] text-stone-400">規格: {item.selectedVariant.name}</p>
                      )}
                      {item.expectedDates && (
                        <p className="text-[10px] text-primary font-bold">期望日期: {item.expectedDates}</p>
                      )}
                      {item.expectedTime && (
                        <p className="text-[10px] text-primary font-bold">期望時段: {item.expectedTime}</p>
                      )}
                      <p className="text-xs text-stone-500">x {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-stone-900">NT$ {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-stone-100 pt-6 space-y-3">
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>小計</span>
                  <span>NT$ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>運費</span>
                  <span className="text-emerald-600 font-bold">免運費</span>
                </div>
                <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-stone-900">總計</span>
                  <span className="text-2xl font-black text-primary">NT$ {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="flex gap-3">
                  <Truck className="text-stone-400 flex-shrink-0" size={20} />
                  <p className="text-xs text-stone-500 leading-relaxed">
                    我們將在確認訂單後 24 小時內與您聯繫，確認具體的服務時間。
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
