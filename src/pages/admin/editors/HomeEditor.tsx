import React from 'react';
import { pageService } from '../../../services/pageService';
import { editableHomeServices, patchHomeBlock } from '../../../features/admin/homeEditor';

export default function HomeEditor({ register, activeTab, watch, setValue, forms }: any) {
  const blocks = watch('content.home.blocks') || [];
  const services = blocks.find((b: any) => b.type === 'SERVICES')?.services || {};
  const items = Array.isArray(services) ? services : services.items || [];
  const more = blocks.find((b: any) => b.type === 'MORE_SERVICES')?.moreServices || {};
  const pageIds: string[] = more.pageIds || [];
  const pages = pageService.getAll();
  const fieldClass = 'w-full border border-stone-200 p-3 rounded-xl mt-2';
  const updateBlock = (type: string, key: string, value: unknown) => setValue('content.home.blocks', patchHomeBlock(blocks, type, key, value), { shouldDirty: true });
  function editService(pageId: string, key: string, value: string) {
    const index = items.findIndex((item: any) => item.pageId === pageId);
    const next = index < 0 ? [...items, { pageId, [key]: value }] : items.map((item: any, i: number) => i === index ? { ...item, [key]: value } : item);
    updateBlock('SERVICES', 'services', Array.isArray(services) ? next : { ...services, items: next });
  }
  return <section className="bg-white p-6 md:p-10 rounded-2xl border border-stone-200 space-y-6">
    <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">此處只保留會影響目前首頁的設定。首頁主視覺、整理介紹、工具、常見問題與文章區塊採用固定版面；文章內容請至「文章管理」修改。</p>
    {activeTab === 'home_secondary' && <><h2 className="text-2xl font-bold">首頁服務卡片文字</h2><p className="text-sm text-stone-500">可修改以下六個分類的標題與說明，留空使用預設文字。分類、圖片與連結採用固定設定。</p><div className="grid md:grid-cols-2 gap-5">{editableHomeServices.map(([pageId, label]) => {
      const item = items.find((item: any) => item.pageId === pageId) || {};
      return <fieldset key={pageId} className="border rounded-xl p-4 space-y-3"><legend className="px-2 font-bold">{label}</legend><label className="block">顯示標題<input className={fieldClass} value={item.title || ''} placeholder={label} onChange={e => editService(pageId, 'title', e.target.value)} /></label><label className="block">服務說明<textarea className={fieldClass} rows={3} value={item.description || ''} placeholder="留空使用預設說明" onChange={e => editService(pageId, 'description', e.target.value)} /></label></fieldset>;
    })}</div></>}
    {activeTab === 'home_more_services' && <><h2 className="text-2xl font-bold">我們還提供</h2><label className="block">區塊標題<input className={fieldClass} value={more.title || ''} placeholder="我們還提供" onChange={e => updateBlock('MORE_SERVICES', 'moreServices', { ...more, title: e.target.value })} /></label><p className="text-sm text-stone-500">未選擇任何頁面時，首頁不顯示此區塊。卡片內容取自所選頁面與關聯商品。</p>{pageIds.map((id, index) => <div key={index} className="flex gap-3 items-center"><label className="flex-1">服務頁面 {index + 1}<select className={fieldClass} value={id} onChange={e => updateBlock('MORE_SERVICES', 'moreServices', { ...more, pageIds: pageIds.map((value, i) => i === index ? e.target.value : value) })}><option value="">請選擇</option>{id && !pages.some(p => p.id === id) && <option value={id}>既有頁面（{id}）</option>}{pages.filter(p => p.template === 'SUB_ITEM' || p.id === id).map(p => <option key={p.id} value={p.id}>{p.title}{p.isPublished ? '' : '（草稿）'}</option>)}</select></label><button type="button" className="underline text-red-700" onClick={() => updateBlock('MORE_SERVICES', 'moreServices', { ...more, pageIds: pageIds.filter((_, i) => i !== index) })}>移除此卡片</button></div>)}<button type="button" className="border rounded-xl px-4 py-2" onClick={() => updateBlock('MORE_SERVICES', 'moreServices', { ...more, pageIds: [...pageIds, ''] })}>新增服務卡片</button></>}
    {activeTab === 'home_form' && <><h2 className="text-2xl font-bold">首頁底部諮詢表單</h2><label className="flex gap-3 items-center"><input type="checkbox" {...register('content.showForm')} />在首頁底部顯示諮詢表單</label>{watch('content.showForm') && <label className="block">使用表單<select {...register('content.formId')} className={fieldClass}><option value="">請選擇表單</option>{(forms || []).map((form: any) => <option key={form.id} value={form.id}>{form.name}</option>)}</select></label>}<p className="text-sm text-stone-500">這個設定只影響首頁底部，不會變更老前整理專頁的線上需求表單。</p></>}
  </section>;
}
