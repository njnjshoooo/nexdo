import { Page, DEFAULT_SUB_ITEM_TEMPLATE, DEFAULT_MAJOR_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const homeClearancePage: Page = {
  id: 'home-clearance',
  slug: 'home-clearance',
  title: '室內清運',
  template: 'SUB_ITEM',
  parentId: 'cleaning',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      productId: 'home-clearance',
      linkedProductId: 'home-clearance',
      coreServicesSectionTitle: '室內清運，告別沈重積累，迎接清爽居家',
      coreServices: [
        {
          title: '釋放空間',
          content: '巡視家中的堆積區，評估最合適的搬運人力與車趟，讓清理的第一步變得輕盈有序。'
        },
        {
          title: '專業拆解搬運',
          content: '沙發、衣櫃等大件物品，交給專業的來，安全的拆解與搬運，讓家具體面地完成任務。'
        },
        {
          title: '廢棄物分類',
          content: '依照環保規範歸類丟棄物，確保資源得到正確的去處。註：無法收取項目：醫療、營建、裝潢廢棄物（包含陶、瓷、磚、瓦、廢木料）。'
        },
        {
          title: '環境恢復',
          content: '清運完成後進行基礎的環境整理，陪您見證空間重新綻放的模樣，開啟生活的新篇章。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '不在家也可使用，彈性服務時間，可指定日期、專人到府收垃圾。'
        },
        {
          title: '安心保證',
          description: '所有的清運流程皆符合環保法規，且搬運過程確保您的牆面與地板毫髮無傷。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '蘇奶奶的陽台重生記',
          description: '蘇奶奶家的陽台堆滿了十幾年的舊花盆。我們陪奶奶清除了三大車雜物。現在陽台重現陽光，奶奶也終於能在窗邊喝茶了。',
          image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2070&auto=format&fit=crop',
          tag: '陽台重生'
        },
        {
          id: uuidv4(),
          title: '林大哥的跨代支援',
          description: '林大哥老家留下的舊冰箱與沈重沙發讓他束手無策。拆解並清運後，讓林大哥無後顧之憂地陪父母入住新家。',
          image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=2070&auto=format&fit=crop',
          tag: '跨代支援'
        },
        {
          id: uuidv4(),
          title: '邱先生除舊佈新大掃除',
          description: '過年前將壞掉的小家電、舊衣物與保麗龍一一歸類載走，讓儲藏室瞬間變回寬敞空間。',
          image: 'https://images.unsplash.com/photo-1594484208280-efa00f9e990c?q=80&w=2070&auto=format&fit=crop',
          tag: '除舊佈新'
        }
      ],
      additionalServices: ['home-reorganization', 'regular-cleaning'],
      button: {
        text: '立即下單',
        type: 'FORM',
        value: 'home-clearance-form',
        isVisible: true
      }
    }
  }
};
