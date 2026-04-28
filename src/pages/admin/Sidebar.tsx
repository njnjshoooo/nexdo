import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, ClipboardCheck, ChevronDown, ChevronRight, BookOpen, Users, Package, DollarSign, ShieldCheck, Image as ImageIcon, Briefcase, Calendar, MessageSquare, Home, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/auth';
import { submissionService } from '../../services/submissionService';
import { formService } from '../../services/formService';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = storedUsers.find((u: User) => u.id === user.id) || user;
      setPermissions(currentUser.permissions || []);
    }
  }, [user]);

  useEffect(() => {
    const checkPending = async () => {
      const allSubmissions = await submissionService.getAll();
      const allForms = formService.getAll();
      const bookingFormIds = allForms.filter(f => f.purpose === 'BOOKING').map(f => f.id);
      
      const pending = allSubmissions.filter(s => 
        bookingFormIds.includes(s.formId) && s.status === 'PENDING'
      ).length;
      
      setPendingAppointments(pending);
    };

    checkPending();
    window.addEventListener('storage', checkPending);
    return () => window.removeEventListener('storage', checkPending);
  }, []);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin role grants all permissions
    if (user.id === '1') return true; // Legacy super admin
    if (permissions.includes('all')) return true;
    return permissions.includes(permission);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // Auto-expand based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/consultations') || path.startsWith('/admin/appointments') || path.startsWith('/admin/orders') || path.startsWith('/admin/finance')) {
      if (!expandedCategories.includes('營運管理')) setExpandedCategories(prev => [...prev, '營運管理']);
    } else if (path.startsWith('/admin/pages') || path.startsWith('/admin/navigation') || path.startsWith('/admin/articles') || path.startsWith('/admin/media')) {
      if (!expandedCategories.includes('內容管理')) setExpandedCategories(prev => [...prev, '內容管理']);
    } else if (path.startsWith('/admin/vendors') || path.startsWith('/admin/users')) {
      if (!expandedCategories.includes('資源管理')) setExpandedCategories(prev => [...prev, '資源管理']);
    } else if (path.startsWith('/admin/settings') || path.startsWith('/admin/permissions')) {
      if (!expandedCategories.includes('系統配置')) setExpandedCategories(prev => [...prev, '系統配置']);
    }
  }, [location.pathname]);

  const navItems = [
    { title: '儀表板', icon: LayoutDashboard, path: '/admin', end: true },
    {
      title: '營運管理',
      icon: Briefcase,
      items: [
        { title: '諮詢紀錄', path: '/admin/consultations', permission: 'form' },
        { title: '預約管理', path: '/admin/appointments', permission: 'form', badge: pendingAppointments },
        { title: '訂單管理', path: '/admin/orders', permission: 'product' },
        { title: '財務結算', path: '/admin/finance', permission: 'member' },
      ]
    },
    { title: '產品管理', icon: Package, path: '/admin/products', permission: 'product' },
    {
      title: '內容管理',
      icon: BookOpen,
      items: [
        { title: '頁面管理', path: '/admin/pages', permission: 'page' },
        { title: '導覽列管理', path: '/admin/navigation', permission: 'page' },
        { title: '文章管理', path: '/admin/articles', permission: 'article' },
        { title: '媒體庫', path: '/admin/media', permission: 'media' },
      ]
    },
    { title: '表單工具', icon: ClipboardCheck, path: '/admin/forms', permission: 'form' },
    {
      title: '資源管理',
      icon: Users,
      items: [
        { title: '廠商管理', path: '/admin/vendors', permission: 'member' },
        { title: '會員管理', path: '/admin/users', permission: 'member' },
      ]
    },
    {
      title: '系統配置',
      icon: Settings,
      items: [
        { title: '系統設定', path: '/admin/settings' },
        { title: '權限管理', path: '/admin/permissions', permission: 'member' },
      ]
    }
  ];

  return (
    <div className="w-64 bg-stone-900 text-stone-300 min-h-screen flex flex-col">
      <div className="p-6 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            好
          </div>
          <span className="text-xl font-bold text-white">後台管理</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;

          if (item.items) {
            const isExpanded = expandedCategories.includes(item.title);
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleCategory(item.title)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isExpanded && (
                  <div className="pl-4 space-y-1 mt-1">
                    {item.items.map((subItem) => {
                      if (subItem.permission && !hasPermission(subItem.permission)) return null;
                      return (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                              isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                            }`
                          }
                        >
                          <span>{subItem.title}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-800 space-y-1">
        <Link 
          to="/"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-stone-800 text-stone-300 transition-colors"
        >
          <Home size={20} />
          <span>返回前台</span>
        </Link>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-stone-800 text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span>登出</span>
        </button>
      </div>
    </div>
  );
}
