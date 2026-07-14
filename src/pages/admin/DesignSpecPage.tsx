import React, { useState } from 'react';
import { Palette, Type, LayoutTemplate, Layers, CheckCircle2, ChevronDown, ChevronRight, Hash, Eye, AlignLeft } from 'lucide-react';

export default function DesignSpecPage() {
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: '色彩規範 (Colors)', icon: Palette },
    { id: 'typography', label: '字體規範 (Typography)', icon: Type },
    { id: 'spacing', label: '間距與圓角 (Spacing & Radius)', icon: LayoutTemplate },
    { id: 'components', label: '基礎組件 (Components)', icon: Layers },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">設計規範 (Design System)</h1>
        <p className="text-stone-500 mt-2">這份文件定義了網站的視覺語言、設計變數 (Design Tokens) 以及標準組件庫，請在開發時遵循此規範以保持全站視覺一致性。</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-primary text-primary bg-stone-50' 
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'colors' && <ColorSpec />}
        {activeTab === 'typography' && <TypographySpec />}
        {activeTab === 'spacing' && <SpacingSpec />}
        {activeTab === 'components' && <ComponentSpec />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. Color Spec
// ----------------------------------------------------------------------
function ColorSpec() {
  const colorGroups = [
    {
      title: "品牌主色調 (Primary)",
      description: "用於主要按鈕、強調文字、重要標題等核心視覺元素。",
      colors: [
        { name: "Primary", class: "bg-primary", hex: "#885200", textClass: "text-white" },
        { name: "Primary Light", class: "bg-primary-light", hex: "#B36B00", textClass: "text-white" },
      ]
    },
    {
      title: "品牌輔助色 (Secondary)",
      description: "用於次要按鈕、背景裝飾、圖示等，與主色搭配使用。",
      colors: [
        { name: "Secondary", class: "bg-secondary", hex: "#516438", textClass: "text-white" },
        { name: "Secondary Light", class: "bg-secondary-light", hex: "#7A8F5C", textClass: "text-white" },
      ]
    },
    {
      title: "背景與中性色 (Background & Neutrals)",
      description: "用於網站背景、區塊底色、分隔線等。",
      colors: [
        { name: "Warm BG", class: "bg-warm-bg", hex: "#FEFDF9", textClass: "text-stone-800", border: true },
        { name: "Warm Gray", class: "bg-warm-gray", hex: "#F5F5F0", textClass: "text-stone-800" },
      ]
    },
    {
      title: "文字與灰階 (Stone Scale)",
      description: "基於 Tailwind 的 Stone 色系，用於一般文字、次要文字、邊框。",
      colors: [
        { name: "Stone 900 (Main Text)", class: "bg-stone-900", hex: "#1C1917", textClass: "text-stone-50" },
        { name: "Stone 800 (Body Text)", class: "bg-stone-800", hex: "#292524", textClass: "text-stone-50" },
        { name: "Stone 600 (Muted Text)", class: "bg-stone-600", hex: "#57534E", textClass: "text-white" },
        { name: "Stone 500 (Placeholder)", class: "bg-stone-500", hex: "#78716C", textClass: "text-white" },
        { name: "Stone 200 (Borders)", class: "bg-stone-200", hex: "#E7E5E4", textClass: "text-stone-800" },
        { name: "Stone 50 (Soft BG)", class: "bg-stone-50", hex: "#FAFAF9", textClass: "text-stone-800", border: true },
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {colorGroups.map((group, idx) => (
        <section key={idx}>
          <h2 className="text-xl font-bold text-stone-900 mb-2">{group.title}</h2>
          <p className="text-stone-500 mb-6">{group.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {group.colors.map((color, i) => (
              <div key={i} className="group">
                <div className={`h-24 rounded-2xl flex items-end p-4 transition-transform group-hover:-translate-y-1 ${color.class} ${color.border ? 'border border-stone-200' : 'shadow-sm'}`}>
                  <span className={`font-mono font-bold text-sm ${color.textClass}`}>{color.hex}</span>
                </div>
                <div className="mt-3">
                  <h3 className="font-bold text-stone-900">{color.name}</h3>
                  <code className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded mt-1 inline-block">
                    {color.class.replace('bg-', 'text-')} / {color.class}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Typography Spec
// ----------------------------------------------------------------------
function TypographySpec() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-2">字體家族 (Font Family)</h2>
        <p className="text-stone-500 mb-6">全站預設使用 Noto Sans TC (思源黑體) 搭配系統無襯線字體。</p>
        
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-4xl font-sans font-bold text-stone-900 mb-4">Noto Sans TC / Inter</div>
          <code className="text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-lg">font-sans</code>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">標題階層 (Headings)</h2>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
          <div className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-stone-50 transition-colors">
            <div className="col-span-3 text-stone-400 font-mono text-sm">H1 (text-4xl / text-5xl)</div>
            <div className="col-span-9 text-5xl font-bold text-stone-900 tracking-tight">打造美好生活體驗</div>
          </div>
          <div className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-stone-50 transition-colors">
            <div className="col-span-3 text-stone-400 font-mono text-sm">H2 (text-3xl)</div>
            <div className="col-span-9 text-3xl font-bold text-stone-900 tracking-tight">專業服務項目</div>
          </div>
          <div className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-stone-50 transition-colors">
            <div className="col-span-3 text-stone-400 font-mono text-sm">H3 (text-2xl)</div>
            <div className="col-span-9 text-2xl font-bold text-stone-900 tracking-tight">最新案例分享</div>
          </div>
          <div className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-stone-50 transition-colors">
            <div className="col-span-3 text-stone-400 font-mono text-sm">H4 (text-xl)</div>
            <div className="col-span-9 text-xl font-bold text-stone-900 tracking-tight">合作夥伴推薦</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">內文與小字 (Body & Caption)</h2>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
          <div className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-stone-50 transition-colors">
            <div className="col-span-3 text-stone-400 font-mono text-sm">Body Large (text-lg)</div>
            <div className="col-span-9 text-lg text-stone-700 leading-relaxed">
              我們致力於提供最優質的服務，讓您的生活更加便利與舒適。每一個細節都經過精心設計，確保為您帶來無與倫比的體驗。
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-stone-50 transition-colors">
            <div className="col-span-3 text-stone-400 font-mono text-sm">Body Default (text-base)</div>
            <div className="col-span-9 text-base text-stone-600 leading-relaxed">
              我們致力於提供最優質的服務，讓您的生活更加便利與舒適。每一個細節都經過精心設計，確保為您帶來無與倫比的體驗。
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-stone-50 transition-colors">
            <div className="col-span-3 text-stone-400 font-mono text-sm">Caption (text-sm)</div>
            <div className="col-span-9 text-sm text-stone-500 leading-relaxed">
              請注意：以上服務內容可能會根據實際情況進行調整。我們保留最終解釋權。如需進一步了解，請聯繫我們的客服團隊。
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Spacing Spec
// ----------------------------------------------------------------------
function SpacingSpec() {
  const spacings = [
    { size: "2", px: "8px", desc: "微小間距、圖標與文字" },
    { size: "4", px: "16px", desc: "組件內邊距、相鄰元素" },
    { size: "6", px: "24px", desc: "卡片內邊距、一般區塊" },
    { size: "8", px: "32px", desc: "大卡片內邊距、區塊間距" },
    { size: "12", px: "48px", desc: "章節間距" },
    { size: "16", px: "64px", desc: "大章節間距 (Desktop)" },
    { size: "24", px: "96px", desc: "頁面區塊主間距 (Desktop)" },
  ];

  const radiuses = [
    { class: "rounded", value: "0.25rem (4px)", desc: "一般按鈕、輸入框" },
    { class: "rounded-lg", value: "0.5rem (8px)", desc: "大按鈕、小卡片" },
    { class: "rounded-xl", value: "0.75rem (12px)", desc: "中型卡片、圖片" },
    { class: "rounded-2xl", value: "1rem (16px)", desc: "大型卡片、區塊背景" },
    { class: "rounded-[1.5rem]", value: "1.5rem (24px)", desc: "特殊卡片設計" },
    { class: "rounded-full", value: "9999px", desc: "藥丸按鈕、頭像" },
  ];

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">間距系統 (Spacing)</h2>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
          {spacings.map((s, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-2 text-stone-900 font-bold font-mono">spacing-{s.size}</div>
              <div className="col-span-2 text-stone-500 font-mono text-sm">{s.px}</div>
              <div className="col-span-4 text-stone-600 text-sm">{s.desc}</div>
              <div className="col-span-4 flex items-center">
                <div className="bg-primary/20 h-4 rounded-sm" style={{ width: s.px }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">圓角系統 (Border Radius)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {radiuses.map((r, idx) => (
            <div key={idx} className="bg-white p-6 border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className={`w-16 h-16 bg-primary mb-4 ${r.class}`}></div>
              <code className="text-sm font-bold text-stone-900 mb-1">{r.class}</code>
              <span className="text-xs font-mono text-stone-400 mb-2">{r.value}</span>
              <span className="text-xs text-stone-500">{r.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. Component Spec
// ----------------------------------------------------------------------
function ComponentSpec() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">按鈕 (Buttons)</h2>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 flex flex-wrap gap-6 items-end">
          <div className="space-y-2">
            <span className="text-xs text-stone-400 font-mono block">Primary Solid</span>
            <button className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
              主要操作
            </button>
          </div>
          
          <div className="space-y-2">
            <span className="text-xs text-stone-400 font-mono block">Secondary Outline</span>
            <button className="border-2 border-stone-200 hover:border-primary text-stone-700 hover:text-primary font-bold py-3 px-8 rounded-full transition-colors bg-white">
              次要操作
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-stone-400 font-mono block">Ghost Button</span>
            <button className="text-stone-500 hover:text-primary font-bold py-3 px-4 rounded-lg transition-colors hover:bg-stone-50">
              一般連結
            </button>
          </div>
          
          <div className="space-y-2">
            <span className="text-xs text-stone-400 font-mono block">Small Action</span>
            <button className="bg-primary/10 hover:bg-primary/20 text-primary font-bold py-1.5 px-4 rounded-lg transition-colors text-sm">
              小操作
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">輸入框 (Inputs & Controls)</h2>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 max-w-xl space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">一般輸入框</label>
            <input 
              type="text" 
              placeholder="請輸入文字..." 
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-stone-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">下拉選單</label>
            <select className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-stone-900">
              <option>選項 1</option>
              <option>選項 2</option>
            </select>
          </div>
          
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-primary rounded border-stone-300 focus:ring-primary" checked readOnly />
              <span className="text-stone-700 font-medium">核取方塊 (已選)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" className="w-5 h-5 text-primary border-stone-300 focus:ring-primary" checked readOnly />
              <span className="text-stone-700 font-medium">單選框 (已選)</span>
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">卡片 (Cards)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Type 1 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-500 mb-4">
              <LayoutTemplate size={24} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">標準內容卡片</h3>
            <p className="text-stone-600 mb-4 text-sm leading-relaxed">用於顯示服務項目、功能介紹。帶有輕微的陰影和圓角設計，hover 時會增加陰影深度。</p>
            <a href="#" className="inline-flex items-center gap-1 text-primary font-bold hover:text-primary-light text-sm">
              了解更多 <ChevronRight size={16} />
            </a>
          </div>

          {/* Card Type 2 */}
          <div className="bg-stone-50 rounded-2xl p-8 hover:bg-stone-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">背景色塊卡片</h3>
            <p className="text-stone-600 mb-4 text-sm leading-relaxed">使用 stone-50 作為背景色，無邊框設計，用於強調特點或列表項目中的次要資訊。</p>
            <button className="bg-white px-4 py-2 rounded-lg font-bold text-sm text-stone-700 shadow-sm border border-stone-200">
              操作按鈕
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
