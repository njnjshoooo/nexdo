import React, { useEffect, useState } from 'react';
import { FormSubmission } from '../../types/form';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Clock, ChevronRight, ClipboardList, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submissionService } from '../../services/submissionService';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const all = await submissionService.getAll();
        // Filter by user ID and exclude processed ones (which are now orders)
        const userSubmissions = all.filter(s => 
          s.userId === user?.id && s.status !== 'PROCESSED'
        );
        // Sort by date descending
        userSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSubmissions(userSubmissions);
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubmissions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusDisplay = (status?: FormSubmission['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full text-xs font-bold"><Clock size={14} /> 預約審核中</span>;
      case 'ASSIGNED':
        return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold"><Calendar size={14} /> 已安排服務</span>;
      case 'QUOTED':
        return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full text-xs font-bold"><ClipboardList size={14} /> 報價已產生</span>;
      default:
        return <span className="flex items-center gap-1.5 text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full text-xs font-bold"><Clock size={14} /> 待處理</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-20 flex items-center justify-center">
        <div className="text-stone-400 animate-pulse">載入中...</div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Calendar className="text-stone-400 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">尚無預約紀錄</h1>
          <p className="text-stone-500 mb-10">您目前沒有進行中的預約申請。</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all"
          >
            查看服務項目
          </button>
        </div>
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

        <div className="space-y-6">
          {submissions.map((sub) => (
            <motion.div 
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
            >
              <div className="p-6 border-b border-stone-50 flex flex-wrap justify-between items-center gap-4 bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <ClipboardList className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">預約項目</p>
                    <p className="text-lg font-bold text-stone-800">{sub.pageTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">提交時間</p>
                    <p className="text-sm font-bold text-stone-600 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusDisplay(sub.status)}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">預約詳情</h3>
                    <div className="space-y-3">
                      {Object.entries(sub.data).map(([key, value]) => {
                        // Skip internal or hidden fields
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
                    <p className="text-sm font-bold text-stone-800 mb-2">預約處理中</p>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      專員正在審核您的預約需求，<br />
                      完成後將會轉為正式訂單並通知您。
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
