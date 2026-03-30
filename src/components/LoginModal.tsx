import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoginTab) {
        await login(email, password);
        onClose();
      } else {
        if (password !== confirmPassword) {
          setError('密碼與確認密碼不一致');
          return;
        }
        await register({ name, email, phone, password });
        onClose();
      }
    } catch (err: any) {
      setError(err.message || (isLoginTab ? '登入失敗，請檢查帳號密碼' : '註冊失敗'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-800">
            {isLoginTab ? '會員登入' : '註冊帳號'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex mb-6 bg-stone-100 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isLoginTab ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              onClick={() => setIsLoginTab(true)}
            >
              登入
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isLoginTab ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              onClick={() => setIsLoginTab(false)}
            >
              註冊
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            {!isLoginTab && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">姓名</label>
                <input
                  type="text"
                  required={!isLoginTab}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all"
                  placeholder="王小明"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all"
                placeholder={isLoginTab ? "admin@nexdo.com" : "ming@gmail.com"}
              />
            </div>

            {!isLoginTab && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">手機號碼</label>
                <input
                  type="tel"
                  required={!isLoginTab}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all"
                  placeholder="0912345678"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">密碼</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all"
                placeholder="888888"
              />
            </div>

            {!isLoginTab && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">確認密碼</label>
                <input
                  type="password"
                  required={!isLoginTab}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all"
                  placeholder="888888"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#8B5E34] text-white rounded-lg font-medium hover:bg-[#7A522D] transition-colors"
            >
              {isLoginTab ? '登入' : '註冊'}
            </button>
          </form>

          {isLoginTab && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-stone-500 hover:text-[#8B5E34]">忘記密碼？</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
