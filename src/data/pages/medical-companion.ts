import { Page, DEFAULT_SUB_ITEM_TEMPLATE, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const medicalCompanionPage: Page = {
  id: 'medical-companion',
  slug: 'medical-companion',
  title: '醫藥陪同',
  template: 'SUB_ITEM',
  parentId: 'health',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      productId: 'medical-companion',
      linkedProductId: 'medical-companion',
      coreServicesSectionTitle: '醫藥陪同，暖心隨行，讓專業陪同守護長輩健康',
      coreServices: [
        {
          title: '慢箋代領與流程簡化',
          content: '針對長期服藥的長輩，我們協助處理診所與藥局間的領藥流程，確保藥物不中斷，免去長輩在人擠人的診間久候。'
        },
        {
          title: '醫囑轉譯與藥表製作',
          content: '將藥袋上密密麻麻的文字，轉化為大字版、圖示化的「每日用藥曆」，讓視力退化的長輩也能輕鬆辨識什麼時候該吃什麼藥。'
        },
        {
          title: '跨科別用藥衝突檢查',
          content: '許多長輩同時看多科（如心臟、糖尿病、眼科），我們協助彙整所有藥袋並諮詢藥師，避免產生重複用藥或藥性衝突的風險。'
        },
        {
          title: '居家備品採買與衛教',
          content: '除了領藥，也協助採買合適的血糖試紙、護理耗材，並確認長輩與看護是否能正確操作健康監測儀器。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '具備護理或藥師背景之陪同員'
        },
        {
          title: '安心保證',
          description: '用藥紀錄即時回報系統、專業醫療諮詢後援。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '林奶奶安心吃藥時間',
          description: '林奶奶獨居且藥袋疊得像山。陪同員協助領藥後，製作了顏色標註的藥盒與大卡片，奶奶再也不會忘記吃午餐後的降壓藥。',
          image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
          tag: '安心吃藥'
        },
        {
          id: uuidv4(),
          title: '周先生遠距離的安心',
          description: '周先生很是擔心獨居父親忘記去藥局領慢箋。透過我們的定期陪同服務，周先生每月都會收到父親的領藥照片與血壓數值報告。',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
          tag: '遠距安心'
        },
        {
          id: uuidv4(),
          title: '王老師殘藥斷捨離',
          description: '王老師家裡囤積了大量過期藥品。陪同員協助整理出五公斤的過期殘藥並送往藥局回收，同時教會外籍看護如何正確分類當季藥物。',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop',
          tag: '殘藥整理'
        }
      ],
      additionalServices: ['home-dentist', 'short-term-care'],
      button: {
        text: '立即下單',
        type: 'FORM',
        value: 'medical-companion-form',
        isVisible: true
      }
    }
  }
};
