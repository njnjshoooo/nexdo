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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <ModalTitle>
          {isLoginTab ? '會員登入' : '註冊帳號'}
        </ModalTitle>
      </ModalHeader>

      <ModalContent className="p-6">
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
              <Label className="mb-1">姓名</Label>
              <Input
                type="text"
                required={!isLoginTab}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="王小明"
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
              placeholder={isLoginTab ? "admin@nexdo.com" : "ming@gmail.com"}
            />
          </div>

          {!isLoginTab && (
            <div>
              <Label className="mb-1">手機號碼</Label>
              <Input
                type="tel"
                required={!isLoginTab}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
              />
            </div>
          )}
          
          <div>
            <Label className="mb-1">密碼</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="888888"
            />
          </div>

          {!isLoginTab && (
            <div>
              <Label className="mb-1">確認密碼</Label>
              <Input
                type="password"
                required={!isLoginTab}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="888888"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
          >
            {isLoginTab ? '登入' : '註冊'}
          </Button>
        </form>

        {isLoginTab && (
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-stone-500 hover:text-[#8B5E34]">忘記密碼？</a>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
