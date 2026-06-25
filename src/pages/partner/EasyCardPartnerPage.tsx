/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 好齡居 × 悠遊卡 特惠服務預約頁
 * 隱藏頁面 - 僅供悠遊卡會員透過專屬連結進入
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const GOOGLE_FORM_URL = 'https://forms.gle/YzwHxwCfpEjdAZ3K9';

// 悠遊卡品牌色（Easy Card 經典青綠色系）
const EASYCARD_TEAL = '#00A29A';
const EASYCARD_TEAL_DARK = '#007C77';

const BENEFITS = [
  {
    icon: '🏠',
    title: '居家安全免費評估',
    desc: '專業顧問到府檢視長輩居住環境，提供安全改善建議',
  },
  {
    icon: '🧹',
    title: '整理收納諮詢優惠',
    desc: '悠遊卡會員專屬折扣，打造舒適無障礙的生活空間',
  },
  {
    icon: '💚',
    title: '樂齡健康諮詢',
    desc: '飲食、運動、醫療陪同等全方位樂齡生活支持',
  },
  {
    icon: '🔑',
    title: '租房搬家協助',
    desc: '適老宅搬遷、居住租借媒合，解決長輩搬遷困擾',
  },
];

const STEPS = [
  { num: '01', title: '填寫預約表單', desc: '留下您的聯絡資訊與服務需求' },
  { num: '02', title: '專人聯繫確認', desc: '好齡居顧問將於 1~3 個工作日聯繫您' },
  { num: '03', title: '安排到府服務', desc: '依您方便的時間安排專屬服務' },
];

