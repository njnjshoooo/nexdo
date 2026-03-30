import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const rentalManagementPage: Page = {
  id: 'rental-management',
  slug: 'rental-management',
  title: '代租代管',
  template: 'SUB_ITEM',
  parentId: 'rent-and-move',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'rental-management',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      button: {
        text: '立即預約',
        type: 'FORM',
        value: 'booking-form',
        isVisible: true
      },
      coreServicesSectionTitle: '代租代管，讓您的房產聽您的話',
      coreServices: [
        {
          title: '資產潛力分析',
          content: '透過專業的眼光，陪您找出老屋最吸引人的特質，讓資產發揮最大的支持力。'
        },
        {
          title: '房客深度媒合',
          content: '我們代替您進行層層篩選，確認對方的生活習慣與穩定性，幫您的房子找一位像家人般愛惜環境的長期夥伴。'
        },
        {
          title: '全方位事務代辦',
          content: '漏水報修、合約公證、租金對帳，我們將在第一線處理所有瑣事，讓您與房客之間只留下單純的信任。'
        },
        {
          title: '資產管理',
          content: '定期提供屋況報告，讓您在任何地方都能安心享受這份資產帶來的自由。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '我們提供具備法務背景的資產顧問，確保每一份合約都穩如泰山。'
        },
        {
          title: '安心保證',
          description: '所有的維護與管理流程皆有完整紀錄，讓您隨時隨地掌握資產現況。'
        },
        {
          title: '策略夥伴',
          description: '租寓'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '張奶奶的資產守護',
          description: '張奶奶的老房維護不易。我們接手後，幫她處理了累積多年的漏水問題，讓奶奶現在每月在家安心領租，不再為房客報修心驚膽跳。',
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
          tag: '資產守護'
        },
        {
          id: uuidv4(),
          title: '王先生的跨國管理',
          description: '王先生旅居國外，擔心老父無法處理老宅出租。我們擔任兩代間的溝通橋樑與房產管家，讓這筆資產成為守護長輩退休金的活水。',
          image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=2070&auto=format&fit=crop',
          tag: '跨國管理'
        },
        {
          id: uuidv4(),
          title: '李老師的鄰里良緣',
          description: '透過精細媒合，我們幫李老師找了一位年輕的文字工作者租客。兩人在專業管理下建立了互信，讓老房子重新有了年輕的活力。',
          image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
          tag: '鄰里良緣'
        }
      ],
      additionalServices: ['elderly-housing-exchange']
    }
  }
};
