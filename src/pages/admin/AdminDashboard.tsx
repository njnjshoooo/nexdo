import React from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Star, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 模擬數據 (MOCK_DASHBOARD_DATA)
const MOCK_DASHBOARD_DATA = {
  kpis: [
    { 
      label: '今日營收', 
      value: 'NT$ 12,850', 
      change: '+15.2%', 
      isPositive: true, 
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: '本月訂單', 
      value: '156', 
      change: '+8.4%', 
      isPositive: true, 
      icon: ShoppingCart, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      subtext: '待處理: 12 / 已完成: 144'
    },
    { 
      label: '新增會員', 
      value: '42', 
      change: '-2.1%', 
      isPositive: false, 
      icon: Users, 
      color: 'text-violet-600', 
      bg: 'bg-violet-50' 
    },
    { 
      label: '轉換率', 
      value: '3.8%', 
      change: '+0.5%', 
      isPositive: true, 
      icon: TrendingUp, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ],
  pendingOrders: [
    { id: '1', service: '居家深層清潔', time: '今日 14:00', customer: '張小姐' },
    { id: '2', service: '樂齡陪伴服務', time: '今日 16:30', customer: '李先生' },
    { id: '3', service: '收納整理諮詢', time: '明日 10:00', customer: '王太太' },
    { id: '4', service: '居家安全評估', time: '3/21 09:00', customer: '陳先生' },
  ],
  reviews: [
    { id: '1', name: '林小姐', stars: 5, comment: '服務非常專業，清潔得很乾淨，態度也很好！', date: '2小時前' },
    { id: '2', name: '黃先生', stars: 2, comment: '預約時間遲到了 15 分鐘，雖然服務還可以但希望準時。', date: '5小時前' },
    { id: '3', name: '郭太太', stars: 4, comment: '收納整理後空間大了很多，非常有幫助。', date: '昨日' },
    { id: '4', name: '趙先生', stars: 3, comment: '價格稍微偏高，服務內容與預期有一點落差。', date: '2日前' },
  ],
  revenueTrend: [
    { date: '3/13', amount: 8200 },
    { date: '3/14', amount: 9500 },
    { date: '3/15', amount: 7800 },
    { date: '3/16', amount: 11200 },
    { date: '3/17', amount: 13500 },
    { date: '3/18', amount: 10800 },
    { date: '3/19', amount: 12850 },
  ],
  popularServices: [
    { name: '居家清潔', value: 45, color: '#10b981' },
    { name: '樂齡健康', value: 25, color: '#3b82f6' },
    { name: '收納整理', value: 20, color: '#8b5cf6' },
    { name: '其他服務', value: 10, color: '#f59e0b' },
  ],
  recentOrders: [
    { id: 'ORD-001', customer: '陳大文', service: '居家深層清潔', amount: 'NT$ 3,200', status: '已完成', statusColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'ORD-002', customer: '林美玲', service: '樂齡陪伴服務', amount: 'NT$ 1,500', status: '進行中', statusColor: 'bg-blue-100 text-blue-700' },
    { id: 'ORD-003', customer: '王小明', service: '收納整理諮詢', amount: 'NT$ 2,800', status: '待處理', statusColor: 'bg-amber-100 text-amber-700' },
    { id: 'ORD-004', customer: '張家豪', service: '居家安全評估', amount: 'NT$ 4,500', status: '已完成', statusColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'ORD-005', customer: '李淑芬', service: '冷氣清洗服務', amount: 'NT$ 2,200', status: '已取消', statusColor: 'bg-rose-100 text-rose-700' },
  ]
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">後台儀表板</h1>
          <p className="text-stone-500 mt-1">即時掌握營運數據與客戶反饋</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm flex items-center gap-2 text-sm font-medium text-stone-600">
            <Clock size={16} className="text-stone-400" />
            最後更新: {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200">
            下載報表
          </button>
        </div>
      </div>

      {/* 區塊 1：KPI 概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_DASHBOARD_DATA.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
                <kpi.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                kpi.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {kpi.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </div>
            </div>
            <h3 className="text-stone-500 text-sm font-medium mb-1">{kpi.label}</h3>
            <p className="text-3xl font-bold text-stone-900 tracking-tight">{kpi.value}</p>
            {kpi.subtext && <p className="text-xs text-stone-400 mt-2">{kpi.subtext}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 區塊 3：數據分析圖表 (左側 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 營收走勢 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-stone-900">營收走勢分析</h2>
                <p className="text-sm text-stone-500">近七日每日營收變化</p>
              </div>
              <select className="bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium px-3 py-1.5 outline-none focus:ring-2 focus:ring-stone-200">
                <option>最近 7 天</option>
                <option>最近 30 天</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DASHBOARD_DATA.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `NT$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`NT$ ${value}`, '營收']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#1c1917" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#1c1917', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 區塊 4：即時動態 (Table) */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">最新訂單動態</h2>
              <button className="text-stone-500 hover:text-stone-900 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50/50 text-stone-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">客戶名稱</th>
                    <th className="px-6 py-4 font-semibold">服務項目</th>
                    <th className="px-6 py-4 font-semibold">金額</th>
                    <th className="px-6 py-4 font-semibold">狀態</th>
                    <th className="px-6 py-4 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {MOCK_DASHBOARD_DATA.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">
                            {order.customer[0]}
                          </div>
                          <span className="font-medium text-stone-900">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600 text-sm">{order.service}</td>
                      <td className="px-6 py-4 font-bold text-stone-900 text-sm">{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold", order.statusColor)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-stone-400 hover:text-stone-900 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 區塊 2：待辦事項與反饋 (右側 1/3) */}
        <div className="space-y-8">
          {/* 熱門服務圓餅圖 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold text-stone-900 mb-6">熱門服務佔比</h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DASHBOARD_DATA.popularServices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MOCK_DASHBOARD_DATA.popularServices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {MOCK_DASHBOARD_DATA.popularServices.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }}></div>
                    <span className="text-stone-600">{service.name}</span>
                  </div>
                  <span className="font-bold text-stone-900">{service.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 待處理訂單 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900">待處理訂單</h2>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                {MOCK_DASHBOARD_DATA.pendingOrders.length} 筆
              </span>
            </div>
            <div className="space-y-4">
              {MOCK_DASHBOARD_DATA.pendingOrders.map((order) => (
                <div key={order.id} className="flex items-start gap-4 p-3 hover:bg-stone-50 rounded-2xl transition-colors border border-transparent hover:border-stone-100 group">
                  <div className="bg-stone-100 p-2 rounded-xl text-stone-500 group-hover:bg-white transition-colors">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 truncate">{order.service}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span>{order.customer}</span>
                      <span className="text-stone-300">•</span>
                      <span>{order.time}</span>
                    </div>
                  </div>
                  <button className="text-stone-400 hover:text-stone-900">
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-stone-200 rounded-2xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all">
              查看所有訂單
            </button>
          </div>

          {/* 最新評論 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold text-stone-900 mb-6">最新顧客評論</h2>
            <div className="space-y-6">
              {MOCK_DASHBOARD_DATA.reviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{review.name}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={cn(i < review.stars ? "fill-amber-400 text-amber-400" : "text-stone-200")} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                    {review.comment}
                  </p>
                  {review.stars <= 3 && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold">
                      <AlertCircle size={12} />
                      需要追蹤處理
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

