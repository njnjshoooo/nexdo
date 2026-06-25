import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Modal, ModalContent, ModalHeader, ModalTitle } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (activeTab === 'login') {
        await login(email, password);
        onClose();
      } else if (activeTab === 'register') {
        if (password !== confirmPassword) {
          setError('密碼與確認密碼不一致');
          return;
        }
        await register({ name, email, phone, password });
        onClose();
      } else if (activeTab === 'forgot') {
        // Implement forgot password
        setSuccess('已發送重設密碼信件至您的 Email');
        setTimeout(() => setActiveTab('login'), 3000);
      }
    } catch (err: any) {
      let msg = err.message || '';
      if (msg === 'Invalid login credentials') {
        msg = '登入失敗，請檢查帳號密碼是否正確';
      }
      setError(msg || (activeTab === 'login' ? '登入失敗，請檢查帳號密碼' : '處理失敗'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <ModalTitle>
          {activeTab === 'login' ? '會員登入' : activeTab === 'register' ? '註冊帳號' : '忘記密碼'}
        </ModalTitle>
      </ModalHeader>

      <ModalContent className="p-6">
        {activeTab !== 'forgot' && (
          <div className="flex mb-6 bg-stone-100 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'login' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
            >
              登入
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'register' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            >
              註冊
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
              {success}
            </div>
          )}
          
          {activeTab === 'register' && (
            <div>
              <Label className="mb-1">姓名</Label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="王小明"
                className="placeholder:text-stone-300"
              />
            </div>
          )}

          <div>
            <Label className="mb-1">Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeTab === 'login' ? "" : "ming@gmail.com"}
              className={activeTab !== 'login' ? "placeholder:text-stone-300" : ""}
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <Label className="mb-1">手機號碼</Label>
              <Input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="placeholder:text-stone-300"
              />
            </div>
          )}
          
          {activeTab !== 'forgot' && (
            <div>
              <Label className="mb-1">密碼</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
              />
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <Label className="mb-1">確認密碼</Label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
          >
            {activeTab === 'login' ? '登入' : activeTab === 'register' ? '註冊' : '重設密碼'}
          </Button>
        </form>

        {activeTab === 'login' && (
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={() => { setActiveTab('forgot'); setError(''); setSuccess(''); }}
              className="text-sm text-stone-500 hover:text-[#8B5E34]"
            >
              忘記密碼？
            </button>
          </div>
        )}
        
        {activeTab === 'forgot' && (
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
              className="text-sm text-stone-500 hover:text-[#8B5E34]"
            >
              返回登入
            </button>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
