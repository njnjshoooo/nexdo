import type { Request, Response } from 'express';
import { services, supportServices } from '../src/features/focused/catalog.js';

export default function sitemapHandler(_req: Request, res: Response) {
  const origin = 'https://www.nexdo.tw';
  const paths = ['', '/services', ...[...services, ...supportServices].map(service => '/services/' + service.slug), '/courses', '/faq', '/about', '/book', '/privacy'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${origin}${path || '/'}</loc></url>`).join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
}
