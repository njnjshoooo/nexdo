import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
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
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { orderService } from '../../services/orderService';
import { ORDER_STATUS_DEF } from '../../constants/orderStatus';
import { Link } from 'react-router-dom';
import AdminTable from '../../components/admin/AdminTable';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await orderService.getAll();
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
        
        // Helper to format date
        const formatDate = (timestamp: string | number) => new Date(timestamp).toISOString().split('T')[0];
        
        // 1. 今日營收 (Today's Revenue)
        const todayOrders = orders.filter(o => {
          if (!o.createdAt) return false;
          return formatDate(o.createdAt) === todayStr;
        });
        const validRevenueStatuses = ['PAID', 'PAYOUT_PROCESSING', 'COMPLETED', 'PENDING_PAYMENT', 'ASSIGNED', 'IN_PROGRESS', 'PENDING'];
        const todayRevenue = todayOrders
          .filter(o => validRevenueStatuses.includes(o.status))
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // 2. 本月訂單 (This Month's Orders)
        const thisMonthOrders = orders.filter(o => {
          if (!o.createdAt) return false;
          return formatDate(o.createdAt).startsWith(currentMonthStr);
        });
        const thisMonthCount = thisMonthOrders.length;
        
        // 3. 本月新增客戶 (New Customers This Month)
        const uniqueCustomers = new Set();
        thisMonthOrders.forEach(o => {
          if (o.customerInfo?.email) uniqueCustomers.add(o.customerInfo.email);
          else if (o.customerInfo?.phone) uniqueCustomers.add(o.customerInfo.phone);
        });
        const newCustomersCount = uniqueCustomers.size;

        // 4. 訂單完成率 (Order Completion Rate)
        const completedStatuses = ['COMPLETED', 'PAYOUT_REQUEST', 'PAYOUT_PROCESSING', 'PAID'];
        const completedCount = orders.filter(o => completedStatuses.includes(o.status)).length;
        const completionRate = orders.length > 0 ? ((completedCount / orders.length) * 100).toFixed(1) : '0.0';

        // 待處理訂單 (Pending Orders)
        const pendingStatuses = ['PENDING', 'UNAVAILABLE', 'NEW_QUOTE', 'QUOTE_REVIEW', 'QUOTING'];
        const pendingOrders = orders
          .filter(o => pendingStatuses.includes(o.status))
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5)
          .map(o => ({
            id: o.id,
            service: o.items[0]?.name || '未知服務',
            time: o.items[0]?.expectedDates || '未指定',
            customer: o.customerInfo?.name || '未知客戶',
            status: o.status
          }));
        const totalPendingCount = orders.filter(o => pendingStatuses.includes(o.status)).length;

        // 營收走勢分析 (Revenue Trend - Last 7 days)
        const revenueTrend = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const displayDate = `${d.getMonth() + 1}/${d.getDate()}`;
          
          const dayRevenue = orders
            .filter(o => o.createdAt && formatDate(o.createdAt) === dateStr && validRevenueStatuses.includes(o.status))
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            
          revenueTrend.push({ date: displayDate, amount: dayRevenue });
        }

        // 熱門服務佔比 (Popular Services)
        const serviceCounts: Record<string, number> = {};
        let totalValidItems = 0;
        orders.forEach(o => {
          o.items.forEach(item => {
            const baseName = item.name.split(' - ')[0];
            serviceCounts[baseName] = (serviceCounts[baseName] || 0) + 1;
            totalValidItems++;
          });
        });
        
        const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];
        const popularServices = Object.entries(serviceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, count], index) => ({
            name,
            value: totalValidItems > 0 ? Math.round((count / totalValidItems) * 100) : 0,
            color: COLORS[index % COLORS.length]
          }));

        // 最新訂單動態 (Recent Orders)
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5)
          .map(o => {
            const statusDef = ORDER_STATUS_DEF[o.status];
            return {
              id: o.id,
              customer: o.customerInfo?.name || '未知客戶',
              service: o.items[0]?.name || '未知服務',
              amount: `NT$ ${o.totalAmount?.toLocaleString() || 0}`,
              status: statusDef?.adminLabel || o.status,
              statusColor: statusDef?.color || 'bg-stone-100 text-stone-700'
            };
          });

        setDashboardData({
          kpis: [
            { 
              label: '今日營收', 
              value: `NT$ ${todayRevenue.toLocaleString()}`, 
              change: '', 
              isPositive: true, 
              icon: DollarSign, 
              color: 'text-emerald-600', 
              bg: 'bg-emerald-50' 
            },
            { 
              label: '本月訂單', 
              value: thisMonthCount.toString(), 
              change: '', 
              isPositive: true, 
              icon: ShoppingCart, 
              color: 'text-blue-600', 
              bg: 'bg-blue-50',
              subtext: `待處理: ${totalPendingCount}`
            },
            { 
              label: '本月新增客戶', 
              value: newCustomersCount.toString(), 
              change: '', 
              isPositive: true, 
              icon: Users, 
              color: 'text-violet-600', 
              bg: 'bg-violet-50' 
            },
            { 
              label: '訂單完成率', 
              value: `${completionRate}%`, 
              change: '', 
              isPositive: true, 
              icon: TrendingUp, 
              color: 'text-amber-600', 
              bg: 'bg-amber-50' 
            },
          ],
          pendingOrders,
          totalPendingCount,
          revenueTrend,
          popularServices,
          recentOrders
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64 animate-in fade-in duration-500">
        <div className="text-stone-500 font-medium flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-stone-300 border-t-primary rounded-full animate-spin"></div>
          載入數據中...
        </div>
      </div>
    );
  }

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
        {dashboardData.kpis.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
                <kpi.icon size={24} />
              </div>
              {kpi.change && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  kpi.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {kpi.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.change}
                </div>
              )}
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
                <LineChart data={dashboardData.revenueTrend}>
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
              <AdminTable.Main>
                <AdminTable.Head>
                  <tr>
                    <AdminTable.Th>客戶名稱</AdminTable.Th>
                    <AdminTable.Th>服務項目</AdminTable.Th>
                    <AdminTable.Th>金額</AdminTable.Th>
                    <AdminTable.Th>狀態</AdminTable.Th>
                    <AdminTable.Th className="text-right">操作</AdminTable.Th>
                  </tr>
                </AdminTable.Head>
                <AdminTable.Body>
                  {dashboardData.recentOrders.map((order: any) => (
                    <AdminTable.Row key={order.id}>
                      <AdminTable.Td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">
                            {order.customer[0]}
                          </div>
                          <span className="font-medium text-stone-900">{order.customer}</span>
                        </div>
                      </AdminTable.Td>
                      <AdminTable.Td className="text-stone-600 text-sm">{order.service}</AdminTable.Td>
                      <AdminTable.Td className="font-bold text-stone-900 text-sm">{order.amount}</AdminTable.Td>
                      <AdminTable.Td>
                        <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold", order.statusColor)}>
                          {order.status}
                        </span>
                      </AdminTable.Td>
                      <AdminTable.Td className="text-right">
                        <Link to={`/admin/orders/${order.id}`} className="text-stone-400 hover:text-stone-900 transition-colors inline-block">
                          <ChevronRight size={18} />
                        </Link>
                      </AdminTable.Td>
                    </AdminTable.Row>
                  ))}
                </AdminTable.Body>
              </AdminTable.Main>
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
                    data={dashboardData.popularServices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.popularServices.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {dashboardData.popularServices.map((service: any, idx: number) => (
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
                {dashboardData.totalPendingCount} 筆
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.pendingOrders.length > 0 ? dashboardData.pendingOrders.map((order: any) => (
                <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-start gap-4 p-3 hover:bg-stone-50 rounded-2xl transition-colors border border-transparent hover:border-stone-100 group">
                  <div className="bg-stone-100 p-2 rounded-xl text-stone-500 group-hover:bg-white transition-colors">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 truncate">{order.service}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span>{order.customer}</span>
                      <span className="text-stone-300">•</span>
                      <span className="truncate">{order.time}</span>
                    </div>
                  </div>
                  <div className="text-stone-400 group-hover:text-stone-900">
                    <ChevronRight size={16} />
                  </div>
                </Link>
              )) : (
                <div className="text-center py-8 text-stone-500 text-sm">目前沒有待處理的訂單</div>
              )}
            </div>
            <Link to="/admin/orders" className="block text-center w-full mt-6 py-3 border border-stone-200 rounded-2xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all">
              查看所有訂單
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

