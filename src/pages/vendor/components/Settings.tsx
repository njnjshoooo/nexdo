import React, { useState } from 'react';
import { Vendor } from '../../../types/vendor';
import { Settings as SettingsIcon, Lock, Mail } from 'lucide-react';
import SaveButton from '../../../components/admin/SaveButton';

interface SettingsProps {
  vendor: Vendor;
}

export default function Settings({ vendor }: SettingsProps) {
  const [email, setEmail] = useState(vendor.account || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveEmail = () => {
    if (!email) {
      alert('請輸入 Email');
      return;
    }
    // In a real app, update vendor account/email
    alert('通知 Email 已更新');
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('請填寫所有密碼欄位');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('新密碼與確認密碼不符');
      return;
    }
    // In a real app, update vendor password
    alert('密碼已更新');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <SettingsIcon className="text-primary" size={24} />
          帳號設定
        </h2>
        
        <div className="space-y-8">
          <section>
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Mail className="text-stone-400" size={20} />
              通知 Email 設定
            </h3>
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
              <p className="text-sm text-stone-500 mb-4">此 Email 將用於接收新派案通知與系統重要訊息。</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">通知 Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>
                <SaveButton 
                  status="idle"
                  onClick={handleSaveEmail}
                  label="儲存 Email"
                  className="px-6 py-2"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Lock className="text-stone-400" size={20} />
              修改密碼
            </h3>
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">目前密碼</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">新密碼</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">確認新密碼</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>
                <SaveButton 
                  status="idle"
                  onClick={handleSavePassword}
                  label="更新密碼"
                  className="px-6 py-2 bg-stone-800 hover:bg-stone-900 shadow-stone-800/20"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
