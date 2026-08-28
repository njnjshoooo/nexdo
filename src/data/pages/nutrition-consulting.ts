import { Page, DEFAULT_SUB_ITEM_TEMPLATE, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const nutritionConsultingPage: Page = {
  id: 'nutrition-consulting',
  slug: 'nutrition-consulting',
  title: '營養諮詢',
  template: 'SUB_ITEM',
  parentId: 'health',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      productId: 'nutrition-consulting',
      linkedProductId: 'nutrition-consulting',
      coreServicesSectionTitle: '營養諮詢，為您家中的餐盤加分！',
      coreServices: [
        {
          title: '全方位營養檢測',
          content: '營養師到府觀察長輩的日常飲食與備餐環境，透過專業評估（肌肉量、體脂、生化數值），找出隱藏的營養不良風險。'
        },
        {
          title: '軟食與吞嚥友善設計',
          content: '針對牙口不好的長輩，指導家屬與看護如何調整食材切割與烹飪技巧，讓「剪碎食物」也能呈現誘人色香味。'
        },
        {
          title: '慢性病功能性菜單',
          content: '針對三高或腎臟病，提供實用的外食選擇建議與居家烹飪替換公式，讓長輩在限制中依然能享受美食。'
        },
        {
          title: '看護與備餐者實戰指導',
          content: '指導家中備餐者（家人或看護）正確的調味比例與食材組合，確保營養計畫能真正落地執行。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '國家證照營養師團隊'
        },
        {
          title: '安心保證',
          description: '數據化健康追蹤、結合中西醫觀點的整合建議。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '黃伯伯找回用餐樂趣',
          description: '咀嚼困難的黃伯伯被要求只能吃稀飯糊，導致胃口極差、體重暴跌。營養師教導製作「軟質地固體食物」，讓伯伯心情與體力大幅好轉。',
          image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=2070&auto=format&fit=crop',
          tag: '用餐樂趣'
        },
        {
          id: uuidv4(),
          title: '李奶奶快樂控制血糖',
          description: '李奶奶為了控糖，什麼都不敢吃。營養師到府後教導「進食順序」與「低 GI 代換術」，奶奶現在能偶爾享受一小塊蛋糕，血糖依舊穩定。',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
          tag: '血糖控制'
        },
        {
          id: uuidv4(),
          title: '王先生遠距關懷備餐',
          description: '遠在南部的子女擔心北部獨居父親只吃剩菜。營養師定期到府並指導代餐與超商組合包，讓子女每週都能收到父親的飲食健康週報，放心許多。',
          image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop',
          tag: '遠距關懷'
        }
      ],
      additionalServices: ['health-fitness', 'home-dentist'],
      button: {
        text: '立即下單',
        type: 'FORM',
        value: 'nutrition-consulting-form',
        isVisible: true
      }
    }
  }
};
