import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vendor } from '../../types/vendor';
import { orderService } from '../../services/orderService';
import { 
  LogOut, Briefcase, ListTodo, ClipboardList, 
  CheckSquare, Users, CreditCard, Settings as SettingsIcon,
  Menu, X, FileText
} from 'lucide-react';

import NewOrders from './components/NewOrders';
import PendingQuoteList from './components/PendingQuoteList';
import AllOrders from './components/AllOrders';
import PendingClosureOrders from './components/PendingClosureOrders';
import StaffManagement from './components/StaffManagement';
import Billing from './components/Billing';
import Settings from './components/Settings';

type Tab = 'new-orders' | 'pending-quotes' | 'all-orders' | 'pending-closure' | 'staff' | 'billing' | 'settings';

export default function VendorDashboard() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pending-quotes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0);

  useEffect(() => {
    const storedVendor = localStorage.getItem('currentVendor');
    if (storedVendor) {
      const parsed = JSON.parse(storedVendor);
      if (parsed.id === vendorId) {
        setVendor(parsed);
      } else {
        navigate('/vendor/login');
      }
    } else {
      navigate('/vendor/login');
    }
  }, [vendorId, navigate]);

  useEffect(() => {
    if (vendor) {
      // Calculate counts
      const allOrders = orderService.getAll();
      const newOrders = allOrders.filter(o => o.status === 'PENDING' && o.vendorId === vendor.id);
      setNewOrdersCount(newOrders.length);

      const pendingQuotes = allOrders.filter(o => 
        (o.status === 'QUOTE_PENDING' || o.status === 'QUOTED') && 
        o.vendorId === vendor.id
      );
      setPendingQuotesCount(pendingQuotes.length);
    }
  }, [vendor, activeTab]); 

  const handleLogout = () => {
    localStorage.removeItem('currentVendor');
    navigate('/vendor/login');
  };

  if (!vendor) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'new-orders': return <NewOrders vendor={vendor} />;
      case 'pending-quotes': return <PendingQuoteList vendor={vendor} />;
      case 'all-orders': return <AllOrders vendor={vendor} />;
      case 'pending-closure': return <PendingClosureOrders vendor={vendor} />;
      case 'staff': return <StaffManagement vendor={vendor} />;
      case 'billing': return <Billing vendor={vendor} />;
      case 'settings': return <Settings vendor={vendor} />;
      default: return <NewOrders vendor={vendor} />;
    }
  };

  const navItems = [
    { id: 'pending-quotes', label: '待報價列表', icon: <FileText size={20} />, badge: pendingQuotesCount },
    { id: 'new-orders', label: '新案列表', icon: <ListTodo size={20} />, badge: newOrdersCount },
    { id: 'all-orders', label: '訂單總表', icon: <ClipboardList size={20} /> },
    { id: 'pending-closure', label: '待結案列表', icon: <CheckSquare size={20} /> },
    { id: 'staff', label: '服務人員管理', icon: <Users size={20} /> },
    { id: 'billing', label: '財務中心', icon: <CreditCard size={20} /> },
    { id: 'settings', label: '帳號設定', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-stone-200 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase className="text-white" size={16} />
          </div>
          <span className="font-bold text-stone-900">{vendor.name}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-stone-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-20 h-screen w-64 bg-white border-r border-stone-200 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-stone-100">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Briefcase className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-stone-900 leading-tight truncate max-w-[140px]">{vendor.name}</h1>
            <p className="text-xs text-stone-500">廠商專屬儀表板</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-colors text-sm
                ${activeTab === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            登出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
