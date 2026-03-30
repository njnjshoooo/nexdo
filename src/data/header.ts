import { NavItem } from '../types/navigation';

export const HEADER_ITEMS: NavItem[] = [
  {
    id: 'nav-about',
    label: '關於我們',
    url: '/about',
    subtitle: '了解好齡居',
    openInNewWindow: false,
    templateType: 'GENERAL',
    children: []
  },
  {
    id: 'nav-consultant',
    label: '好齡居顧問',
    url: '/consultant',
    subtitle: '專屬生活顧問',
    openInNewWindow: false,
    templateType: 'GENERAL',
    children: []
  },
  {
    id: 'nav-services',
    label: '我們的服務',
    url: '#',
    subtitle: '全方位守護',
    openInNewWindow: false,
    templateType: 'GENERAL',
    children: [
      {
        id: 'home-safety',
        label: '居住安全',
        url: '/home-safety',
        subtitle: '生活安全',
        openInNewWindow: false,
        templateType: 'MAJOR_ITEM',
        pageSlug: 'home-safety',
        children: [
          {
            id: 'old-house-diagnosis',
            label: '舊屋診斷',
            url: '/home-safety/old-house-diagnosis',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'old-house-diagnosis',
            parentId: 'home-safety'
          },
          {
            id: 'safety-assessment',
            label: '安全評估',
            url: '/home-safety/safety-assessment',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'safety-assessment',
            parentId: 'home-safety'
          },
          {
            id: 'bathroom-renovation',
            label: '衛浴裝修',
            url: '/home-safety/bathroom-renovation',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'bathroom-renovation',
            parentId: 'home-safety'
          }
        ]
      },
      {
        id: 'cleaning',
        label: '收納清潔',
        url: '/cleaning',
        subtitle: '生活品質',
        openInNewWindow: false,
        templateType: 'MAJOR_ITEM',
        pageSlug: 'cleaning',
        children: [
          {
            id: 'home-reorganization',
            label: '居家整聊',
            url: '/cleaning/home-reorganization',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'home-reorganization',
            parentId: 'cleaning'
          },
          {
            id: 'organization-planning',
            label: '收納規劃',
            url: '/cleaning/organization-planning',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'organization-planning',
            parentId: 'cleaning'
          },
          {
            id: 'regular-cleaning',
            label: '定期清潔',
            url: '/cleaning/regular-cleaning',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'regular-cleaning',
            parentId: 'cleaning'
          },
          {
            id: 'home-clearance',
            label: '室內清運',
            url: '/cleaning/home-clearance',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'home-clearance',
            parentId: 'cleaning'
          }
        ]
      },
      {
        id: 'health',
        label: '樂齡健康',
        url: '/health',
        subtitle: '生活活力',
        openInNewWindow: false,
        templateType: 'MAJOR_ITEM',
        pageSlug: 'health',
        children: [
          {
            id: 'health-fitness',
            label: '到府體適能',
            url: '/health/health-fitness',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'health-fitness',
            parentId: 'health'
          },
          {
            id: 'short-term-care',
            label: '短期照護',
            url: '/health/short-term-care',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'short-term-care',
            parentId: 'health'
          },
          {
            id: 'home-dentist',
            label: '到府牙醫',
            url: '/health/home-dentist',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'home-dentist',
            parentId: 'health'
          },
          {
            id: 'medical-companion',
            label: '醫藥陪同',
            url: '/health/medical-companion',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'medical-companion',
            parentId: 'health'
          },
          {
            id: 'nutrition-consulting',
            label: '營養諮詢',
            url: '/health/nutrition-consulting',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'nutrition-consulting',
            parentId: 'health'
          }
        ]
      },
      {
        id: 'rent-and-move',
        label: '租房搬家',
        url: '/rent-and-move',
        subtitle: '生活歸屬',
        openInNewWindow: false,
        templateType: 'MAJOR_ITEM',
        pageSlug: 'rent-and-move',
        children: [
          {
            id: 'elderly-housing-exchange',
            label: '適老換屋',
            url: '/rent-and-move/elderly-housing-exchange',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'elderly-housing-exchange',
            parentId: 'rent-and-move'
          },
          {
            id: 'rental-management',
            label: '代租代管',
            url: '/rent-and-move/rental-management',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'rental-management',
            parentId: 'rent-and-move'
          },
          {
            id: 'safe-moving',
            label: '安心移居',
            url: '/rent-and-move/safe-moving',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'safe-moving',
            parentId: 'rent-and-move'
          },
          {
            id: 'real-estate',
            label: '房屋仲介',
            url: '/rent-and-move/real-estate',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'real-estate',
            parentId: 'rent-and-move'
          }
        ]
      },
      {
        id: 'renovation',
        label: '居家裝潢',
        url: '/renovation',
        subtitle: '生活美學',
        openInNewWindow: false,
        templateType: 'MAJOR_ITEM',
        pageSlug: 'renovation',
        children: [
          {
            id: 'decor-design',
            label: '軟裝設計',
            url: '/renovation/decor-design',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'decor-design',
            parentId: 'renovation'
          },
          {
            id: 'light-renovation',
            label: '樂齡輕裝修',
            url: '/renovation/light-renovation',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'light-renovation',
            parentId: 'renovation'
          },
          {
            id: 'rental-customization',
            label: '出租屋訂製',
            url: '/renovation/rental-customization',
            openInNewWindow: false,
            templateType: 'SUB_ITEM',
            pageSlug: 'rental-customization',
            parentId: 'renovation'
          }
        ]
      },
      {
        id: 'finance',
        label: '高齡理財',
        url: '/finance',
        subtitle: '生活免憂',
        openInNewWindow: false,
        templateType: 'MAJOR_ITEM',
        pageSlug: 'finance',
        children: []
      }
    ]
  },
  {
    id: 'nav-blog',
    label: '好齡居誌',
    url: '/blog',
    subtitle: '樂齡生活誌',
    openInNewWindow: false,
    templateType: 'GENERAL',
    children: []
  },
  {
    id: 'nav-peace',
    label: '加入安心卡',
    url: '/peace-of-mind',
    subtitle: '專屬會員禮',
    openInNewWindow: false,
    templateType: 'GENERAL',
    pageSlug: 'peace-of-mind',
    children: []
  }
];
