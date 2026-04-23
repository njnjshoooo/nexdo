import React, { useEffect, useState } from 'react';
import { FormSubmission } from '../../types/form';
import { Order } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, ClipboardList, AlertCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submissionService } from '../../services/submissionService';
import { orderService } from '../../services/orderService';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');
  const navigate = useNavigate();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allSubmissions, allOrders] = await Promise.all([
          submissionService.getAll(),
          orderService.getAll()
        ]);

        // Filter orders by user ID
        const userOrders = allOrders.filter(o => o.userId === user?.id);
        
        // Filter submissions by user ID
        const userSubmissions = allSubmissions.filter(s => s.userId === user?.id);

        setSubmissions(userSubmissions);
        setOrders(userOrders);
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }

    const handleUpdate = () => {
      if (user) fetchData();
    };

    window.addEventListener('orders_updated', handleUpdate);
    return () => {
      window.removeEventListener('orders_updated', handleUpdate);
    };
  }, [user]);

  const unifiedItems = submissions
    .map(s => ({ ...s, type: 'submission' as const }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const processedSubmissionIds = new Set([
    ...submissions.filter(s => s.status === 'PROCESSED').map(s => s.id),
    ...orders.map(o => o.submissionId).filter(Boolean) as string[]
  ]);

  const filteredItems = unifiedItems.filter(item => {
    const isProcessed = processedSubmissionIds.has(item.id);
    return activeTab === 'ongoing' ? !isProcessed : isProcessed;
  });

  const getStatusDisplay = (item: any) => {
    const isProcessed = processedSubmissionIds.has(item.id);
    
    if (isProcessed) {
      return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold">已轉為訂單</span>;
    }
    return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold">預約處理中</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-20 flex items-center justify-center">
        <div className="text-stone-400 animate-pulse">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-900 mb-10 flex items-center gap-3">
          <Calendar className="text-primary" />
          我的預約紀錄
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'ongoing' ? 'text-primary' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            進行中
            {activeTab === 'ongoing' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeTab === 'history' ? 'text-primary' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            歷史預約
            {activeTab === 'history' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-stone-300" size={32} />
            </div>
            <p className="text-stone-500 font-medium">尚無{activeTab === 'ongoing' ? '進行中' : '歷史'}預約紀錄</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              const title = item.pageTitle || '預約項目';
              
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
                >
                  <button 
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left p-6 flex flex-wrap justify-between items-center gap-4 bg-stone-50/50 hover:bg-stone-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm">
                        <ClipboardList className="text-primary" size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">預約項目</p>
                        <p className="text-lg font-bold text-stone-800">{title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">提交時間</p>
                        <p className="text-sm font-bold text-stone-600 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusDisplay(item)}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="text-stone-400" size={20} />
                        </motion.div>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`content-${item.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-t border-stone-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">預約詳情</h3>
                              <div className="space-y-3">
                                <div className="flex flex-col sm:hidden mb-4">
                                  <span className="text-xs text-stone-400">提交時間</span>
                                  <span className="text-sm font-medium text-stone-700">
                                    {new Date(item.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                {Object.entries(item.data).map(([key, value]) => {
                                  if (key.startsWith('_') || key === 'page_slug' || key === 'page_title' || key === 'userId') return null;
                                  return (
                                    <div key={key} className="flex flex-col">
                                      <span className="text-xs text-stone-400">{key}</span>
                                      <span className="text-sm font-medium text-stone-700">
                                        {typeof value === 'string' ? value : JSON.stringify(value)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div className="bg-stone-50 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <AlertCircle className="text-primary" size={24} />
                              </div>
                              <p className="text-sm font-bold text-stone-800 mb-2">
                                {processedSubmissionIds.has(item.id) ? '已轉為訂單' : '預約處理中'}
                              </p>
                              <p className="text-xs text-stone-500 leading-relaxed">
                                {processedSubmissionIds.has(item.id) 
                                  ? '您的預約已成功轉為正式訂單，您可以在「我的訂單紀錄」中查看進度。' 
                                  : '專員正在審核您的預約需求，完成後將會轉為正式訂單並通知您。'}
                              </p>
                              {processedSubmissionIds.has(item.id) && (
                                <button 
                                  onClick={() => navigate('/profile/orders')}
                                  className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  查看訂單詳情 <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
