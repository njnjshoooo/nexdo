import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react';
import { footerData } from '../data/settings/footerData';

export default function Footer() {
  const [data, setData] = useState(footerData);

  useEffect(() => {
    // 先讀 localStorage 即時 render
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).footer;
        if (parsed?.menuGroups && parsed.menuGroups.length < footerData.menuGroups.length) {
          parsed.menuGroups = [
            ...parsed.menuGroups,
            ...footerData.menuGroups.slice(parsed.menuGroups.length)
          ];
        }
        if (parsed) setData(parsed);
      } catch {}
    }
    // 再從 Supabase 拉最新
    import('../services/siteSettingsService').then(({ siteSettingsService }) => {
      siteSettingsService.load().then((remote: any) => {
        if (!remote?.footer) return;
        const f = remote.footer;
        if (f.menuGroups && f.menuGroups.length < footerData.menuGroups.length) {
          f.menuGroups = [...f.menuGroups, ...footerData.menuGroups.slice(f.menuGroups.length)];
        }
        setData(f);
      }).catch(() => {});
    });
  }, []);

  return (
    <footer id="contact" className="bg-stone-900 text-stone-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Left: Logo & Description */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {data.logo ? (
                <img src={data.logo} alt="Logo" className="object-contain" style={{ height: data.logoHeight ? `${data.logoHeight}px` : '48px' }} />
              ) : (
                <>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    好
                  </div>
                  <span className="text-xl font-bold text-white">好齡居 NEXDO</span>
                </>
              )}
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* Middle: Custom Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
            {data.menuGroups.map((group: any) => (
              <div key={group.title}>
                <h3 className="text-white font-bold mb-4">{group.title}</h3>
                <ul className="space-y-2 text-sm">
                  {group.links.map((link: any) => (
                    <li key={link.label}><a href={link.url} className="hover:text-primary transition-colors">{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right: Contact & Social */}
          <div className="space-y-6 md:col-span-1">
            <h3 className="text-white font-bold mb-4">{data.contactTitle}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><Phone size={18} className="text-primary" /> {data.phone}</li>
              <li className="flex items-center gap-3"><Mail size={18} className="text-primary" /> {data.email}</li>
              <li className="flex items-start gap-3"><MapPin size={18} className="text-primary mt-0.5" /> {data.address}</li>
            </ul>
            {data.socialTitle && <h3 className="text-white font-bold mb-4">{data.socialTitle}</h3>}
            <div className="flex gap-4 pt-2">
              <a href={data.social.fb} className="hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href={data.social.ig} className="hover:text-primary transition-colors"><Instagram size={20} /></a>
              <a href={data.social.line} className="hover:text-primary transition-colors"><MessageCircle size={20} /></a>
              <a href={data.social.yt} className="hover:text-primary transition-colors"><Youtube size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 text-center text-xs text-stone-500">
          <p>{data.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
