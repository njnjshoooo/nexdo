import { OrderStatus } from '../constants/orderStatus';

export type TemplateType = 'HOME' | 'MAJOR_ITEM' | 'SUB_ITEM' | 'GENERAL' | 'BLOG';

export interface ImageBlock {
  url: string;
  alt?: string;
}

export interface TextBlock {
  text: string;
  type: 'h1' | 'h2' | 'h3' | 'p' | 'list';
}

export interface ButtonConfig {
  text: string;
  type: 'FORM' | 'URL';
  value: string; // formId or URL
  isVisible: boolean;
}

export interface CartItem {
  id: string;
  pageId: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  quantity: number;
  expectedDates?: string;
  expectedTime?: string;
  notes?: string;
  selectedVariant?: ProductVariant;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  staffName?: string;
  staffPhone?: string;
  assignedDate?: string;
  assignedTime?: string;
  photoUrl?: string;
  receiptPhotoUrl?: string;
  paymentProofPhotoUrl?: string;
}

export type StatementStatus = 'SUBMITTED' | 'PAYOUT_PROCESSING' | 'PAID';

export interface Statement {
  id: string; // statementId: YYYYMM-Statement-vendorId
  vendorId: string;
  month: string; // YYYY-MM
  totalOrders: number;
  totalAmount: number; // Total revenue
  payoutAmount: number; // Amount to pay to vendor
  status: StatementStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  depositAmount?: number;
  balanceAmount?: number;
  quotedAmount?: number;
  status: OrderStatus;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email: string;
    lineId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    specialRequirements?: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  customerServiceNotes?: string;
  
