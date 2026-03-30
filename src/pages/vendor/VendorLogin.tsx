import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Building2, User, Phone, Mail, MapPin, FileText, ArrowLeft } from 'lucide-react';

export default function VendorLogin() {
  const [activeTab, setActiveTab] = useState<'join' | 'login'>('join');
  const navigate = useNavigate();

  // Login Form State
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Join Form State
  const [joinForm, setJoinForm] = useState({
    name: '',
    taxId: '',
    contactName: '',
    jobTitle: '',
    phone: '',
    extension: '',
    email: '',
    address: '',
    motivation: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const defaultVendors = [
      {
        id: 'tidyman',
        name: '居家整聊室',
        taxId: '88888888',
        type: '居家整聊',
        contactName: '賴芝芝',
        jobTitle: '課程顧問',
        phone: '02-8888-8888',
        extension: '888',
        address: '台北市信義區松德路',
        account: 'tidyman@tidyman.com',
        password: '888888',
        status: 'active',
        certifications: [],
        billingCycle: 'monthly',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'hobbystudio',
        name: '習慣健康國際',
        taxId: '82977822',
        type: '樂齡健康',
        contactName: '林阿茹',
        jobTitle: '課程顧問',
        phone: '02-2222-2222',
        extension: '222',
        address: '台北市大同區長安西路',
        account: 'hobbystudio@hobbystudio.com',
        password: '222222',
        status: 'active',
        certifications: [],
        billingCycle: 'monthly',
        createdAt: '2026-03-24T00:00:00Z',
        updatedAt: '2026-03-24T00:00:00Z',
      }
    ];

    const storedVendors = localStorage.getItem('vendors');
    const vendors = storedVendors ? JSON.parse(storedVendors) : defaultVendors;
    
    const vendor = vendors.find((v: any) => v.account === account && v.password === password);
    
    if (vendor) {
      if (vendor.status !== 'active') {
        setLoginError('您的帳號目前非合作狀態，請聯繫管理員。');
        return;
      }
      // Store logged in vendor info
      localStorage.setItem('currentVendor', JSON.stringify(vendor));
      navigate(`/vendor/${vendor.id}`);
      return;
    }
    
    setLoginError('帳號或密碼錯誤');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    alert('加盟申請已送出！管理員將會盡快與您聯繫。');
    setJoinForm({
      name: '',
      taxId: '',
      contactName: '',
      jobTitle: '',
      phone: '',
      extension: '',
      email: '',
      address: '',
      motivation: ''
    });
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          <Link to="/" className="flex items-center gap-2 text-stone-600 hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">返回首頁</span>
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              好
            </div>
            <span className="text-lg font-bold text-stone-900">好齡居 NEXDO</span>
          </div>
          <div className="w-24"></div> {/* Spacer to balance the header */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Briefcase className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-stone-900">廠商專區</h2>
          <p className="mt-2 text-stone-500">歡迎加入好齡居專業服務團隊</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-stone-100">
          
          {/* Tabs */}
          <div className="flex border-b border-stone-200 mb-8">
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'join' ? 'text-primary' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              我想加盟
              {activeTab === 'join' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'login' ? 'text-primary' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              廠商登入
              {activeTab === 'login' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          </div>

          {/* Join Form */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-6">
              <div className="bg-stone-50 p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <Building2 size={18} className="text-primary" />
                  基本資訊
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">廠商名稱 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={joinForm.name}
                      onChange={e => setJoinForm({...joinForm, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">統一編號 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={joinForm.taxId}
                      onChange={e => setJoinForm({...joinForm, taxId: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  聯繫資訊
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">窗口姓名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={joinForm.contactName}
                      onChange={e => setJoinForm({...joinForm, contactName: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">職稱 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={joinForm.jobTitle}
                      onChange={e => setJoinForm({...joinForm, jobTitle: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">聯絡電話 <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={joinForm.phone}
                      onChange={e => setJoinForm({...joinForm, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">分機</label>
                    <input
                      type="text"
                      value={joinForm.extension}
                      onChange={e => setJoinForm({...joinForm, extension: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">聯絡信箱 <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={joinForm.email}
                      onChange={e => setJoinForm({...joinForm, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">公司地址 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={joinForm.address}
                      onChange={e => setJoinForm({...joinForm, address: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  其他
                </h3>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">加盟動機</label>
                  <textarea
                    rows={3}
                    value={joinForm.motivation}
                    onChange={e => setJoinForm({...joinForm, motivation: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="請簡述您希望加入好齡居的原因..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                送出申請
              </button>
            </form>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">管理者帳號</label>
                <input
                  type="text"
                  required
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="請輸入帳號或信箱"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">密碼</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="請輸入密碼"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                登入
              </button>
            </form>
          )}

        </div>
      </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 text-center text-sm mt-auto">
        <p>© 2026 好齡居 NEXDO. All rights reserved.｜讓每個家都充滿愛與關懷</p>
      </footer>
    </div>
  );
}
