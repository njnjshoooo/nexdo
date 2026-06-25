import React from 'react';
import { motion } from 'motion/react';
import { User, HeartHandshake, Store, MapPin, CreditCard } from 'lucide-react';

export default function PeaceCard() {
  return (
    <section id="peace-card" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
            一張卡，串連起一個共融的安老生活圈
          </h2>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Left Column */}
          <div className="space-y-12 order-2 lg:order-1">
            {/* Elderly Use */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-4"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center justify-center md:justify-end gap-2">
                  長者使用
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  享受顧問服務、參加生活課程、加入社區活動。
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                <User size={32} />
              </div>
            </motion.div>

            {/* Merchant Participation */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-4"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center justify-center md:justify-end gap-2">
                  商家參與
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  導入「健康生活圈積點」制度，創造友善高齡商業生態。
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Store size={32} />
              </div>
            </motion.div>
          </div>

          {/* Center Card Visual */}
          <div className="order-1 lg:order-2 flex justify-center py-8 lg:py-0 relative">
            {/* Connecting Lines (Desktop only) */}
            <svg className="absolute inset-0 w-full h-full hidden lg:block pointer-events-none z-0" viewBox="0 0 400 400">
              {/* Top Left Line */}
              <path d="M100 100 Q 150 150 180 180" fill="none" stroke="#516438" strokeWidth="2" strokeDasharray="4 4" />
              {/* Bottom Left Line */}
              <path d="M100 300 Q 150 250 180 220" fill="none" stroke="#885200" strokeWidth="2" strokeDasharray="4 4" />
              {/* Top Right Line */}
              <path d="M300 100 Q 250 150 220 180" fill="none" stroke="#885200" strokeWidth="2" strokeDasharray="4 4" />
              {/* Bottom Right Line */}
              <path d="M300 300 Q 250 250 220 220" fill="none" stroke="#516438" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-10 w-72 h-44 bg-gradient-to-br from-primary to-[#A06000] rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
            >
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">好</div>
                <span className="text-sm font-medium tracking-wider">好齡居</span>
              </div>
              <div className="text-center mt-2">
                <h3 className="text-3xl font-bold tracking-widest mb-1">安心卡</h3>
                <p className="text-[10px] tracking-[0.2em] opacity-80 uppercase">Peace of Mind</p>
              </div>
              <div className="absolute bottom-4 right-4 opacity-50">
                <CreditCard size={24} />
              </div>
              {/* Chip */}
              <div className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-8 bg-yellow-200/80 rounded-md overflow-hidden border border-yellow-300/50">
                <div className="w-full h-full relative">
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-stone-800/20"></div>
                  <div className="absolute top-0 left-1/2 h-full w-[1px] bg-stone-800/20"></div>
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-stone-800/20 rounded-sm"></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-12 order-3">
            {/* Children Support */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col md:flex-row items-center text-center md:text-left gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 md:order-first">
                <HeartHandshake size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary md:hidden"></span>
                  子女支持
                  <span className="w-2 h-2 rounded-full bg-primary hidden md:block"></span>
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  可代為儲值，成為「一起守護爸媽的行動帳戶」。
                </p>
              </div>
            </motion.div>

            {/* Community Connection */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row items-center text-center md:text-left gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0 md:order-first">
                <MapPin size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary md:hidden"></span>
                  社區連結
                  <span className="w-2 h-2 rounded-full bg-secondary hidden md:block"></span>
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  串聯在地資源，建立 10分鐘生活圈。
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-20 text-center max-w-4xl mx-auto bg-warm-gray p-8 rounded-2xl border border-stone-200">
          <h4 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
            安心卡成為在地安老平台的金融入口
          </h4>
          <p className="text-lg text-stone-700 leading-relaxed">
            把「<span className="text-primary font-bold">顧問陪伴</span>、<span className="text-primary font-bold">儲值金流</span>、<span className="text-primary font-bold">社區參與</span>」結合成一個讓長輩安心、子女放心的支持系統。
          </p>
        </div>
      </div>
    </section>
  );
}
