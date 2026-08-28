import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { siteSettingsService } from '../services/siteSettingsService';
import { seoData } from '../data/settings/seoData';

export default function SeoMeta() {
  const [seoConfig, setSeoConfig] = useState(seoData);

  useEffect(() => {
    // 1. Initial load
    siteSettingsService.load().then((remote: any) => {
      if (remote && remote.seo) {
        setSeoConfig(remote.seo);
      }
    });

    // 2. Listen for dynamic updates from the admin panel
    const handleSeoUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setSeoConfig(event.detail);
      }
    };
    
    window.addEventListener('seo_settings_updated', handleSeoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('seo_settings_updated', handleSeoUpdate as EventListener);
    };
  }, []);

  return (
    <Helmet>
      {seoConfig.siteTitle && <title>{seoConfig.siteTitle}</title>}
      {seoConfig.metaDescription && <meta name="description" content={seoConfig.metaDescription} />}
      {seoConfig.favicon && <link rel="icon" type="image/x-icon" href={seoConfig.favicon} />}
      {/* 支援部分 iOS Safari 也抓這個作為書籤 icon */}
      {seoConfig.favicon && <link rel="apple-touch-icon" href={seoConfig.favicon} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      {seoConfig.siteTitle && <meta property="og:title" content={seoConfig.siteTitle} />}
      {seoConfig.metaDescription && <meta property="og:description" content={seoConfig.metaDescription} />}
      {seoConfig.ogImage && <meta property="og:image" content={seoConfig.ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {seoConfig.siteTitle && <meta name="twitter:title" content={seoConfig.siteTitle} />}
      {seoConfig.metaDescription && <meta name="twitter:description" content={seoConfig.metaDescription} />}
      {seoConfig.ogImage && <meta name="twitter:image" content={seoConfig.ogImage} />}
    </Helmet>
  );
}
