import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, ShoppingCart, ChevronDown, ChevronUp, User as UserIcon, Settings, LogOut, Shield, Package, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // 🎯 引入總水管
import { navigationService } from '../services/navigationService';
import { HEADER_ITEMS } from '../data/header';
import { pageService } from '../services/pageService';
import { NavItem } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import LoginModal from './LoginModal';
import { headerData } from '../data/settings/headerData';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [settings, setSettings] = useState(headerData);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminLink, setShowAdminLink] = useState(false); // 🎯 控制後台入口顯示
  
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 1. 載入網頁 Header 設定（Logo、高度等）
  useEffect(() => {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      try { setSettings(JSON.parse(saved).header); } catch {}
    }
    
    import('../services/siteSettingsService').then(({ siteSettingsService }) => {
      siteSettingsService.load().then((remote: any) => {
        if (remote?.header) setSettings(remote.header);
      }).catch(() => {});
    });
  }, []);

  // 2. 點擊空白處關閉會員選單 & 監聽滾動樣式
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 20);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 3. 獲取動態導覽列選單
  useEffect(() => {
    const pages = pageService.getAll();
    const resolvedSettings = navigationService.getResolvedSettings(pages);
    setNavItems(resolvedSettings.items?.length ? resolvedSettings.items : HEADER_ITEMS);
  }, []);

  // 4. 🎯 新的管理員權限判定：只看 admin_permission 表格
  useEffect(() => {
    const checkAdminPermission = async () => {
      if (!isAuthenticated || !user?.id) {
        setShowAdminLink(false);
        return;
      }

      try {
        if (user.email === 'admin@nexdo.com') {
          setShowAdminLink(true);
          return;
        }

        const { data } = await supabase
          .from('admin_permission')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        // 只要能查到資料且角色是 admin，就認定是後台人員
        setShowAdminLink(!!(data && data.role === 'admin'));
      } catch (err) {
        setShowAdminLink(false);
      }
    };

    checkAdminPermission();
  }, [user, isAuthenticated]);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const serviceCategories = navItems.find(item => item.id === 'nav-services')?.children || [];
  const headerBgClass = isServicesOpen 
    ? 'bg-[#4A5D3B] text-white' 
    : scrolled ? 'bg-warm-bg/90 backdrop-blur-md text-stone-800 shadow-sm' : 'bg-transparent text-stone-800';

  return (
    <>
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${isServicesOpen ? 'border-[#4A5D3B]' : scrolled ? 'border-stone-200' : 'border-transparent'} ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2" onClick={() => { window.scrollTo(0, 0); setIsServicesOpen(false); }}>
            {isServicesOpen && settings.whiteLogo ? (
              <img src={settings.whiteLogo} alt="Logo" className="object-contain" style={{ height: settings.logoHeight ? `${settings.logoHeight}px` : '48px' }} />
            ) : settings.logo ? (
              <img src={settings.logo} alt="Logo" className="object-contain" style={{ height: settings.logoHeight ? `${settings.logoHeight}px` : '48px' }} />
            ) : (
              <>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${isServicesOpen ? 'bg-white text-[#4A5D3B]' : 'bg-primary text-white'}`}>好</div>
                <span className={`text-xl font-bold tracking-wide ${isServicesOpen ? 'text-white' : 'text-primary'}`}>好好齡居 NEXDO</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                {item.children?.length ? (
                  <button onClick={() => setIsServicesOpen(!isServicesOpen)} className={`flex items-center gap-1 font-medium text-sm lg:text-base ${isServicesOpen ? 'text-white' : 'text-stone-600'}`}>
                    {item.label}
                    {isServicesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                ) : (
                  <Link to={item.url} target={item.openInNewWindow ? '_blank' : undefined} onClick={() => setIsServicesOpen(false)} className={`font-medium text-sm lg:text-base ${isServicesOpen ? 'text-white' : 'text-stone-600'}`}>{item.label}</Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <input 
                type="text" placeholder="搜尋..." 
                className={`w-28 focus:w-40 transition-all duration-300 pl-3 pr-8 py-1 rounded-full border text-sm ${isServicesOpen ? 'bg-white/10 border-white/20 text-white' : 'bg-stone-100 border-transparent'}`}
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                    setIsServicesOpen(false);
                  }
                }}
              />
              <Search size={16} className={`absolute right-2 top-1.5 ${isServicesOpen ? 'text-white' : 'text-stone-400'}`} />
            </div>
            
            <Link to="/cart" onClick={() => setIsServicesOpen(false)} className={`relative ${isServicesOpen ? 'text-white' : 'text-stone-600'}`}>
              <ShoppingCart size={20} />
              {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}
            </Link>
            
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${isServicesOpen ? 'bg-[#F5F0EB] text-[#4A5D3B]' : 'bg-primary text-white'}`}>
                  <UserIcon size={18} />
                  <span>{user?.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-stone-100">
                      <div className="px-4 py-2 border-b border-stone-100 mb-2">
                        <p className="text-sm font-medium text-stone-800 truncate">{user?.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                      </div>
                      
                      {/* 🎯 改用 showAdminLink 判斷後台入口 */}
                      {showAdminLink && (
                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-primary"><Shield size={16} />進入後台</Link>
                      )}
                      
                      <Link to="/profile/orders" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-primary"><Package size={16} />我的訂單</Link>
                      <Link to="/profile/reservations" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-primary"><Calendar size={16} />我的預約</Link>
                      <Link to="/profile/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-primary"><Settings size={16} />個人設定</Link>
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} />登出</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className={`px-6 py-2 rounded-full font-medium ${isServicesOpen ? 'bg-[#F5F0EB] text-[#4A5D3B]' : 'bg-primary text-white'}`}>會員登入</button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => { setIsMenuOpen(!isMenuOpen); if (isMenuOpen) setActiveSubMenu(null); }} className={`p-2 ${isServicesOpen ? 'text-white' : 'text-stone-600'}`}>{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>

      {/* Mega Menu for Services */}
      <AnimatePresence>
        {isServicesOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="hidden md:block bg-[#4A5D3B] text-white overflow-hidden border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
              <div className="max-w-5xl mx-auto flex justify-center">
                <div className="w-full grid grid-cols-3 gap-y-10 md:grid-cols-6 gap-x-6 text-left">
                  {serviceCategories.map((category) => (
                    <div key={category.id} className="space-y-4">
                      {category.url && category.url !== '#' ? (
                        <Link to={category.url} target={category.openInNewWindow ? '_blank' : undefined} className="text-lg font-bold text-white hover:text-white/80 block mb-6" onClick={() => setIsServicesOpen(false)}>{category.label}</Link>
                      ) : (
                        <h3 className="text-lg font-bold text-white mb-6">{category.label}</h3>
                      )}
                      {category.children?.length > 0 && (
                        <ul className="space-y-3 flex flex-col items-start pt-2">
                          {category.children.map((item) => (
                            <li key={item.id}>
                              <Link to={item.url} target={item.openInNewWindow ? '_blank' : undefined} className="text-sm font-medium text-white/80 hover:text-white block" onClick={() => setIsServicesOpen(false)}>{item.label}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-stone-100 overflow-hidden shadow-xl">
            <div className="relative overflow-hidden min-h-[400px]">
              <AnimatePresence mode="wait">
                {!activeSubMenu ? (
                  <motion.div key="main-menu" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ type: 'tween', duration: 0.3 }} className="px-4 pt-2 pb-6 space-y-1">
                    {navItems.map((item) => (
                      <div key={`nav-item-${item.id}`}>
                        {item.children?.length ? (
                          <button type="button" onClick={() => setActiveSubMenu(item.id)} className="w-full flex items-center justify-between px-3 py-4 text-lg font-bold text-stone-700 hover:bg-stone-50 rounded-xl">
                            <span>{item.label}</span>
                            <ChevronDown size={20} className="-rotate-90 text-stone-400" />
                          </button>
                        ) : (
                          <Link to={item.url} target={item.openInNewWindow ? '_blank' : undefined} className="block px-3 py-4 text-lg font-bold text-stone-700 hover:text-primary hover:bg-stone-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>{item.label}</Link>
                        )}
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-stone-100 mt-2">
                      {isAuthenticated ? (
                        <div className="space-y-2">
                          <div className="px-4 py-3 bg-stone-50 rounded-xl mb-2">
                            <p className="text-sm font-bold text-stone-800">{user?.name}</p>
                            <p className="text-xs text-stone-500">{user?.email}</p>
                          </div>
                          <Link to="/profile/orders" className="w-full flex items-center gap-3 px-4 py-4 text-stone-700 hover:bg-stone-50 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}><Package size={20} className="text-stone-400" />我的訂單</Link>
                          <Link to="/profile/reservations" className="w-full flex items-center gap-3 px-4 py-4 text-stone-700 hover:bg-stone-50 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}><Calendar size={20} className="text-stone-400" />我的預約</Link>
                          
                          {/* 🎯 手機版改用 showAdminLink 判斷後台入口 */}
                          {showAdminLink && (
                            <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-4 text-stone-700 hover:bg-stone-50 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}><Shield size={20} className="text-primary" />進入後台</Link>
                          )}
                          
                          <Link to="/profile/settings" className="w-full flex items-center gap-3 px-4 py-4 text-stone-700 hover:bg-stone-50 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}><Settings size={20} className="text-stone-400" />個人設定</Link>
                          <button onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 rounded-xl font-bold"><LogOut size={20} />登出</button>
                        </div>
                      ) : (
                        <button onClick={() => { setIsMenuOpen(false); setIsLoginModalOpen(true); }} className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-4 rounded-xl font-bold shadow-md">會員登入</button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="sub-menu" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} transition={{ type: 'tween', duration: 0.3 }} className="flex flex-col h-full">
                    <div className="px-4 py-4 border-b border-stone-100 sticky top-0 bg-white z-10 flex items-center">
                      <button type="button" onClick={() => setActiveSubMenu(null)} className="flex items-center gap-2 text-primary font-bold py-2 px-1"><ChevronDown size={20} className="rotate-90" />返回主選單</button>
                      {(() => {
                        const parent = navItems.find(i => i.id === activeSubMenu);
                        return parent?.url && parent.url !== '#' 
                          ? <Link to={parent.url} className="ml-4 text-lg font-black text-stone-800" onClick={() => { setIsMenuOpen(false); setActiveSubMenu(null); }}>{parent.label}</Link>
                          : <h2 className="ml-4 text-lg font-black text-stone-800">{parent?.label}</h2>;
                      })()}
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[70vh] px-4 py-6 space-y-8">
                      {navItems.find(i => i.id === activeSubMenu)?.children?.map((cat) => (
                        <div key={`nav-child-${cat.id}`} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            {cat.url && cat.url !== '#' 
                              ? <Link to={cat.url} target={cat.openInNewWindow ? '_blank' : undefined} className="text-base font-black text-stone-900" onClick={() => { setIsMenuOpen(false); setActiveSubMenu(null); }}>{cat.subtitle ? `${cat.subtitle}｜${cat.label}` : cat.label}</Link>
                              : <h3 className="text-base font-black text-stone-900">{cat.subtitle ? `${cat.subtitle}｜${cat.label}` : cat.label}</h3>}
                          </div>
                          <div className="grid grid-cols-1 gap-1 pl-4">
                            {cat.children?.length ? cat.children.map(sub => (
                              <Link key={`nav-subchild-${sub.id}`} to={sub.url} target={sub.openInNewWindow ? '_blank' : undefined} className="block py-3 px-4 text-stone-600 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors font-medium" onClick={() => { setIsMenuOpen(false); setActiveSubMenu(null); }}>{sub.label}</Link>
                            )) : cat.url && cat.url !== '#' && (
                              <Link to={cat.url} target={cat.openInNewWindow ? '_blank' : undefined} className="block py-3 px-4 text-stone-600 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors font-medium" onClick={() => { setIsMenuOpen(false); setActiveSubMenu(null); }}>查看全部 {cat.label}</Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    <AnimatePresence>
      {isServicesOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/10 z-40" onClick={() => setIsServicesOpen(false)} />}
    </AnimatePresence>
    <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
