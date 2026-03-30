import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, 
  DragEndEvent, DragStartEvent, DragMoveEvent, DragOverlay, useDraggable 
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight, FileText, LayoutTemplate, CheckCircle2, Search, MousePointer2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { NavItem } from '../../types/navigation';
import { navigationService } from '../../services/navigationService';
import { pageService } from '../../services/pageService';
import { Page } from '../../types/admin';

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
function SidebarDraggableItem({ page, onAdd }: { page: any, onAdd: (page: any) => void }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `sidebar-${page.id}`,
    data: { type: 'sidebarItem', page }
  });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="p-3 mb-2 bg-white border border-stone-200 rounded-xl shadow-sm flex items-center gap-3 cursor-grab hover:border-stone-400 transition-all">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${page.isShell ? 'bg-stone-100 text-stone-600' : 'bg-blue-50 text-blue-600'}`}>
        {page.isShell ? <LayoutTemplate size={18} /> : <FileText size={18} />}
      </div>
      <div className="text-left overflow-hidden flex-1">
        <div className="text-sm font-bold text-stone-800 truncate">{page.title}</div>
        <div className="text-[10px] uppercase font-bold text-stone-400">{page.isShell ? '空殼' : '頁面'}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onAdd(page); }} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-primary transition-colors">
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
            <button onClick={() => onDelete(item.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NavigationEditor() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shellTitle, setShellTitle] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const settings = navigationService.getSettings();
    setItems(settings.items || []);
    setPages(pageService.getAll());
    setExpandedIds(new Set(settings.items.map(i => i.id)));
  }, []);

  const flattenedItems = useMemo(() => flatten(items, expandedIds), [items, expandedIds]);
  const usedPageIds = useMemo(() => new Set(flatten(items, new Set(items.map(i => i.id))).map(i => i.pageSlug).filter(Boolean)), [items]);

  const handleAddItem = (page: any) => {
    const newItem: NavItem = {
      id: uuidv4(),
      label: page.title,
      url: page.isShell ? '#' : `/${page.slug}`,
      templateType: page.isShell ? undefined : (page.template as any),
      pageSlug: page.isShell ? undefined : (page.id || page.slug),
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

    if (active.data.current?.type === 'sidebarItem') {
      handleAddItem(active.data.current?.page);
      setShellTitle('');
      return;
    }

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
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await navigationService.updateSettings({ items });
      setToast('導覽列設定已儲存');
    } catch (error) {
      console.error('儲存導覽列失敗:', error);
      alert('操作失敗');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && <div className="fixed bottom-6 right-6 bg-stone-800 text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4"><CheckCircle2 size={18} className="text-green-400" /> {toast}</div>}

      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div><h1 className="text-2xl font-bold text-stone-900">導覽條管理</h1><p className="text-sm text-stone-500">管理網站選單結構與層級</p></div>
        <button onClick={handleSave} disabled={isSaving} className={`px-8 py-2.5 rounded-xl font-bold transition-all text-white ${isSaving ? 'bg-green-600' : 'bg-[#885200] hover:bg-[#663D00]'}`}>
          {isSaving ? '儲存中...' : '儲存變更'}
        </button>
      </div>

      <DndContext 
        sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor))}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragMove={(e) => setOffsetLeft(e.delta.x)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 sticky top-6">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 text-sm"><Search size={16}/> 搜尋頁面資產</h3>
              <input type="text" placeholder="輸入關鍵字..." className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm mb-6 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mb-6">
                <h4 className="text-[10px] font-bold text-stone-500 uppercase mb-3 tracking-widest">新建選單空殼 (灰)</h4>
                <input type="text" placeholder="輸入名稱後拖曳" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm mb-4 outline-none focus:bg-white transition-all" value={shellTitle} onChange={(e) => setShellTitle(e.target.value)} />
                <SidebarDraggableItem page={{ id: 'shell-logic', title: shellTitle || '請先輸入名稱', isShell: true }} onAdd={handleAddItem} />
              </div>

              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                <h4 className="text-[10px] font-bold text-stone-400 uppercase mb-2">現有頁面</h4>
                {pages.filter(p => p.title.includes(searchQuery) && !usedPageIds.has(p.id)).map(p => <SidebarDraggableItem key={p.id} page={p} onAdd={handleAddItem} />)}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-stone-50 p-8 rounded-3xl border border-stone-200 min-h-[600px]">
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
              {items.length === 0 && <div className="h-64 flex flex-col items-center justify-center text-stone-300 border-2 border-dashed border-stone-200 rounded-3xl"><MousePointer2 size={48} className="mb-4 opacity-10" /><p>拖曳項目至此處</p></div>}
            </SortableContext>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
