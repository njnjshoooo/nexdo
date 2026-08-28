import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

export default async function sitemapHandler(req: Request, res: Response) {
  try {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    // Prefer anon key for public data, fallback to service role if needed
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!url || !key) {
      throw new Error('Missing Supabase URL or Key');
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'www.nexdo.tw';
    const baseUrl = `${protocol}://${host}`;

    const [{ data: pages }, { data: articles }] = await Promise.all([
      supabase.from('pages').select('slug, updated_at, is_published').eq('is_published', true),
      supabase.from('articles').select('slug, updated_at, is_published').eq('is_published', true)
    ]);

    const allUrls = [];
    
    // 首頁
    allUrls.push({ url: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 });

    if (pages) {
      for (const page of pages) {
        if (page.slug && page.slug !== 'home') {
          allUrls.push({ 
            url: `${baseUrl}/${page.slug}`,
            lastmod: page.updated_at ? new Date(page.updated_at).toISOString() : undefined,
            changefreq: 'weekly',
            priority: 0.8
          });
        }
      }
    }

    if (articles) {
      for (const article of articles) {
        if (article.slug) {
          allUrls.push({ 
            url: `${baseUrl}/blog/${article.slug}`,
            lastmod: article.updated_at ? new Date(article.updated_at).toISOString() : undefined,
            changefreq: 'weekly',
            priority: 0.7
          });
        }
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(u => `  <url>
    <loc>${u.url}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
}
