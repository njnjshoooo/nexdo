import React, { useState, useEffect } from 'react';
import { headerData } from '../../data/settings/headerData';
import { footerData } from '../../data/settings/footerData';
import ImageUploader from '../../components/admin/ImageUploader';
import { allInitialPages } from '../../data/pages';
import { siteSettingsService } from '../../services/siteSettingsService';

import SaveButton from '../../components/admin/SaveButton';

export default function SystemSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.footer && parsed.footer.menuGroups && parsed.footer.menuGroups.length < footerData.menuGroups.length) {
          parsed.footer.menuGroups = [
            ...parsed.footer.menuGroups,
            ...footerData.menuGroups.slice(parsed.footer.menuGroups.length)
          ];
        }
        return parsed;
      } catch {}
    }
    return { header: headerData, footer: footerData };
  });

  // 進入頁面時主動從 Supabase 拉最新設定，覆蓋本地快取
  useEffect(() => {
    siteSettingsService.load().then((remote: any) => {
      if (!remote) return;
      if (remote.footer?.menuGroups && remote.footer.menuGroups.length < footerData.menuGroups.length) {
        remote.footer.menuGroups = [
          ...remote.footer.menuGroups,
          ...footerData.menuGroups.slice(remote.footer.menuGroups.length)
        ];
      }
      setSettings(remote);
    }).catch(err => console.warn('[SystemSettings] load failed', err));
  }, []);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      const result = await siteSettingsService.save(settings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      // 若 Supabase 寫入失敗（如 table 不存在），溫和提示但不阻擋
      if (result?.warning) {
        console.warn(result.warning);
        // 不彈 alert 讓使用者一直被打擾，只在 console 提示
      }
    } catch (error) {
      setSaveStatus('idle');
      alert(`儲存失敗：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const pageOptions = [
    ...allInitialPages.map(page => ({
      label: page.title,
      url: `/${page.slug}`
    })),
    { label: '廠商加盟 / 登入', url: '/vendor/login' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">系統設定</h1>
          <p className="text-stone-500">管理網站全域設定、Logo 與頁尾資訊</p>
        </div>
        <SaveButton status={saveStatus} onClick={saveSettings} type="button" />
      </div>

      {/* Header Settings */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-stone-50 pb-3">Header 管理</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Logo 圖片</label>
            <ImageUploader value={settings.header.logo} onChange={(url) => setSettings({...settings, header: {...settings.header, logo: url}})} />
            <input type="number" className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none mt-2 transition-colors" placeholder="Logo 高度 (px)" value={settings.header.logoHeight || ''} onChange={(e) => setSettings({...settings, header: {...settings.header, logoHeight: parseInt(e.target.value)}})} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Logo 圖片 (用於下拉選單)</label>
            <ImageUploader value={settings.header.whiteLogo} onChange={(url) => setSettings({...settings, header: {...settings.header, whiteLogo: url}})} />
          </div>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary border-stone-300 rounded focus:ring-primary" checked={settings.header.showSearch} onChange={(e) => setSettings({...settings, header: {...settings.header, showSearch: e.target.checked}})} /> 顯示搜尋
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary border-stone-300 rounded focus:ring-primary" checked={settings.header.showCart} onChange={(e) => setSettings({...settings, header: {...settings.header, showCart: e.target.checked}})} /> 顯示購物車
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-primary border-stone-300 rounded focus:ring-primary" checked={settings.header.showLogin} onChange={(e) => setSettings({...settings, header: {...settings.header, showLogin: e.target.checked}})} /> 顯示登入
            </label>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-stone-50 pb-3">Footer 管理</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Logo 圖片</label>
            <ImageUploader value={settings.footer.logo} onChange={(url) => setSettings({...settings, footer: {...settings.footer, logo: url}})} />
            <input type="number" className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none mt-2 transition-colors" placeholder="Logo 高度 (px)" value={settings.footer.logoHeight || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, logoHeight: parseInt(e.target.value)}})} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">品牌描述</label>
            <textarea className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" rows={3} value={settings.footer.description || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, description: e.target.value}})} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">版權文字</label>
            <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.copyright || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, copyright: e.target.value}})} />
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">聯絡區塊標題</label>
            <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.contactTitle || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, contactTitle: e.target.value}})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">聯絡電話</label>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.phone || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, phone: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">聯絡信箱</label>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.email || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, email: e.target.value}})} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">地址</label>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.address || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, address: e.target.value}})} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">社群區塊標題</label>
            <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.socialTitle || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, socialTitle: e.target.value}})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Facebook</label>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.social.fb || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, fb: e.target.value}}})} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Youtube</label>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.social.yt || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, yt: e.target.value}}})} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">LINE</label>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.social.line || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, line: e.target.value}}})} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Instagram</label>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" value={settings.footer.social.ig || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, ig: e.target.value}}})} />
            </div>
          </div>

          {settings.footer.menuGroups.map((group: any, gIdx: number) => (
            <div key={gIdx} className="border border-stone-200 p-5 rounded-[1.5rem] bg-stone-50/50">
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm font-bold focus:border-primary outline-none transition-colors mb-4 bg-white" placeholder="選單群組標題" value={group.title || ''} onChange={(e) => {
                const newGroups = [...settings.footer.menuGroups];
                newGroups[gIdx].title = e.target.value;
                setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
              }} />
              <div className="space-y-3">
                {group.links.map((link: any, lIdx: number) => (
                  <select key={lIdx} className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none bg-white transition-colors" value={link.url} onChange={(e) => {
                    const newGroups = [...settings.footer.menuGroups];
                    newGroups[gIdx].links[lIdx].url = e.target.value;
                    newGroups[gIdx].links[lIdx].label = pageOptions.find(p => p.url === e.target.value)?.label || '';
                    setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
                  }}>
                    {pageOptions.map(opt => <option key={opt.url} value={opt.url}>{opt.label}</option>)}
                  </select>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
