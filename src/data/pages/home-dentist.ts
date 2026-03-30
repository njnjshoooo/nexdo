import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const homeDentistPage: Page = {
  id: 'home-dentist',
  slug: 'home-dentist',
  title: '到府牙醫',
  template: 'SUB_ITEM',
  parentId: 'health',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      productId: 'home-dentist',
      coreServicesSectionTitle: '到府牙醫，從口腔開始的長壽秘訣！',
      coreServices: [
        {
          title: '床邊移動診間',
          content: '配備便攜式牙科治療台，在長輩最舒適的臥床或輪椅上，完成洗牙、補牙與簡易拔牙，免去奔波之苦。'
        },
        {
          title: '口腔機能重建評估',
          content: '針對吞嚥困難（嗆咳）或假牙不適進行深度檢查，透過結構調整提升咀嚼力，改善長輩的營養吸收。'
        },
        {
          title: '照顧者潔牙技術授權',
          content: '醫師親自示範如何為長期臥床長輩正確使用牙線、牙間刷與特殊海綿棒，降低吸入性肺炎風險。'
        },
        {
          title: '個人化口腔衛教計畫',
          content: '提供專屬口腔護理衛教單張，針對不同體質建議合適的口腔清潔品與按摩手法，讓日常保養不流於形式。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '特殊需求者口腔醫學科醫師'
        },
        {
          title: '安心保證',
          description: '健保特約醫療機構、標準化感控流程。'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '陳爺爺不再抗拒刷牙',
          description: '透過到府牙醫的溫柔引導與「減敏衛教」，現在外籍看護已能順利完成每日清潔。',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
          tag: '減敏衛教'
        },
        {
          id: uuidv4(),
          title: '王奶奶改善吞嚥嗆咳',
          description: '王奶奶假牙不合導致咀嚼困難。醫師到府重新調整假牙，並教導家屬「口腔健口操」。奶奶現在能吃更多樣的食物了。',
          image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2070&auto=format&fit=crop',
          tag: '假牙調整'
        },
        {
          id: uuidv4(),
          title: '李先生的牙科建教',
          description: '李先生因口腔細菌過多，反覆發生吸入性肺炎。經醫師專業洗牙並手把手教導抽吸式潔牙法後，肺炎住院次數大幅下降。',
          image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2070&auto=format&fit=crop',
          tag: '潔牙衛教'
        }
      ],
      additionalServices: ['health-fitness', 'short-term-care']
    }
  }
};