const EasyCardPartnerPage: React.FC = () => {
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    document.title = '好齡居 × 悠遊卡 會員專屬特惠｜NEXDO';
  }, []);

  const scrollToForm = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* ===== 頂部雙品牌 Header ===== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 好齡居 Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform"
                style={{ backgroundColor: '#885200' }}
              >
                好
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-bold text-stone-900">好齡居</div>
                <div className="text-[10px] sm:text-xs text-stone-500 tracking-wider">NEXDO</div>
              </div>
            </Link>

            {/* 中間的 x 符號 */}
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-stone-300 text-xl sm:text-2xl font-light">×</span>
            </div>

            {/* 悠遊卡 Logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${EASYCARD_TEAL} 0%, ${EASYCARD_TEAL_DARK} 100%)`,
                }}
              >
                <span className="text-[10px] leading-tight text-center">
                  Easy
                  <br />
                  Card
                </span>
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-bold text-stone-900">悠遊卡</div>
                <div className="text-[10px] sm:text-xs text-stone-500 tracking-wider">EASY CARD</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden">
        {/* 背景漸層 */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(135deg, #FEFDF9 0%, #F0FAF9 50%, #FEFDF9 100%)`,
          }}
        />
        {/* 裝飾圓點 */}
        <div
          className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: EASYCARD_TEAL }}
        />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl bg-primary" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            {/* 合作徽章 */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: `${EASYCARD_TEAL}15`,
                color: EASYCARD_TEAL_DARK,
                border: `1px solid ${EASYCARD_TEAL}30`,
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: EASYCARD_TEAL }} />
              悠遊卡會員專屬合作
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-6">
              讓長輩住得更安心，
              <br className="hidden sm:block" />
              <span className="text-primary">由我們一起守護。</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10">
              好齡居攜手悠遊卡，為您的家人量身打造樂齡居住解方。
              <br />
              填寫預約表單即享悠遊卡會員專屬優惠服務。
            </p>

            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              style={{
                background: `linear-gradient(135deg, #885200 0%, #B36B00 100%)`,
              }}
            >
              立即預約特惠服務
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ===== 服務亮點 ===== */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div
              className="inline-block text-xs font-semibold tracking-[0.2em] mb-3"
              style={{ color: EASYCARD_TEAL_DARK }}
            >
              EXCLUSIVE BENEFITS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
              悠遊卡會員獨享四大服務
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="group relative bg-warm-bg border border-stone-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* 頂部色條 */}
                <div
                  className="absolute top-0 left-6 right-6 h-1 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, ${EASYCARD_TEAL} 0%, #885200 100%)`,
                  }}
                />
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 服務流程 ===== */}
      <section className="py-16 sm:py-20 bg-warm-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div
              className="inline-block text-xs font-semibold tracking-[0.2em] mb-3 text-primary"
            >
              HOW IT WORKS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">簡單三步驟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="relative">
                {/* 連接線（桌面） */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-stone-300 to-transparent" />
                )}
                <div className="relative bg-white rounded-2xl p-6 shadow-sm">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-md"
                    style={{
                      background: idx % 2 === 0
                        ? `linear-gradient(135deg, ${EASYCARD_TEAL} 0%, ${EASYCARD_TEAL_DARK} 100%)`
                        : `linear-gradient(135deg, #885200 0%, #B36B00 100%)`,
                    }}
                  >
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Google Form 嵌入區 ===== */}
      <section id="booking-form" className="py-16 sm:py-20 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div
              className="inline-block text-xs font-semibold tracking-[0.2em] mb-3"
              style={{ color: EASYCARD_TEAL_DARK }}
            >
              BOOKING FORM
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              立即預約專屬服務
            </h2>
            <p className="text-stone-600 leading-relaxed">
              請填寫以下資訊，我們將儘速與您聯繫
              <br className="sm:hidden" />
              並提供悠遊卡會員專屬優惠。
            </p>
          </div>

          {/* 表單容器 */}
          <div className="relative bg-warm-bg rounded-3xl overflow-hidden border border-stone-200 shadow-xl">
            {/* 表單頂部雙品牌標記 */}
            <div
              className="flex items-center justify-center gap-3 px-6 py-4 border-b border-stone-200"
              style={{
                background: `linear-gradient(90deg, ${EASYCARD_TEAL}08 0%, #88520008 100%)`,
              }}
            >
              <span className="text-xs sm:text-sm font-semibold text-stone-700">好齡居</span>
              <span className="text-stone-400">×</span>
              <span className="text-xs sm:text-sm font-semibold text-stone-700">悠遊卡</span>
              <span className="text-stone-400">•</span>
              <span className="text-xs text-stone-500">會員專屬預約</span>
            </div>

            {/* Loading 遮罩 */}
            {!formLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-warm-bg z-10 pointer-events-none"
                   style={{ top: '57px' }}>
                <div className="flex flex-col items-center gap-3 text-stone-500">
                  <div
                    className="w-10 h-10 border-4 rounded-full animate-spin"
                    style={{ borderColor: `${EASYCARD_TEAL}30`, borderTopColor: EASYCARD_TEAL }}
                  />
                  <span className="text-sm">表單載入中...</span>
                </div>
              </div>
            )}

            {/* Google Form iframe */}
            <iframe
              src={GOOGLE_FORM_URL}
              title="好齡居 × 悠遊卡 會員專屬預約表單"
              className="w-full block"
              style={{ height: '1200px', border: 'none' }}
              onLoad={() => setFormLoaded(true)}
            >
              載入中…
            </iframe>
          </div>

          {/* 替代選項 */}
          <div className="mt-6 text-center text-sm text-stone-500">
            若表單無法正常顯示，請
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 mx-1 hover:opacity-80 transition-opacity"
              style={{ color: EASYCARD_TEAL_DARK }}
            >
              點此開啟表單
            </a>
          </div>
        </div>
      </section>

      {/* ===== 聯絡資訊 ===== */}
      <section className="py-12 bg-stone-900 text-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: '#B36B00' }}
                >
                  好
                </div>
                <span className="text-sm font-semibold">好齡居 NEXDO</span>
              </div>
              <span className="text-stone-500">×</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-[9px]"
                  style={{
                    background: `linear-gradient(135deg, ${EASYCARD_TEAL} 0%, ${EASYCARD_TEAL_DARK} 100%)`,
                  }}
                >
                  Easy
                  <br />
                  Card
                </div>
                <span className="text-sm font-semibold">悠遊卡</span>
              </div>
            </div>

            <div className="text-center md:text-right text-xs sm:text-sm text-stone-400">
              <div>若有任何疑問，歡迎聯繫好齡居客服</div>
              <div className="mt-1">© {new Date().getFullYear()} 好齡居 NEXDO × 悠遊卡 會員專屬合作</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EasyCardPartnerPage;
