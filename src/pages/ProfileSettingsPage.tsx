import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { User, Settings, Save, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';

export default function ProfileSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    lineId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    specialRequirements: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        title: user.title || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        lineId: user.lineId || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        specialRequirements: user.specialRequirements || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '新密碼與確認密碼不相符' });
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        title: formData.title,
        phone: formData.phone,
        address: formData.address,
        lineId: formData.lineId,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        specialRequirements: formData.specialRequirements
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateProfile(updateData);
      
      setMessage({ type: 'success', text: '個人設定已成功更新' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      setMessage({ type: 'error', text: '更新失敗，請稍後再試' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-900 mb-10 flex items-center gap-3">
          <Settings className="text-primary" />
          個人設定
        </h1>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-8 flex items-center gap-3 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold">{message.text}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 帳號安全 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
          >
            <div className="flex items-center gap-2 text-stone-900 mb-6">
              <Lock size={20} className="text-primary" />
              <h2 className="text-xl font-bold">帳號安全</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>電子郵件 (帳號)</Label>
                <Input 
                  type="email" 
                  value={formData.email}
                  disabled
                />
                <p className="text-xs text-stone-400 mt-2">電子郵件作為登入帳號，無法修改</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>新密碼</Label>
                  <Input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="若不修改請留白"
                  />
                </div>
                <div>
                  <Label>確認新密碼</Label>
                  <Input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="再次輸入新密碼"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 基本資料 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
          >
            <div className="flex items-center gap-2 text-stone-900 mb-6">
              <User size={20} className="text-primary" />
              <h2 className="text-xl font-bold">基本資料</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>姓名 <span className="text-red-500">*</span></Label>
                <Input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>稱謂</Label>
                <Select 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                >
                  <option value="">請選擇稱謂</option>
                  <option value="先生">先生</option>
                  <option value="小姐">小姐</option>
                  <option value="女士">女士</option>
                </Select>
              </div>
              <div>
                <Label>聯絡電話</Label>
                <Input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>LINE ID</Label>
                <Input 
                  type="text" 
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label>聯絡地址</Label>
                <Input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.div>

          {/* 緊急聯絡人與其他資訊 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100"
          >
            <div className="flex items-center gap-2 text-stone-900 mb-6">
              <AlertCircle size={20} className="text-primary" />
              <h2 className="text-xl font-bold">緊急聯絡人與其他資訊</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>緊急聯絡人姓名</Label>
                <Input 
                  type="text" 
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>緊急聯絡人電話</Label>
                <Input 
                  type="tel" 
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label>特殊需求或備註</Label>
                <Textarea 
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <Button 
              type="submit"
              isLoading={isSaving}
              size="lg"
            >
              {!isSaving && <Save size={20} />}
              儲存設定
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
