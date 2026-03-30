import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';

export const peaceOfMindPage: Page = {
  id: 'peace-of-mind',
  slug: 'peace-of-mind',
  title: '加入安心卡',
  template: 'GENERAL',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE, // For type safety
    general: {
      blocks: [
        {
          id: 'block-1',
          type: 'HERO_2',
          hero2: {
            title: '用最熟悉的 YOYO 卡，嗶出優雅的安老生活',
            description: '安心卡與 YOYO 卡深度合作，長輩無需學習新 App，只要一張卡，就能有無痛儲存、生活打賞、守護紀錄等功能。讓長輩自在優遊，子女遠端守護更安心。',
            backgroundImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2070&auto=format&fit=crop',
            mainButton: { text: '立即加入安心卡', type: 'URL', value: '#', isVisible: true },
            secondaryButton: { text: '', type: 'URL', value: '#', isVisible: false }
          }
        },
        {
          id: 'block-2',
          type: 'GRID',
          grid: {
            title: '什麼是安心卡？ 一張卡，開啟您的「銀髮生活通行證」！',
            columns: 4,
            items: [
              {
                title: '連結多元居家服務',
                description: '整合社區特約餐廳、診所、藥局，以及好齡居各種到府服務，靠卡即預約！',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
                showImage: true
              },
              {
                title: '生活打賞，給予肯定',
                description: '滿意服務時，透過簡單「靠卡」給予協作者小費鼓勵，以「肯定」克服數位門檻 。',
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop',
                showImage: true
              },
              {
                title: '精準健康紀錄',
                description: '自動串連社區據點的體壓、體重數據，守護紀錄一目了然。',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
                showImage: true
              },
              {
                title: '緊急安全聯繫',
                description: '卡片內建緊急聯繫機制，萬一迷路或不適，據點與子女能第一時間接應。',
                image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
                showImage: true
              }
            ]
          }
        },
        {
          id: 'block-3',
          type: 'IMAGE_TEXT_GRID',
          imageTextGrid: {
            layout: 'imageLeft',
            image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop',
            title: '長輩超愛！找回尊嚴，生活更有「感」',
            content: '#### **不必帶錢包，嗶一下就走**\n結合既有習慣，去超商、領藥、參加活動，優雅享受生活，不用擔心找零或弄丟現金。\n\n#### **熟面孔串連安心社交**\n安心卡連動的是具備「信賴背書」的專業團隊。透過提供可信任、固定熟面孔的協作者到府服務，讓長輩安心無負擔，重新找回參與生活的動力。',
            cta: {
              text: '',
              link: '#'
            }
          }
        },
        {
          id: 'block-4',
          type: 'IMAGE_TEXT_GRID',
          imageTextGrid: {
            layout: 'imageRight',
            image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop',
            title: '子女也超愛！心意到位，守護更即時',
            content: '#### **遠端儲值，愛不間斷**\n透過悠遊付 App 預先儲值，消弭長輩「捨不得花錢」的心痛感，讓心意變成實實在在的照顧。\n\n#### **柔性守護，隱私無憂**\n透過靠卡動態間接掌握長輩安危，在建立安全網的同時，完整保留父母渴望獨立的心理空間。',
            cta: {
              text: '',
              link: '#'
            }
          }
        },
        {
          id: 'block-5',
          type: 'GRID',
          grid: {
            title: '安心卡的社區一日生活圈',
            columns: 3,
            items: [
              {
                title: '早晨：健康餐食的美味約會',
                description: '在社區友善餐廳，持安心卡即可享受特約健康餐點，甚至能用「健康生活圈積點」兌換驚喜折扣。',
                image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080&auto=format&fit=crop',
                showImage: true
              },
              {
                title: '午後：專家到府，生活煥然一新',
                description: '預約專業服務，由可信任、固定熟面孔的協作者到府服務，長輩安心，家裡也無負擔。',
                image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2068&auto=format&fit=crop',
                showImage: true
              },
              {
                title: '傍晚：特約商家的溫情串連',
                description: '安心卡串聯在地藥局、診所與據點 。萬一有突發狀況，卡片載明緊急聯絡資訊並與據點連動，建立起不侵犯隱私的安全防護網 。',
                image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop',
                showImage: true
              }
            ]
          }
        },
        {
          id: 'block-6',
          type: 'IMAGE_TEXT_GRID',
          imageTextGrid: {
            layout: 'imageLeft',
            image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop',
            title: '安心卡 = 您口袋裡的 YOYO 卡 + 專屬安老管家服務',
            content: '為什麼我們選擇 YOYO 卡？因為我們知道，「學習新工具」是長輩最大的數位挫折 。 安心卡利用敬老卡與一般悠遊卡的低門檻特性，讓多數服務「靠卡」即可進行 。我們不只是做支付，更是在打造一個「可信賴的銀髮生活入口」 。',
            cta: {
              text: '',
              link: '#'
            }
          }
        },
      ]
    }
  }
};
