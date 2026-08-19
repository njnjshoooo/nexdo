import React, { useState, useEffect } from 'react';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';
import { seoData } from '../../data/settings/seoData';
import ImageUploader from '../../components/admin/ImageUploader';
import { siteSettingsService } from '../../services/siteSettingsService';
import SaveButton from '../../components/admin/SaveButton';

export default function SeoSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { seo: parsed.seo || seoData };
      } catch {}
    }
    return { seo: seoData };
  });

  useEffect(() => {
    siteSettingsService.load().then((remote: any) => {
      if (!remote) return;
      setSettings(prev => ({
        ...prev,
        seo: remote.seo || seoData
      }));
    }).catch(err => console.warn('[SeoSettings] load failed', err));
  }, []);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      // First, get all existing settings to not overwrite header/footer
      const existingSettings = await siteSettingsService.load() || {};
      const updatedSettings = {
        ...existingSettings,
        seo: settings.seo
      };
      
      const result = await siteSettingsService.save(updatedSettings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      if (!result.supabaseOk) {
        alert(result.warning);
      } else {
        // Dispatch an event so the frontend SeoMeta component updates immediately
        window.dispatchEvent(new CustomEvent('seo_settings_updated', { detail: updatedSettings.seo }));
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('儲存失敗，請重試');
      setSaveStatus('idle');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <PageMainTitle className="!text-3xl mb-2">SEO 與搜尋設定</PageMainTitle>
          <p className="text-stone-500">管理網站的搜尋引擎資訊與社群分享預設圖</p>
        </div>
        <SaveButton 
          onClick={saveSettings} 
          status={saveStatus}
          type="button"
        />
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-stone-50 pb-3">搜尋引擎與社群分享資訊</h2>
        
        <div className="space-y-6">
          
          {/* Favicon */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">
              Favicon 圖示上傳 (瀏覽器分頁圖標)
            </label>
            <p className="text-xs text-stone-500 mb-2 ml-1">建議尺寸為 32x32px 或 64x64px，格式為 PNG 或 ICO。</p>
            <ImageUploader 
              value={settings.seo.favicon} 
              onChange={(url) => setSettings({...settings, seo: {...settings.seo, favicon: url}})} 
              aspectRatio="aspect-square" 
              className="max-w-[120px]" 
            />
          </div>

          {/* Site Title */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">
              網站預設標題 (Site Title)
            </label>
            <p className="text-xs text-stone-500 mb-2 ml-1">顯示在瀏覽器分頁上，以及搜尋結果的主標題。</p>
            <input 
              className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" 
              value={settings.seo.siteTitle || ''} 
              onChange={(e) => setSettings({...settings, seo: {...settings.seo, siteTitle: e.target.value}})} 
              placeholder="例如：好齡居 - 樂齡居住安全專家"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">
              搜尋摘要描述 (Meta Description)
            </label>
            <p className="text-xs text-stone-500 mb-2 ml-1">顯示在 Google 搜尋結果主標題下方的簡介文字，建議 100-150 字內。</p>
            <textarea 
              className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-primary outline-none transition-colors" 
              rows={4} 
              value={settings.seo.metaDescription || ''} 
              onChange={(e) => setSettings({...settings, seo: {...settings.seo, metaDescription: e.target.value}})} 
              placeholder="輸入吸引人的網站介紹..."
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">
              社群分享預設圖 (OG Image)
            </label>
            <p className="text-xs text-stone-500 mb-2 ml-1">當網址貼到 LINE 或 Facebook 時會自動抓取的預覽縮圖。建議比例 1.91:1 (如 1200x630px)。</p>
            <ImageUploader 
              value={settings.seo.ogImage} 
              onChange={(url) => setSettings({...settings, seo: {...settings.seo, ogImage: url}})} 
              aspectRatio="aspect-[1.91/1]" 
              className="max-w-[400px]" 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