  // Vendor related fields
  vendorId?: string;
  submissionId?: string;
  assignedStaffId?: string;
  assignedDate?: string;
  assignedTime?: string;
  vendorNotes?: string;
  cancelReason?: string;
  servicePhotoUrl?: string;
  receiptPhotoUrl?: string;
  paymentProofPhotoUrl?: string;
  statusUpdates?: OrderStatusUpdate[];
  statementId?: string;
  refundInfo?: {
    payee: string;
    bankCode: string;
    bankName: string;
    bankBranch: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface HeroSection {
  title: string;
  description: string;
  backgroundImage: string;
  mainButton: ButtonConfig;
  secondaryButton: ButtonConfig;
  tags?: string[];
}

export interface ServiceItem {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  items?: string[];
  price?: string;
  targetPageId?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
}

export interface HomeHeroButton {
  text: string;
  link: string;
}

export interface HomeServiceDisplay {
  pageId: string; // Selected Major Item ID
  title?: string;
  description?: string;
  tags?: string[]; // Flexible tags
  image?: string;
  testimonial: {
    text: string;
    author: string;
  };
}

export interface ConsultationStep {
  title: string;
  description: string;
  icon: string;
}

export interface HomeTestimonial {
  text?: string;
  content?: string;
  author: string;
  role?: string;
  rating?: number;
  tag?: string;
}

export interface HomeContent {
  hero?: {
    title: string;
    image: string;
    buttons: HomeHeroButton[];
  };
  mainService?: HomeServiceDisplay;
  secondaryServices?: HomeServiceDisplay[];
  additionalServices?: string[]; // Array of Page IDs (Sub Items)
  consultationSteps?: {
    title: string;
    steps: ConsultationStep[];
  };
  testimonialsSection?: {
    title: string;
    items: HomeTestimonial[];
  };
  blocks?: GeneralBlock[];
}

export interface CoreServiceItem {
  title: string;
  content: string;
}

export interface PartnerItem {
  title: string;
  description: string;
  image?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  description: string;
  image?: string;
  images?: string[];
  checklist?: { text: string }[];
  orderMode: 'FIXED' | 'INTERNAL_FORM' | 'EXTERNAL_LINK';
  orderCode?: string;
  requireDate?: boolean;
  requireTime?: boolean;
  requireNotes?: boolean;
  variants?: ProductVariant[];
  fixedConfig: {
    price: number;
    unit: string;
    buttonText: string;
    enableDeposit?: boolean;
    depositRatio?: number;
    balanceRatio?: number;
  };
  quoteConfig?: {
    priceText: string;
    buttonText: string;
    link?: string;
  };
  internalFormConfig?: {
    priceText: string;
    buttonText: string;
    formId: string;
    enableDeposit?: boolean;
    depositRatio?: number;
    balanceRatio?: number;
  };
  externalLinkConfig?: {
    priceText: string;
    buttonText: string;
    url: string;
    enableDeposit?: boolean;
    depositRatio?: number;
    balanceRatio?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ServiceIntroBlockType = 'GRID' | 'FEATURE' | 'COMPARISON';

export interface ServiceIntroSection {
  id: string;
  type: ServiceIntroBlockType;
  enabled: boolean;
  grid?: {
    title: string;
    showCarousel: boolean;
    items: { id: string; title: string; image: string; }[];
  };
  feature?: {
    title: string;
    showCarousel: boolean;
    images: string[];
    content: string;
    layout: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';
  };
  comparison?: {
    title: string;
    beforeImage: string;
    afterImage: string;
    beforeLabel: string;
    afterLabel: string;
  };
}

export interface SubItemContent {
  productId?: string; // New field for linked product
  mainTitle?: string; // Adding main title
  coreServicesSectionTitle?: string;
  coreServices: CoreServiceItem[]; // Should be 4
  partners: PartnerItem[];
  cases: CaseStudy[];
  faqs?: { id: string; question: string; answer: string; }[];
  additionalServices: string[]; // Page IDs
  button: ButtonConfig;
  linkedProductId?: string;
  serviceIntro?: {
    sections?: ServiceIntroSection[];
    // Legacy blocks for backward compatibility
    blockA?: {
      enabled: boolean;
      title: string;
      items: { id: string; title: string; image: string; }[];
      showCarousel?: boolean;
    };
    blockB?: {
      enabled: boolean;
      title: string;
      images: string[];
      content: string;
      layout: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';
      showCarousel?: boolean;
    };
    blockC?: {
      enabled: boolean;
      title: string;
      beforeImage: string;
      afterImage: string;
      beforeLabel: string;
      afterLabel: string;
    };
  };
}

export type GeneralBlockType = 
  | 'HERO_1' 
  | 'HERO_2' 
  | 'MAIN_SERVICE' 
  | 'SECONDARY_SERVICES' 
  | 'SERVICES'
  | 'ADDITIONAL_SERVICES' 
  | 'CONSULTATION_STEPS' 
  | 'PROCESS'
  | 'TESTIMONIALS' 
  | 'GRID' 
  | 'PARTNERS' 
  | 'TEXT' 
  | 'BUTTON'
  | 'SPACER'
  | 'FORM'
  | 'SINGLE_IMAGE'
  | 'IMAGE_CAROUSEL'
  | 'IMAGE_TEXT_GRID'
  | 'MORE_SERVICES';

export interface GeneralBlock {
  id: string;
  type: GeneralBlockType;
  customStyles?: {
    marginTop?: string;
    marginBottom?: string;
    paddingTop?: string;
    paddingBottom?: string;
  };
  // Payload for different types
  hero1?: {
    subtitle?: string;
    title: string;
    image: string;
    buttons: HomeHeroButton[];
    imageTestimonial?: { text: string; author: string; };
  };
  hero2?: {
    title: string;
    description: string;
    backgroundImage: string;
    mainButton: ButtonConfig;
    secondaryButton: ButtonConfig;
  };
  mainService?: HomeServiceDisplay;
  secondaryServices?: HomeServiceDisplay[];
  services?: {
    subtitle?: string;
    title?: string;
    items: HomeServiceDisplay[];
  } | HomeServiceDisplay[];
  additionalServices?: {
    title?: string;
    items: string[];
  } | string[]; // Page IDs
  consultationSteps?: {
    title: string;
    steps: ConsultationStep[];
  };
  process?: {
    title: string;
    description: string;
    steps: {
      icon: string;
      title: string;
      desc: string;
      action: string;
    }[];
    footerLabels?: string[];
  };
  testimonials?: {
    title: string;
    description?: string;
    items: HomeTestimonial[];
  };
  items?: HomeTestimonial[]; // For direct items in block
  grid?: {
    title: string;
    columns: 2 | 3 | 4 | 5 | 6;
    items: { title: string; description: string; image?: string; showImage?: boolean; tag?: string; link?: string; }[];
  };
  partners?: {
    title: string;
    transitionTitle?: string;
    items: PartnerItem[];
  };
  text?: {
    content: string;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: 'heading' | 'body' | 'medium_heading';
  };
  button?: {
    text: string;
    link: string;
    alignment: 'left' | 'center' | 'right';
  };
  spacer?: {
    height: number;
  };
  form?: {
    formId: string;
  };
  singleImage?: {
    image: string;
    caption: string;
  };
  imageCarousel?: {
    items: { image: string; alt: string; }[];
  };
  imageTextGrid?: {
    layout: 'imageLeft' | 'imageRight';
    image: string;
    title: string;
    content: string;
    cta?: {
      text: string;
      link: string;
    };
  };
  moreServices?: {
    title: string;
    description: string;
    pageIds: string[];
  };
}

export interface GeneralPageContent {
  blocks: GeneralBlock[];
}

export interface BlogPageContent {
  heroTitle: string;
  heroImage: string;
  showCategoryNav: boolean;
  categories: string[];
  navCategories?: string[];
  featuredPostId: string;
  interestedPostIds: string[];
  postsPerPage: number;
  recommendedServiceIds: string[];
}

export interface PageContent {
  hero: HeroSection;
  servicesSectionTitle?: string;
  services: ServiceItem[];
  cases: CaseStudy[];
  home?: HomeContent;
  subItem?: SubItemContent;
  general?: GeneralPageContent;
  blog?: BlogPageContent;
  showForm?: boolean;
  formId?: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  template: TemplateType;
  parentId?: string;
  content: PageContent;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_MAJOR_ITEM_TEMPLATE: PageContent = {
  hero: {
    title: '新頁面標題',
    description: '新頁面描述',
    backgroundImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
    mainButton: { text: '預約諮詢', type: 'FORM', value: '', isVisible: true },
    secondaryButton: { text: '查看案例', type: 'URL', value: '#cases', isVisible: true },
  },
  servicesSectionTitle: '全方位服務',
  services: [],
  cases: [],
};

export const DEFAULT_SUB_ITEM_TEMPLATE: SubItemContent = {
  mainTitle: '服務介紹與特色',
  coreServicesSectionTitle: '服務流程',
  coreServices: [
    { title: '流程 1', content: '流程內容...' },
    { title: '流程 2', content: '流程內容...' },
    { title: '流程 3', content: '流程內容...' },
    { title: '流程 4', content: '流程內容...' },
  ],
  partners: [
    { title: '合作夥伴 1', description: '夥伴描述...' }
  ],
  cases: [],
  faqs: [],
  additionalServices: [],
  button: { text: '加入預約單', type: 'FORM', value: '', isVisible: true },
  serviceIntro: {
    blockA: {
      enabled: false,
      title: '服務項目',
      showCarousel: true,
      items: [
        { id: '1', title: '項目 1', image: '' },
        { id: '2', title: '項目 2', image: '' },
        { id: '3', title: '項目 3', image: '' },
        { id: '4', title: '項目 4', image: '' },
      ]
    },
    blockB: {
      enabled: false,
      title: '服務介紹',
      showCarousel: true,
      images: [],
      content: '服務內容說明...',
      layout: 'LEFT'
    },
    blockC: {
      enabled: false,
      title: '施作前後對比',
      beforeImage: '',
      afterImage: '',
      beforeLabel: 'Before',
      afterLabel: 'After'
    }
  }
};

export const DEFAULT_GENERAL_TEMPLATE: GeneralPageContent = {
  blocks: [
    {
      id: 'block-1',
      type: 'HERO_2',
      hero2: {
        title: '頁面標題',
        description: '頁面副標題',
        backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
        mainButton: { text: '預約諮詢', type: 'FORM', value: '', isVisible: true },
        secondaryButton: { text: '查看案例', type: 'URL', value: '#cases', isVisible: true },
      }
    }
  ]
};

export const DEFAULT_BLOG_TEMPLATE: BlogPageContent = {
  heroTitle: '好齡居誌',
  heroImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
  showCategoryNav: true,
  categories: ['理想老後居所', '樂齡生活誌', '高齡理財與補助'],
  featuredPostId: 'latest',
  interestedPostIds: [],
  postsPerPage: 9,
  recommendedServiceIds: ['', '', ''],
};

export const DEFAULT_HOME_TEMPLATE: HomeContent = {
  hero: {
    title: '陪伴您把居家環境變安全，\n擁有安心自在的樂齡日常。',
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
    buttons: [
      { text: '居住安全', link: '/home-safety' },
      { text: '清潔收納', link: '#cleaning' },
      { text: '樂齡健康', link: '#health' },
      { text: '租房搬家', link: '/rent-and-move' },
    ]
  },
  blocks: [
    { id: 'block-services', type: 'SERVICES', services: [] },
    { id: 'block-process', type: 'PROCESS', process: { title: '預約流程', description: '預約流程描述', steps: [] } },
    { id: 'block-testimonials', type: 'TESTIMONIALS', testimonials: { title: '客戶好評', items: [] } }
  ],
  mainService: {
    pageId: '',
    description: '陪您看見家裡習以為常的隱形風險，把家打理成最安心的樣子。',
    tags: ['#衛浴裝修', '#居住安全評估', '#舊屋診斷'],
    image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop',
    testimonial: {
      text: '很多人的第一步，都是從居住安全開始',
      author: '王先生 | 新北市'
    }
  },
  secondaryServices: [
    {
      pageId: '',
      description: '打理好囤積的角落，還給你更舒適自在的空間。',
      tags: ['#室內清運', '#居家整聊', '#收納整理'],
      image: 'https://images.unsplash.com/photo-1520121401995-928cd50d4e27?q=80&w=2070&auto=format&fit=crop',
      testimonial: {
        text: '清掉的不只是雜物，更是心裡的負擔',
        author: '林小姐 | 台北市'
      }
    },
    {
      pageId: '',
      description: '打理好身體的基礎，去哪裡、吃什麼都能自己作主。',
      tags: ['#到府體適能', '#牙科衛教', '#營養諮詢'],
      image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=2070&auto=format&fit=crop',
      testimonial: {
        text: '身體硬朗了，想去哪裡玩都不是問題',
        author: '陳伯伯 | 桃園市'
      }
    }
  ],
  additionalServices: [],
  consultationSteps: {
    title: '預約流程',
    steps: [
      { title: '線上預約', description: '填寫表單或加入官方 LINE', icon: 'MessageCircle' },
      { title: '專人諮詢', description: '了解需求並安排訪視時間', icon: 'Phone' },
      { title: '到府評估', description: '專業團隊現場勘查與規劃', icon: 'ClipboardCheck' },
      { title: '確認方案', description: '提供報價與執行細節', icon: 'FileCheck' },
    ]
  },
  testimonialsSection: {
    title: '客戶好評',
    items: [
      { text: '謝謝你們，讓媽媽願意接受浴室改裝，現在她洗澡安全多了，我也終於能放心。', author: '台北市 林小姐 (42歲)' },
      { text: '原本擔心搬家很麻煩，還好有你們的協助，讓爸媽能順利住進有電梯的新家。', author: '新北市 張先生 (50歲)' },
    ]
  }
};
