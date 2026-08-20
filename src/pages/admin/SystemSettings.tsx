import React, { useState, useEffect } from 'react';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';
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
        if (parsed.header && parsed.footer) return parsed;
      } catch {}
    }
    return { header: headerData, footer: footerData };
  });

  // 進入頁面時主動從 Supabase 拉最新設定，覆蓋本地快取
  useEffect(() => {
    siteSettingsService.load().then((remote: any) => {
      if (!remote?.footer && !remote?.header) return;
      setSettings(remote);
    }).catch(err => console.warn('[SystemSettings] load failed', err));
  }, []);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveSettings = async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      // 先取得可能存在的其他設定（如 seo），避免被蓋掉
      const existingSettings = await siteSettingsService.load() || {};
      const fullSettings = {
        ...existingSettings,
        header: settings.header,
        footer: settings.footer,
      };
      
      const result = await siteSettingsService.save(fullSettings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      if (result?.warning) {
        setSaveError(result.warning);
      }
    } catch (error) {
      setSaveStatus('idle');
      setSaveError(`儲存失敗：${error instanceof Error ? error.message : String(error)}`);
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <PageMainTitle className="!text-3xl mb-2">網站外觀設定</PageMainTitle>
          <p className="text-stone-500">管理網站的外觀、Logo 與頁尾資訊</p>
        </div>
        <SaveButton status={saveStatus} onClick={saveSettings} type="button" />
      </div>

      {saveError && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex flex-col gap-2">
          <div className="font-bold">⚠️ 儲存發生問題</div>
          <div className="text-sm">{saveError}</div>
        </div>
      )}

      {/* Header Settings */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-stone-50 pb-3">Header 管理</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Logo 圖片</label>
              <ImageUploader value={settings.header.logo} onChange={(url) => setSettings({...settings, header: {...settings.header, logo: url}})} aspectRatio="aspect-[21/9]" className="max-w-[320px]" />
              <input type="number" className="w-[320px] border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none mt-2 transition-colors" placeholder="Logo 高度 (px)" value={settings.header.logoHeight || ''} onChange={(e) => setSettings({...settings, header: {...settings.header, logoHeight: parseInt(e.target.value)}})} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Logo 圖片 (用於下拉選單)</label>
              <ImageUploader value={settings.header.whiteLogo} onChange={(url) => setSettings({...settings, header: {...settings.header, whiteLogo: url}})} aspectRatio="aspect-[21/9]" className="max-w-[320px]" />
            </div>
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
            <ImageUploader value={settings.footer.logo} onChange={(url) => setSettings({...settings, footer: {...settings.footer, logo: url}})} aspectRatio="aspect-[21/9]" className="max-w-[320px]" />
            <input type="number" className="w-[320px] border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none mt-2 transition-colors" placeholder="Logo 高度 (px)" value={settings.footer.logoHeight || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, logoHeight: parseInt(e.target.value)}})} />
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
            <div key={gIdx} className="border border-stone-200 p-5 rounded-[1.5rem] bg-stone-50/50 relative group">
              <button 
                type="button" 
                onClick={() => {
                  const newGroups = [...settings.footer.menuGroups];
                  newGroups.splice(gIdx, 1);
                  setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                刪除群組
              </button>
              <input className="w-full border border-stone-200 p-3 rounded-xl text-sm font-bold focus:border-primary outline-none transition-colors mb-4 bg-white" placeholder="選單群組標題" value={group.title || ''} onChange={(e) => {
                const newGroups = [...settings.footer.menuGroups];
                newGroups[gIdx].title = e.target.value;
                setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
              }} />
              <div className="space-y-3">
                {group.links.map((link: any, lIdx: number) => (
                  <div key={lIdx} className="flex gap-2 items-center">
                    <input 
                      className="w-1/3 border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none bg-white transition-colors" 
                      placeholder="顯示文字"
                      value={link.label || ''} 
                      onChange={(e) => {
                        const newGroups = [...settings.footer.menuGroups];
                        newGroups[gIdx].links[lIdx].label = e.target.value;
                        setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
                      }}
                    />
                    <div className="flex-1 relative">
                      <input
                        className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none bg-white transition-colors"
                        placeholder="輸入自訂網址或從選單挑選"
                        value={link.url || ''}
                        onChange={(e) => {
                          const newGroups = [...settings.footer.menuGroups];
                          const newUrl = e.target.value;
                          newGroups[gIdx].links[lIdx].url = newUrl;
                          
                          // 若尚未填寫標題，且選了預設頁面，自動帶入標題
                          if (!newGroups[gIdx].links[lIdx].label) {
                            const found = pageOptions.find(p => p.url === newUrl);
                            if (found) newGroups[gIdx].links[lIdx].label = found.label;
                          }
                          setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
                        }}
                        list={`page-options-${gIdx}-${lIdx}`}
                      />
                      <datalist id={`page-options-${gIdx}-${lIdx}`}>
                        {pageOptions.map(opt => <option key={opt.url} value={opt.url}>{opt.label}</option>)}
                      </datalist>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newGroups = [...settings.footer.menuGroups];
                        newGroups[gIdx].links.splice(lIdx, 1);
                        setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
                      }}
                      className="text-stone-400 hover:text-red-500 p-2 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => {
                  const newGroups = [...settings.footer.menuGroups];
                  newGroups[gIdx].links.push({ label: '', url: '' });
                  setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
                }}
                className="mt-4 text-[13px] font-bold text-primary hover:text-primary-light flex items-center gap-1"
              >
                + 新增自訂外部連結
              </button>
            </div>
          ))}
        </div>
        <button 
          type="button" 
          onClick={() => {
            const newGroups = [...settings.footer.menuGroups];
            newGroups.push({ title: '新群組', links: [] });
            setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
          }}
          className="mt-6 text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1 w-full justify-center border-2 border-dashed border-primary/30 p-4 rounded-xl"
        >
          + 新增選單群組
        </button>
      </div>
    </div>
  );
}
