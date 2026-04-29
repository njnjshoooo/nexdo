import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, 
  DragEndEvent, DragStartEvent, DragMoveEvent, DragOverlay, useDraggable 
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight, FileText, LayoutTemplate, CheckCircle2, MousePointer2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { NavItem } from '../../types/navigation';
import { navigationService } from '../../services/navigationService';
import { pageService } from '../../services/pageService';
import { articleService } from '../../services/articleService';
import { Page } from '../../types/admin';
import { Article } from '../../types/article';
import SaveButton from '../../components/admin/SaveButton';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';

// --- 核心邏輯：展平與還原樹狀結構 ---
interface FlattenedItem extends NavItem {
  parentId: string | null;
  depth: number;
}

function flatten(items: NavItem[], expandedIds: Set<string>, parentId: string | null = null, depth = 0): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item) => {
    acc.push({ ...item, parentId, depth });
    if (expandedIds.has(item.id) && item.children && item.children.length > 0) {
      acc.push(...flatten(item.children, expandedIds, item.id, depth + 1));
    }
    return acc;
  }, []);
}

function unflatten(flattenedItems: FlattenedItem[]): NavItem[] {
  const root: NavItem[] = [];
  const map: Record<string, NavItem> = {};
  flattenedItems.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });
  flattenedItems.forEach(item => {
    const node = map[item.id];
    if (item.parentId === null) root.push(node);
    else if (map[item.parentId]) map[item.parentId].children!.push(node);
  });
  return root;
}

