import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, ClipboardCheck, Inbox, BookOpen, Users, Package, DollarSign, ShieldCheck, Image as ImageIcon, Briefcase, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/auth';
import { submissionService } from '../../services/submissionService';
import { formService } from '../../services/formService';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState(0);

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
    if (user.id === '1') return true; // Super admin
    if (permissions.includes('all')) return true;
    return permissions.includes(permission);
  };

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

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>儀表板</span>
        </NavLink>

        {hasPermission('product') && (
          <>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <Package size={20} />
              <span>產品管理</span>
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <DollarSign size={20} />
              <span>訂單管理</span>
            </NavLink>
          </>
        )}

        {hasPermission('page') && (
          <>
            <NavLink
              to="/admin/pages"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <FileText size={20} />
              <span>頁面管理</span>
            </NavLink>
            <NavLink
              to="/admin/navigation"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <LayoutDashboard size={20} />
              <span>導覽列管理</span>
            </NavLink>
          </>
        )}

        {hasPermission('form') && (
          <>
            <NavLink
              to="/admin/appointments"
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <span>預約管理</span>
              </div>
              {pendingAppointments > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pendingAppointments}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/admin/consultations"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <MessageSquare size={20} />
              <span>諮詢紀錄</span>
            </NavLink>
            <NavLink
              to="/admin/forms"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <ClipboardCheck size={20} />
              <span>表單管理</span>
            </NavLink>
          </>
        )}

        {hasPermission('article') && (
          <NavLink
            to="/admin/articles"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
              }`
            }
          >
            <BookOpen size={20} />
            <span>文章管理</span>
          </NavLink>
        )}

        {hasPermission('media') && (
          <NavLink
            to="/admin/media"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
              }`
            }
          >
            <ImageIcon size={20} />
            <span>媒體庫</span>
          </NavLink>
        )}

        {hasPermission('member') && (
          <>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <Users size={20} />
              <span>會員管理</span>
            </NavLink>
            <NavLink
              to="/admin/vendors"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <Briefcase size={20} />
              <span>廠商管理</span>
            </NavLink>
            <NavLink
              to="/admin/permissions"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
                }`
              }
            >
              <ShieldCheck size={20} />
              <span>權限管理</span>
            </NavLink>
          </>
        )}

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive ? 'bg-primary text-white' : 'hover:bg-stone-800'
            }`
          }
        >
          <Settings size={20} />
          <span>系統設定</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-stone-800">
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
