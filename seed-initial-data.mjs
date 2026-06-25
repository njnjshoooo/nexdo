/**
 * 一次性 Seed Script — 把初始的 products、pages、articles 灌入 Supabase
 *
 * 用法：
 *   cd nexdo-work
 *   node seed-initial-data.mjs
 *
 * 注意：這支 script 採 upsert (ON CONFLICT DO UPDATE)，可重複執行。
 *       會用 anon key — 因 RLS policies 有 admin_write 限制，
 *       需要先用 admin@nexdo.com 登入才能寫入。
 */

import { createClient } from '@supabase/supabase-js';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const SUPABASE_URL = 'https://dmuqabrxzoctalflljcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdXFhYnJ4em9jdGFsZmxsamN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzg4MzAsImV4cCI6MjA5Mjg1NDgzMH0.dGeJn0Z_ATKsrL97_HMbk--gO3kcb70T5lEvT41vgYo';
const ADMIN_EMAIL = 'admin@nexdo.com';
const ADMIN_PASSWORD = 'Admin123456';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loginAdmin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (error) throw new Error(`Admin login failed: ${error.message}`);
  console.log('✅ Admin logged in:', data.user?.email);
}

// ======================================================================
// 從 TypeScript source 讀資料 — 用 dynamic import
// 因 Node 不能直接 import .ts，先建議用 tsx 跑此 script
// ======================================================================

async function loadInitialData() {
  // tsx 會自動 resolve .ts 檔
  const productsModule = await import('./src/data/products/index.ts');
  const pagesModule = await import('./src/data/pages/index.ts');
  const articlesModule = await import('./src/data/articles/index.ts');

  return {
    products: productsModule.initialProducts,
    pages: pagesModule.allInitialPages,
    articles: articlesModule.ALL_ARTICLES,
  };
}

// ======================================================================
// camelCase → snake_case mappers (與 service 層一致)
// ======================================================================

function productToRow(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category ?? null,
    description: p.description ?? '',
    image: p.image ?? null,
    images: p.images ?? [],
    checklist: p.checklist ?? [],
    order_mode: p.orderMode,
    order_code: p.orderCode ?? null,
    require_date: p.requireDate ?? false,
    require_time: p.requireTime ?? false,
    require_notes: p.requireNotes ?? false,
    variants: p.variants ?? [],
    fixed_config: p.fixedConfig ?? { price: 0, unit: '次', buttonText: '立即下單' },
    quote_config: p.quoteConfig ?? null,
    internal_form_config: p.internalFormConfig ?? null,
    external_link_config: p.externalLinkConfig ?? null,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.updatedAt || new Date().toISOString(),
  };
}

function pageToRow(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    template: p.template,
    parent_id: p.parentId ?? null,
    content: p.content ?? {},
    is_published: p.isPublished ?? true,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.updatedAt || new Date().toISOString(),
  };
}

function articleToRow(a) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary ?? '',
    content: a.content ?? {},
    cover_image: a.coverImage ?? null,
    category_id: a.categoryId ?? null,
    seo_keywords: a.seoKeywords ?? [],
    related_service_ids: a.relatedServiceIds ?? [],
    show_form: a.showForm ?? false,
    form_id: a.formId ?? null,
    is_published: a.isPublished ?? true,
    updated_at: a.updatedAt || new Date().toISOString(),
  };
}

// ======================================================================
// Upsert 各表
// ======================================================================

async function upsertBatch(table, rows, label) {
  if (!rows || rows.length === 0) {
    console.log(`⏩ Skip ${label}: no data`);
    return;
  }
  // Supabase 上限 1000 rows / call，分批
  const chunks = [];
  for (let i = 0; i < rows.length; i += 100) chunks.push(rows.slice(i, i + 100));

  let totalUpserted = 0;
  for (const chunk of chunks) {
    const { data, error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`❌ ${label} upsert failed:`, error.message);
      console.error('First row that may be problematic:', JSON.stringify(chunk[0], null, 2).slice(0, 500));
      throw error;
    }
    totalUpserted += chunk.length;
  }
  console.log(`✅ Upserted ${totalUpserted} ${label}`);
}

async function main() {
  console.log('🚀 Starting initial data seed to Supabase…\n');

  await loginAdmin();

  console.log('\n📦 Loading source data from src/data/…');
  const { products, pages, articles } = await loadInitialData();
  console.log(`   - ${products.length} products`);
  console.log(`   - ${pages.length} pages`);
  console.log(`   - ${articles.length} articles\n`);

  console.log('🔄 Upserting to Supabase…');
  await upsertBatch('products', products.map(productToRow), 'products');
  await upsertBatch('pages', pages.map(pageToRow), 'pages');
  await upsertBatch('articles', articles.map(articleToRow), 'articles');

  console.log('\n🎉 All data seeded successfully!');
  console.log('🔗 Verify at https://supabase.com/dashboard/project/dmuqabrxzoctalflljcz/editor');
}

main().catch(err => {
  console.error('💥 Seed failed:', err);
  process.exit(1);
});
