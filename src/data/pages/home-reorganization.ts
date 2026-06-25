import { Page, DEFAULT_MAJOR_ITEM_TEMPLATE, DEFAULT_SUB_ITEM_TEMPLATE } from '../../types/admin';
import { v4 as uuidv4 } from 'uuid';

export const homeReorgPage: Page = {
  id: 'home-reorganization',
  slug: 'home-reorganization',
  title: '居家整聊',
  template: 'SUB_ITEM',
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    ...DEFAULT_MAJOR_ITEM_TEMPLATE,
    subItem: {
      productId: 'home-reorganization',
      ...DEFAULT_SUB_ITEM_TEMPLATE,
      coreServicesSectionTitle: '居家整聊，陪你一起讓家找回舒服的呼吸',
      coreServices: [
        {
          title: '深度需求聊聊',
          content: '整聊的第一步是傾聽。我們想先了解您的生活習慣與對空間的期待，陪您找出哪些東西是真正想留下的。'
        },
        {
          title: '溫暖篩選陪伴',
          content: '面對堆積的回憶，我們會陪著您一起決定物品的去留。不強迫丟棄，而是幫助您更清楚地看見生活重心。'
        },
        {
          title: '實用空間配置',
          content: '根據您的身體機能與習慣，調整收納位置。讓常用的東西信手拈來，不常用的也能妥善安放。'
        },
        {
          title: '動手整理實作',
          content: '整聊師會走入家中，與您共同動手調整。我們不只幫忙搬動，更想教您如何在未來也能輕鬆維持舒爽。'
        }
      ],
      partners: [
        {
          title: '安全守護顧問',
          description: '我們不只是整理師，更是理解長輩生活需求的傾聽者。'
        },
        {
          title: '安心保證',
          description: '尊重隱私，所有整聊過程皆細心呵護您的私人物件。'
        },
        {
          title: '策略夥伴',
          description: '居家整聊室'
        }
      ],
      cases: [
        {
          id: uuidv4(),
          title: '陳奶奶的舊時光整理',
          description: '面對老伴留下的書報與雜物，陳奶奶一直不捨得動。整聊師陪著她慢慢翻閱、說說往事，最後一起把珍貴的留下來，讓客廳重新變回可以喝茶曬太陽的地方。',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
          tag: '舊時光整理'
        },
        {
          id: uuidv4(),
          title: '王先生的安心廚房',
          description: '為了讓愛下廚的爸爸更安全，我們陪著王爸爸重新調整廚房動線。把常用的碗盤移到不用踮腳的高度，減少攀高取物的風險，讓下廚再次成為樂趣。',
          image: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=2070&auto=format&fit=crop',
          tag: '廚房動線'
        },
        {
          id: uuidv4(),
          title: '林小姐的雜物斷捨離',
          description: '多年累積的囤積物擋住了採光。透過整聊師的引導與篩選，我們陪林小姐一起把沒用到的物資捐贈出去，讓陽光重新照進臥室。',
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
          tag: '雜物斷捨離'
        }
      ],
      additionalServices: ['home-safety', 'rent-and-move'] // Link to home-safety and rent-and-move
    }
  }
};
