import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';

export const homePage: Page = {
  id: 'home',
  slug: 'home',
  title: '首頁',
  template: 'HOME',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    showForm: true,
    formId: '0', 
    home: {
      blocks: [
        {
          id: 'hero',
          type: 'HERO_1',
          hero1: {
            title: '陪伴您把居家環境變安全，\n擁有安心自在的樂齡日常。',
            image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=1200',
            buttons: [
              { text: '居住安全', link: '/home-safety' },
              { text: '清潔收納', link: '/cleaning' },
              { text: '樂齡健康', link: '/health' },
              { text: '租房搬家', link: '/rent-and-move' },
            ],
            // 💡 漂浮小卡資料
            floatingCard: {
              text: '「謝謝你們，讓媽媽願意接受浴室改裝，現在她洗澡安全多了，我也終於能放心。」',
              author: '台北市 林小姐 (42歲)'
            }
          }
        },
        {
          id: 'services-block',
          type: 'SERVICES',
          services: [
            // 💡 第一個項目：對應綠底樣式 (居住安全)
            {
              pageId: 'home-safety',
              title: '居住安全', // 💡 補上這個
              description: '陪您看見家裡習以為常的隱形風險，把家打理成最安心的樣子。',
              tags: ['#衛浴裝修', '#安全評估', '#舊屋診斷'],
              image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
              testimonial: {
                text: '很多人的第一步，都是從居住安全開始',
                author: '王先生 | 新北市'
              }
            },
            // 💡 第二個項目：對應白底樣式 (收納清潔)
            {
              pageId: 'cleaning',
              title: '收納清潔', // 💡 補上這個
              description: '打理好囤積的角落，還給你更舒適自在的空間。',
              tags: ['#室內清運', '#居家整聊', '#收納整理'],
              image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200',
              testimonial: {
                text: '清掉的不職是雜物，更是心裡的負擔',
                author: '林小姐 | 台北市'
              }
            },
            // 💡 第三個項目：對應白底樣式 (樂齡健康)
            {
              pageId: 'health',
              title: '樂齡健康', // 💡 補上這個
              description: '打理好身體的基礎，去哪裡、吃什麼都能自己作主。',
              tags: ['#到府體適能', '#牙科衛教', '#營養諮詢'],
              image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1200',
              testimonial: {
                text: '身體硬朗了，想去哪裡玩都不是問題',
                author: '陳伯伯 | 桃園市'
              }
            },
            // 💡 第四個項目：對應白底樣式 (租房搬家)
            {
              pageId: 'rent-and-move',
              title: '適老換屋', // 💡 補上這個
              description: '輕鬆轉換生活環境，享受更適合的居住空間。',
              tags: ['#代租代管', '#適老換屋', '#安心移居'],
              image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200',
              testimonial: {
                text: '生活品質提升，出門更方便了',
                author: '王伯伯｜宜蘭縣'
              }
            }
          ]
        },
        {
          id: 'additional-services-block',
          type: 'ADDITIONAL_SERVICES',
          // 💡 這裡放你想在橫向捲軸顯示的 SubItem 頁面 ID 或 Slug
          additionalServices: ['health-fitness', 'moving', 'finance'] 
        },
        {
          id: 'more-services-block',
          type: 'MORE_SERVICES',
          moreServices: {
            title: '我們還提供',
            description: '除了核心服務，我們也提供多元的居家支援，全方位守護您的樂齡生活。',
            pageIds: [
              'home-reorganization',
              'elderly-housing-exchange',
              'rental-management',
              'decor-design',
              'safety-assessment'
            ]
          }
        },
        {
          id: 'process-block',
          type: 'PROCESS',
          process: {
          title: '簡單四步驟，開啟安心生活',
          description: '我們簡化了繁瑣的流程，讓您能快速獲得專業協助。全程透明溝通，尊重您與長輩的每一個決定。',
          steps: [
              {
              icon: 'MessageCircle', // 💡 改用字串，組件內再轉換
              title: '初步諮詢',
              desc: '透過 Line 或電話，簡單說明您的困擾與長輩狀況。',
              action: '免費',
              },
              {
              icon: 'ClipboardCheck',
              title: '到府評估',
              desc: '專業顧問親自到府，進行環境安全診斷與需求訪談。',
              action: '專業診斷',
              },
              {
              icon: 'FileText',
              title: '提案規劃',
              desc: '提供客製化改善方案與報價，充分溝通不強迫推銷。',
              action: '透明報價',
              },
              {
              icon: 'Wrench',
              title: '執行驗收',
              desc: '專業團隊進場施作，完工後詳細解說使用方式。',
              action: '安心保固',
              },
            ]
          }
        },
        // 在 home.ts 的 blocks 陣列中新增：
        {
          id: 'testimonials-block',
          type: 'TESTIMONIALS',
          items: [
            {
              content: "原本很擔心爸爸會排斥裝扶手，覺得那是『老人才需要的東西』。但好齡居的顧問很會溝通，說是為了『更方便運動』，爸爸反而很開心接受了。現在浴室安全多了！",
              author: "陳小姐",
              role: "上班族 / 父親78歲",
              rating: 5,
              tag: "浴室防滑",
            },
            {
              content: "媽媽獨居在老公寓，堆滿了幾十年的雜物。整聊師非常有耐心，不是強迫丟棄，而是聽媽媽講故事，最後清出了好多空間。媽媽說房子變亮了，心情也變好了。",
              author: "林先生",
              role: "工程師 / 母親78歲",
              rating: 5,
              tag: "居家整聊",
            },
            {
              content: "工作太忙實在沒辦法一直陪著長輩看醫生或運動。好齡居的體適能教練直接到家裡，教練很幽默，現在阿公每週都很期待上課，精神真的變好很多。",
              author: "張太太",
              role: "家庭主婦 / 公公85歲",
              rating: 5,
              tag: "樂齡健康",
            }
          ]
        }
      ]
    }
  }
};