// --- 視覺組件 ---
function SidebarItem({ item, onAdd, type }: { item: any, onAdd: (item: any, type: 'page' | 'article' | 'custom') => void, type: 'page' | 'article' | 'custom' }) {
  return (
    <div className="p-3 mb-2 bg-white border border-stone-200 rounded-xl shadow-sm flex items-center gap-3 hover:border-stone-400 transition-all">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${type === 'custom' ? 'bg-stone-100 text-stone-600' : 'bg-blue-50 text-blue-600'}`}>
        {type === 'custom' ? <LayoutTemplate size={18} /> : <FileText size={18} />}
      </div>
      <div className="text-left overflow-hidden flex-1">
        <div className="text-sm font-bold text-stone-800 truncate">{item.title}</div>
        <div className="text-[10px] uppercase font-bold text-stone-400">
          {type === 'custom' ? '自訂連結' : type === 'article' ? '文章' : '頁面'}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onAdd(item, type); }} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-primary transition-colors">
        <Plus size={18} />
      </button>
    </div>
  );
}

function SortableNavItem({ item, depth, onUpdate, onDelete, isExpanded, onToggleExpand }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.3 : 1,
    paddingLeft: `${depth * 32}px` // 💡 調整縮排為 32px
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div {...attributes} {...listeners} className="cursor-grab text-stone-300 hover:text-stone-600"><GripVertical size={20} /></div>
        <button onClick={() => onToggleExpand(item.id)} className="w-6 flex justify-center text-stone-400 transition-transform duration-200">
          {item.children?.length > 0 ? (isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />) : <div className="w-1.5 h-1.5 bg-stone-200 rounded-full" />}
        </button>
        <div className="flex-1 grid grid-cols-12 gap-3 items-center">
          <input type="text" value={item.label} onChange={(e) => onUpdate(item.id, { label: e.target.value, isCustomLabel: true })} className="col-span-4 border rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:border-stone-400" />
          <input type="text" value={item.url} onChange={(e) => onUpdate(item.id, { url: e.target.value })} className="col-span-6 border rounded-lg px-3 py-1.5 text-sm font-mono text-stone-500 bg-stone-50" />
          <div className="col-span-2 flex justify-end">
            <AdminTable.Delete onClick={() => onDelete(item.id)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NavigationEditor() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  const [expandedSection, setExpandedSection] = useState<'pages' | 'articles' | 'custom' | null>('pages');
  const [searchQueryPages, setSearchQueryPages] = useState('');
  const [searchQueryArticles, setSearchQueryArticles] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const [toast, setToast] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const settings = navigationService.getSettings();
    setItems(settings.items || []);
    setPages(pageService.getAll());
    setArticles(articleService.getAll());
    setExpandedIds(new Set(settings.items.map(i => i.id)));
  }, []);

  const flattenedItems = useMemo(() => flatten(items, expandedIds), [items, expandedIds]);
  const usedPageIds = useMemo(() => new Set(flatten(items, new Set(items.map(i => i.id))).map(i => i.pageSlug).filter(Boolean)), [items]);

  const handleAddItem = (item: any, type: 'page' | 'article' | 'custom') => {
    let url = '#';
    let templateType = undefined;
    let pageSlug = undefined;

    if (type === 'page') {
      url = `/${item.slug}`;
      templateType = item.template;
      pageSlug = item.id || item.slug;
    } else if (type === 'article') {
      url = `/blog/${item.slug}`;
      templateType = 'BLOG';
      pageSlug = item.id || item.slug;
    } else if (type === 'custom') {
      url = item.url;
    }

    const newItem: NavItem = {
      id: uuidv4(),
      label: item.title,
      url: url,
      templateType: templateType,
      pageSlug: pageSlug,
      openInNewWindow: false,
      children: []
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    const deltaX = offsetLeft;
    setOffsetLeft(0);

    if (!over) return;

    const activeIndex = flattenedItems.findIndex(i => i.id === active.id);
    const overIndex = flattenedItems.findIndex(i => i.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      const newFlattened = arrayMove(flattenedItems, activeIndex, overIndex);
      const dragDepth = Math.round(deltaX / 32); // 💡 調整為 32px
      const prevItem = newFlattened[overIndex - 1];
      
      let newDepth = (flattenedItems[activeIndex].depth || 0) + dragDepth;
      const maxDepth = prevItem ? prevItem.depth + 1 : 0;
      newDepth = Math.max(0, Math.min(newDepth, maxDepth, 2));

      let newParentId: string | null = null;
      if (newDepth > 0 && prevItem) {
        if (newDepth > prevItem.depth) newParentId = prevItem.id;
        else newParentId = prevItem.parentId;
      }

      newFlattened[overIndex].depth = newDepth;
      newFlattened[overIndex].parentId = newParentId;

      setItems(unflatten(newFlattened));
      if (newParentId) setExpandedIds(prev => new Set(prev).add(newParentId!));
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // 真正等 Supabase 寫入完成（解決「加新項目時舊的消失」問題）
      await navigationService.updateSettings({ items });
      setToast('導覽列設定已儲存');
      setSaveStatus('saved');
      setTimeout(() => {
        setToast(null);
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('idle');
      alert(`儲存失敗：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="space-y-8">
      {toast && <div className="fixed bottom-6 right-6 bg-stone-800 text-white px-6 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4"><CheckCircle2 size={18} className="text-green-400" /> {toast}</div>}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">導覽條管理</h1>
          <p className="text-stone-500">管理網站選單結構與層級</p>
        </div>
        <SaveButton 
          onClick={handleSave}
          status={saveStatus}
          label="儲存變更"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 space-y-4">
          {/* Pages Accordion */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'pages' ? null : 'pages')}
              className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <span className="font-bold text-stone-700">頁面</span>
              {expandedSection === 'pages' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {expandedSection === 'pages' && (
              <div className="p-4 border-t border-stone-200">
                <AdminSearchInput 
                  placeholder="搜尋頁面名稱..." 
                  value={searchQueryPages} 
                  onChange={(e) => setSearchQueryPages(e.target.value)} 
                  className="mb-4"
                />
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                  {pages.filter(p => p.isPublished && p.title.includes(searchQueryPages) && !usedPageIds.has(p.id)).map(p => (
                    <SidebarItem key={p.id} item={p} onAdd={handleAddItem} type="page" />
                  ))}
                  {pages.filter(p => p.isPublished && p.title.includes(searchQueryPages) && !usedPageIds.has(p.id)).length === 0 && (
                    <div className="text-center text-stone-400 text-sm py-4">沒有可用的頁面</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Articles Accordion */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'articles' ? null : 'articles')}
              className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <span className="font-bold text-stone-700">文章</span>
              {expandedSection === 'articles' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {expandedSection === 'articles' && (
              <div className="p-4 border-t border-stone-200">
                <AdminSearchInput 
                  placeholder="搜尋文章名稱..." 
                  value={searchQueryArticles} 
                  onChange={(e) => setSearchQueryArticles(e.target.value)} 
                  className="mb-4"
                />
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                  {articles.filter(a => a.isPublished && a.title.includes(searchQueryArticles) && !usedPageIds.has(a.id)).map(a => (
                    <SidebarItem key={a.id} item={a} onAdd={handleAddItem} type="article" />
                  ))}
                  {articles.filter(a => a.isPublished && a.title.includes(searchQueryArticles) && !usedPageIds.has(a.id)).length === 0 && (
                    <div className="text-center text-stone-400 text-sm py-4">沒有可用的文章</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Link Accordion */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'custom' ? null : 'custom')}
              className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <span className="font-bold text-stone-700">自訂連結</span>
              {expandedSection === 'custom' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {expandedSection === 'custom' && (
              <div className="p-4 border-t border-stone-200">
                <input 
                  type="text" 
                  placeholder="連結文字" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm mb-3 outline-none focus:border-stone-400 transition-all" 
                  value={customTitle} 
                  onChange={(e) => setCustomTitle(e.target.value)} 
                />
                <input 
                  type="text" 
                  placeholder="網址 (例如: https://...)" 
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm mb-4 outline-none focus:border-stone-400 transition-all" 
                  value={customUrl} 
                  onChange={(e) => setCustomUrl(e.target.value)} 
                />
                <button 
                  onClick={() => {
                    if(customTitle && customUrl) {
                      handleAddItem({ id: uuidv4(), title: customTitle, url: customUrl }, 'custom');
                      setCustomTitle('');
                      setCustomUrl('');
                    }
                  }}
                  disabled={!customTitle || !customUrl}
                  className="w-full py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} /> 新增至導覽條
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-stone-50 p-8 rounded-xl border border-stone-200 min-h-[600px]">
          <DndContext 
            sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor))}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragMove={(e) => setOffsetLeft(e.delta.x)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={flattenedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {flattenedItems.map(item => (
                <SortableNavItem 
                  key={item.id} 
                  item={item} 
                  depth={activeId === item.id ? Math.max(0, Math.min(2, item.depth + Math.round(offsetLeft/32))) : item.depth}
                  onUpdate={(id: string, up: any) => {
                    const updateItems = (list: NavItem[]): NavItem[] => list.map(i => i.id === id ? {...i, ...up} : (i.children ? {...i, children: updateItems(i.children)} : i));
                    setItems(updateItems(items));
                  }}
                  onDelete={(id: string) => {
                    const deleteItems = (list: NavItem[]): NavItem[] => list.filter(i => i.id !== id).map(i => i.children ? {...i, children: deleteItems(i.children)} : i);
                    setItems(deleteItems(items));
                  }}
                  isExpanded={expandedIds.has(item.id)}
                  onToggleExpand={(id: string) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                />
              ))}
              {items.length === 0 && <div className="h-64 flex flex-col items-center justify-center text-stone-300 border-2 border-dashed border-stone-200 rounded-3xl"><MousePointer2 size={48} className="mb-4 opacity-10" /><p>點擊左側「＋」新增項目</p></div>}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
