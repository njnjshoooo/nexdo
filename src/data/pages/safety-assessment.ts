import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const safetyAssessmentPage: Page = {
  id: 'safety-assessment',
  slug: 'safety-assessment',
  title: '安全評估',
  template: 'SUB_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'safety-assessment',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '居家安全評估，陪您打造一個更自由、更好動的家',
      coreServices: [
        {
          title: '生活動線評估',
          content: '了解您平常在家的活動習慣，不管是半夜起床還是進出廚房，陪您找出那些覺得『卡卡的』地方。'
        },
        {
          title: '起居觀察',
          content: '仔細觀察燈光亮度、地面積水可能、以及手扶處的穩固性。不只看現在，更陪您預先想好未來的需求。'
        },
        {
          title: '合適的增設提案',
          content: '針對需要調整的地方，提供多樣化的方案，不管是簡單的防滑貼條或是穩固的扶手，都陪您選出最順手的那一個。'
        },
        {
          title: '持續關懷',
          content: '安全不是一次性的任務。我們是您隨時可以詢問的好鄰居，陪您根據體能變化，靈活調整家裡的配置。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '結合物理治療專業與空間美學，給您的不只是安全，更是尊嚴！'
        },
        {
          title: '安心保證',
          description: '所有的建議都經過真實案例驗證，確保實用且耐用。'
        },
        {
          title: '策略夥伴',
          description: '「家天使」'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '鍾伯伯的防滑計畫',
          description: '喜歡自己洗澡的鍾伯伯最怕浴室濕滑。我們陪他一起選購了質感好又穩固的扶手與防滑板，讓他現在洗澡也能很安心、很自在。',
          image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=2070&auto=format&fit=crop',
          tag: '防滑計畫'
        },
        {
          id: uuidv4(),
          title: '羅奶奶的走道亮化',
          description: '晚起上廁所對羅奶奶是種挑戰。我們陪著她增設了感應式照明，照亮了腳下的路，也讓遠在國外的子女放下心中的大石頭。',
          image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=2070&auto=format&fit=crop',
          tag: '走道亮化'
        },
        {
          id: uuidv4(),
          title: '邱先生的玄關微調',
          description: '穿鞋彎腰讓邱先生很吃力。我們建議增設穿鞋椅與輔助撐手處，陪他調整出一個優雅的出門動線，再次享受散步的樂趣。',
          image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
          tag: '玄關微調'
        }
      ],
      additionalServices: ['old-house-diagnosis', 'elderly-housing-exchange'],
      
    }
  }
};
