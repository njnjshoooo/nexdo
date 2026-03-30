import React, { useState, useEffect } from 'react';
import { headerData } from '../../data/settings/headerData';
import { footerData } from '../../data/settings/footerData';
import ImageUploader from '../../components/admin/ImageUploader';
import { allInitialPages } from '../../data/pages';

export default function SystemSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure the new "關於我們" group is present if it was added to footerData but not in saved settings
      if (parsed.footer && parsed.footer.menuGroups && parsed.footer.menuGroups.length < footerData.menuGroups.length) {
        parsed.footer.menuGroups = [
          ...parsed.footer.menuGroups,
          ...footerData.menuGroups.slice(parsed.footer.menuGroups.length)
        ];
      }
      return parsed;
    }
    return { header: headerData, footer: footerData };
  });

  const [isSaving, setIsSaving] = useState(false);

  const saveSettings = () => {
    setIsSaving(true);
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      alert('設定已儲存');
    }, 500);
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
        <h1 className="text-3xl font-bold text-stone-900 mb-2">系統設定</h1>
        <button onClick={saveSettings} className={`px-4 py-2 text-white rounded-lg ${isSaving ? 'bg-green-600' : 'bg-[#8B5E34]'}`} disabled={isSaving}>
          {isSaving ? '儲存中...' : '儲存設定'}
        </button>
      </div>

      {/* Header Settings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        <h2 className="text-lg font-bold mb-4">Header 管理</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Logo 圖片</label>
            <ImageUploader value={settings.header.logo} onChange={(url) => setSettings({...settings, header: {...settings.header, logo: url}})} />
            <input type="number" className="w-full border rounded-lg p-2 mt-2" placeholder="Logo 高度 (px)" value={settings.header.logoHeight || ''} onChange={(e) => setSettings({...settings, header: {...settings.header, logoHeight: parseInt(e.target.value)}})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo 圖片 (用於下拉選單)</label>
            <ImageUploader value={settings.header.whiteLogo} onChange={(url) => setSettings({...settings, header: {...settings.header, whiteLogo: url}})} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.header.showSearch} onChange={(e) => setSettings({...settings, header: {...settings.header, showSearch: e.target.checked}})} /> 顯示搜尋</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.header.showCart} onChange={(e) => setSettings({...settings, header: {...settings.header, showCart: e.target.checked}})} /> 顯示購物車</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={settings.header.showLogin} onChange={(e) => setSettings({...settings, header: {...settings.header, showLogin: e.target.checked}})} /> 顯示登入</label>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        <h2 className="text-lg font-bold mb-4">Footer 管理</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Logo 圖片</label>
            <ImageUploader value={settings.footer.logo} onChange={(url) => setSettings({...settings, footer: {...settings.footer, logo: url}})} />
            <input type="number" className="w-full border rounded-lg p-2 mt-2" placeholder="Logo 高度 (px)" value={settings.footer.logoHeight || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, logoHeight: parseInt(e.target.value)}})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">品牌描述</label>
            <textarea className="w-full border rounded-lg p-2" value={settings.footer.description || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, description: e.target.value}})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">版權文字</label>
            <input className="w-full border rounded-lg p-2" value={settings.footer.copyright || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, copyright: e.target.value}})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">聯絡區塊標題</label>
            <input className="w-full border rounded-lg p-2" value={settings.footer.contactTitle || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, contactTitle: e.target.value}})} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">聯絡電話</label>
              <input className="w-full border rounded-lg p-2" value={settings.footer.phone || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, phone: e.target.value}})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">聯絡信箱</label>
              <input className="w-full border rounded-lg p-2" value={settings.footer.email || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, email: e.target.value}})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">地址</label>
              <input className="w-full border rounded-lg p-2" value={settings.footer.address || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, address: e.target.value}})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">社群區塊標題</label>
            <input className="w-full border rounded-lg p-2" value={settings.footer.socialTitle || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, socialTitle: e.target.value}})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <input className="w-full border rounded-lg p-2" value={settings.footer.social.fb || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, fb: e.target.value}}})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Youtube</label>
              <input className="w-full border rounded-lg p-2" value={settings.footer.social.yt || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, yt: e.target.value}}})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LINE</label>
              <input className="w-full border rounded-lg p-2" value={settings.footer.social.line || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, line: e.target.value}}})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input className="w-full border rounded-lg p-2" value={settings.footer.social.ig || ''} onChange={(e) => setSettings({...settings, footer: {...settings.footer, social: {...settings.footer.social, ig: e.target.value}}})} />
            </div>
          </div>

          {settings.footer.menuGroups.map((group: any, gIdx: number) => (
            <div key={gIdx} className="border p-4 rounded-lg">
              <input className="font-bold w-full mb-2" value={group.title || ''} onChange={(e) => {
                const newGroups = [...settings.footer.menuGroups];
                newGroups[gIdx].title = e.target.value;
                setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
              }} />
              {group.links.map((link: any, lIdx: number) => (
                <select key={lIdx} className="w-full border p-1 mb-1" value={link.url} onChange={(e) => {
                  const newGroups = [...settings.footer.menuGroups];
                  newGroups[gIdx].links[lIdx].url = e.target.value;
                  newGroups[gIdx].links[lIdx].label = pageOptions.find(p => p.url === e.target.value)?.label || '';
                  setSettings({...settings, footer: {...settings.footer, menuGroups: newGroups}});
                }}>
                  {pageOptions.map(opt => <option key={opt.url} value={opt.url}>{opt.label}</option>)}
                </select>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
