import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const realEstatePage: Page = {
  id: 'real-estate',
  slug: 'real-estate',
  title: '房屋仲介',
  template: 'SUB_ITEM',
  parentId: 'rent-and-move',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'real-estate',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      button: {
        text: '立即預約',
        type: 'FORM',
        value: 'booking-form',
        isVisible: true
      },
      coreServicesSectionTitle: '房屋仲介，專為高齡者設計的房產策略',
      coreServices: [
        {
          title: '高齡適居物件精選',
          content: '不只看房價，更優先評估梯間寬度、浴室無障礙改裝潛力及周邊醫護資源密度。'
        },
        {
          title: '交易安全與法律信託',
          content: '提供房產處分信託諮詢，防止財產因認知障礙或詐騙流失，確保交易價金絕對安全。'
        },
        {
          title: '代間換屋與稅務規劃',
          content: '專業會計師協助評估贈與、繼承或出售的稅務差異，找出最有利於家庭的換屋方案。'
        },
        {
          title: '賣屋修繕與價值提升',
          content: '在出售舊宅前提供基礎修繕建議，提升房屋賣相與價格，為您的換屋基金爭取最大空間。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '特約代書法律團隊、地政士公會專業成員、室內空間無障礙評估師。'
        },
        {
          title: '安心保證',
          description: '所有交易款項皆進入第三方信託專戶，確保買賣雙方權益。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '林奶奶舊宅售出',
          description: '林奶奶獨居在沒有電梯的老公寓，地段好，就醫非常不便。我們協助林奶奶將舊宅高價售出，並在同區尋找了緊鄰醫學中心的電梯大樓，下樓就能看診！',
          image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2070&auto=format&fit=crop',
          tag: '高價售出'
        },
        {
          id: uuidv4(),
          title: '曾先生的養老計畫',
          description: '曾先生不捨得離開住了一輩子的老家，因此透過好齡居與銀行對接，完成「以房養老」評估，並同步進行小規模的居家修繕，真正實現了「在地安老」。',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
          tag: '以房養老'
        },
        {
          id: uuidv4(),
          title: '陳小姐的理想生活',
          description: '陳小姐希望將年邁父母接至台北照顧，但生活習慣差異讓他們不敢同住。我們協助陳小姐在同社區內找到一間採光極佳的小坪數套房，陳小姐走路 5 分鐘就能送餐探視，達成了最理想的居住距離。',
          image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop',
          tag: '理想居住距離'
        }
      ],
      additionalServices: ['elderly-housing-exchange', 'rental-management']
    }
  }
};
