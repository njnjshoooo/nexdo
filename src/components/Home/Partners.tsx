import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

// 定義後台管理欄位結構 (Backend Data Schema)
// 1. 分類對應：對應六大服務分類
type ServiceCategory = '居住安全' | '收納清潔' | '樂齡健康' | '租房搬家' | '居家裝潢' | '高齡理財';

interface PartnerData {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  isCertified: boolean; // 2. 信任背書：3階段嚴選認證開關 (Boolean)
  certificationBadgeUrl?: string; // 認證標章圖片 (Optional)
}

const partners: PartnerData[] = [
  {
    id: '1',
    name: 'ZUYOU 租寓',
    category: '租房搬家',
    description: '包租代管領導品牌',
    isCertified: true,
  },
  {
    id: '2',
    name: 'Home Angel 家天使',
    category: '樂齡健康',
    description: '專業居家照顧平台',
    isCertified: true,
  },
  {
    id: '3',
    name: 'DO UP',
    category: '居家裝潢',
    description: '空間規劃軟裝專家',
    isCertified: true,
  },
  {
    id: '4',
    name: '信義房屋',
    category: '居住安全',
    description: '社區服務夥伴',
    isCertified: true,
  }
];

export default function Partners() {
  return (
    <section id="partners" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-secondary mb-8 leading-tight tracking-tight">
              深耕社區，<br />
              連結最專業的團隊
            </h2>
            <p className="text-xl text-stone-600 leading-relaxed mb-10 font-light">
              好齡居 (NEXDO) 的核心團隊來自於不動產物業管理、服務設計、高齡護理等專業背景。我們與台灣最優秀的居家服務品牌合作，為您提供高品質、可信任的整合服務。
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="bg-secondary p-4 rounded-xl text-white transition-transform group-hover:rotate-12 shadow-lg shadow-secondary/20">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-stone-800">專業背景</h4>
                  <p className="text-stone-600 text-lg">十年以上物業管理與長者服務實戰經驗</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="bg-primary p-4 rounded-xl text-white transition-transform group-hover:-rotate-12 shadow-lg shadow-primary/20">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-stone-800">品質保證</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-stone-600 text-lg">所有合作廠商皆通過高齡友善 3 階段嚴選認證</p>
                    {/* 模擬後台開關顯示的認證標章 */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <ShieldCheck size={12} className="mr-1" />
                      嚴選認證
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Visual & Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 space-y-8"
          >
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl relative group">
              <img
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop"
                alt="團隊與社區互動"
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 to-transparent"></div>
            </div>

            <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-stone-100 relative -mt-12 mx-4 lg:mx-0 z-10">
              <h3 className="text-xl font-bold text-center text-secondary mb-8 tracking-widest uppercase">
                策略合作夥伴
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {partners.map((p) => (
                  <div key={p.id} className="flex flex-col items-center p-4 border-b border-stone-100 hover:border-primary transition-all text-center group cursor-default">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-stone-800 text-lg group-hover:text-primary transition-colors">
                        {p.name}
                      </h5>
                      {p.isCertified && (
                        <div className="text-secondary" title="通過嚴選認證">
                          <ShieldCheck size={16} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">
                      {p.description}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {p.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
