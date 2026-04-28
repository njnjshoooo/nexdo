import localforage from 'localforage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  createdAt: string;
  source?: 'admin' | 'vendor' | 'customer';
  storagePath?: string;  // Supabase Storage 路徑，用於刪除時同步移除檔案
}

const SUPABASE_MEDIA_BUCKET = 'media';

const STORAGE_KEY = 'admin_media_library';

// 用 createInstance 避免與其他 service 共享預設 localforage 實例
const store = localforage.createInstance({
  name: 'haolingju',
  storeName: 'media',
});

// Pre-populate with some default images if empty
const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'default-1',
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
    name: '客廳空間',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'default-2',
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070&auto=format&fit=crop',
    name: '樂齡照護',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:01.000Z'
  },
  {
    id: 'default-3',
    url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070&auto=format&fit=crop',
    name: '浴室安全',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:02.000Z'
  },
  {
    id: 'default-4',
    url: 'https://images.unsplash.com/photo-1520121401995-928cd50d4e27?q=80&w=2070&auto=format&fit=crop',
    name: '居家整理',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:03.000Z'
  },
  {
    id: 'default-5',
    url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=2070&auto=format&fit=crop',
    name: '健康運動',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:04.000Z'
  },
  {
    id: 'default-6',
    url: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop',
    name: '專業針灸',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:05.000Z'
  },
  {
    id: 'default-7',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop',
    name: '瑜珈練習',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:06.000Z'
  },
  {
    id: 'default-8',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
    name: '核心訓練',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:07.000Z'
  },
  {
    id: 'default-9',
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop',
    name: '醫療諮詢',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:08.000Z'
  },
  {
    id: 'default-10',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
    name: '衛浴清潔',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:09.000Z'
  },
  {
    id: 'default-11',
    url: 'https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?q=80&w=2070&auto=format&fit=crop',
    name: '現代抽象',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:10.000Z'
  },
  {
    id: 'default-12',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop',
    name: '團隊協作',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:11.000Z'
  },
  {
    id: 'default-13',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    name: '學習成長',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:12.000Z'
  },
  {
    id: 'default-14',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop',
    name: '科技辦公',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:13.000Z'
  },
  {
    id: 'default-15',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
    name: '會議簡報',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:14.000Z'
  },
  {
    id: 'default-16',
    url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop',
    name: '商務空間',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:15.000Z'
  },
  {
    id: 'default-17',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop',
    name: '設計美學',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:16.000Z'
  },
  {
    id: 'default-18',
    url: 'https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070&auto=format&fit=crop',
    name: '家庭關懷',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:17.000Z'
  },
  {
    id: 'default-19',
    url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop',
    name: '現代室內',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:18.000Z'
  },
  {
    id: 'default-20',
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop',
    name: '科技研發',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:19.000Z'
  },
  {
    id: 'default-21',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop',
    name: '專業女性',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:20.000Z'
  },
  {
    id: 'default-22',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop',
    name: '專業男性',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:21.000Z'
  },
  {
    id: 'default-23',
    url: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?q=80&w=2070&auto=format&fit=crop',
    name: '團隊辦公',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:22.000Z'
  },
  {
    id: 'default-24',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
    name: '工程技術',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:23.000Z'
  },
  {
    id: 'default-25',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
    name: '實驗科學',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:24.000Z'
  },
  {
    id: 'default-26',
    url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop',
    name: '工業科技',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:25.000Z'
  },
  {
    id: 'default-27',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop',
    name: '自動化生產',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:26.000Z'
  },
  {
    id: 'default-28',
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop',
    name: '團隊合作',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:27.000Z'
  },
  {
    id: 'default-29',
    url: 'https://images.unsplash.com/photo-1600880210837-0fc3fb047153?q=80&w=2070&auto=format&fit=crop',
    name: '現代辦公室',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:28.000Z'
  },
  {
    id: 'default-30',
    url: 'https://images.unsplash.com/photo-1606857521015-7f9fdf423740?q=80&w=2070&auto=format&fit=crop',
    name: '室內空間',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:29.000Z'
  },
  {
    id: 'default-31',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
    name: '居家安全',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:30.000Z'
  },
  {
    id: 'default-32',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2116&auto=format&fit=crop',
    name: '收納整理',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:31.000Z'
  },
  {
    id: 'default-33',
    url: 'https://images.unsplash.com/photo-1594484208280-efa00f9e990c?q=80&w=2070&auto=format&fit=crop',
    name: '專業清潔',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:32.000Z'
  },
  {
    id: 'default-34',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop',
    name: '廚房空間',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:33.000Z'
  },
  {
    id: 'default-35',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
    name: '溫馨臥室',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:34.000Z'
  },
  {
    id: 'default-36',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=2070&auto=format&fit=crop',
    name: '居家環境',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:35.000Z'
  },
  {
    id: 'default-37',
    url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=2070&auto=format&fit=crop',
    name: '房屋修繕',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:36.000Z'
  },
  {
    id: 'default-38',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    name: '豪宅外觀',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:37.000Z'
  },
  {
    id: 'default-39',
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
    name: '房地產',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:38.000Z'
  },
  {
    id: 'default-40',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    name: '現代別墅',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:39.000Z'
  },
  {
    id: 'default-41',
    url: 'https://images.unsplash.com/photo-1574689211272-bc15e6406241?q=80&w=2070&auto=format&fit=crop',
    name: '搬家服務',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:40.000Z'
  },
  {
    id: 'default-42',
    url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2070&auto=format&fit=crop',
    name: '城市景觀',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:41.000Z'
  },
  {
    id: 'default-43',
    url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop',
    name: '室內設計',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:42.000Z'
  },
  {
    id: 'default-44',
    url: 'https://images.unsplash.com/photo-1447703693928-9cd89c8d3ac5?q=80&w=2071&auto=format&fit=crop',
    name: '安全防護',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:43.000Z'
  },
  {
    id: 'default-45',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop',
    name: '圖書館',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:44.000Z'
  },
  {
    id: 'default-46',
    url: 'https://images.unsplash.com/photo-1581339399838-2a120c18bba3?q=80&w=2070&auto=format&fit=crop',
    name: '安心照護',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:45.000Z'
  },
  {
    id: 'default-47',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
    name: '商務會議',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:46.000Z'
  },
  {
    id: 'default-48',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2068&auto=format&fit=crop',
    name: '牙科診所',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:47.000Z'
  },
  {
    id: 'default-49',
    url: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop',
    name: '客戶服務',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:48.000Z'
  },
  {
    id: 'default-50',
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=2070&auto=format&fit=crop',
    name: '衛浴空間',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:49.000Z'
  },
  {
    id: 'default-51',
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop',
    name: '現代衛浴',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:50.000Z'
  },
  {
    id: 'default-52',
    url: 'https://images.unsplash.com/photo-1564540583246-934409427776?q=80&w=2070&auto=format&fit=crop',
    name: '衛浴修繕',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:51.000Z'
  },
  {
    id: 'default-53',
    url: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop',
    name: '房地產諮詢',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:52.000Z'
  },
  {
    id: 'default-54',
    url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2070&auto=format&fit=crop',
    name: '規劃整理',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:53.000Z'
  },
  {
    id: 'default-55',
    url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1974&auto=format&fit=crop',
    name: '衣櫃收納',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:54.000Z'
  },
  {
    id: 'default-56',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop',
    name: '藥品管理',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:55.000Z'
  },
  {
    id: 'default-57',
    url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    name: '安全評估',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:56.000Z'
  },
  {
    id: 'default-58',
    url: 'https://images.unsplash.com/photo-1585128719715-46776b56a0d1?q=80&w=1974&auto=format&fit=crop',
    name: '裝飾設計',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:57.000Z'
  },
  {
    id: 'default-59',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2070&auto=format&fit=crop',
    name: '室內美學',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:58.000Z'
  },
  {
    id: 'default-60',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    name: '老屋翻新',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:00:59.000Z'
  },
  {
    id: 'default-61',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2070&auto=format&fit=crop',
    name: '居家水電',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:00.000Z'
  },
  {
    id: 'default-62',
    url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop',
    name: '客廳沙發',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:01.000Z'
  },
  {
    id: 'default-63',
    url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=2070&auto=format&fit=crop',
    name: '健康照護',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:02.000Z'
  },
  {
    id: 'default-64',
    url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop',
    name: '營養餐點',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:03.000Z'
  },
  {
    id: 'default-65',
    url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
    name: '住宅外觀',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:04.000Z'
  },
  {
    id: 'default-66',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2070&auto=format&fit=crop',
    name: '閱讀空間',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:05.000Z'
  },
  {
    id: 'default-67',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000&auto=format&fit=crop',
    name: '專業顧問',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:06.000Z'
  },
  {
    id: 'default-68',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop',
    name: '商務菁英',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:07.000Z'
  },
  {
    id: 'default-69',
    url: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2070&auto=format&fit=crop',
    name: '牙醫器材',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:08.000Z'
  },
  {
    id: 'default-70',
    url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=2070&auto=format&fit=crop',
    name: '居家清潔',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:09.000Z'
  },
  {
    id: 'default-71',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2070&auto=format&fit=crop',
    name: '廢棄物清理',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:10.000Z'
  },
  {
    id: 'default-72',
    url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=2070&auto=format&fit=crop',
    name: '環境整理',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:11.000Z'
  },
  {
    id: 'default-73',
    url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=2070&auto=format&fit=crop',
    name: '健康飲食',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:12.000Z'
  },
  {
    id: 'default-74',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
    name: '生鮮蔬果',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:13.000Z'
  },
  {
    id: 'default-75',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop',
    name: '烹飪教學',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:14.000Z'
  },
  {
    id: 'default-76',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
    name: '租屋空間',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:15.000Z'
  },
  {
    id: 'default-77',
    url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop',
    name: '現代公寓',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:16.000Z'
  },
  {
    id: 'default-78',
    url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop',
    name: '金融理財',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:17.000Z'
  },
  {
    id: 'default-79',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop',
    name: '醫療科技',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:18.000Z'
  },
  {
    id: 'default-80',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop',
    name: '合作夥伴',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:19.000Z'
  },
  {
    id: 'default-81',
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
    name: '專業服務',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:20.000Z'
  },
  {
    id: 'default-82',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    name: '團隊成員-1',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:21.000Z'
  },
  {
    id: 'default-83',
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=200&auto=format&fit=crop',
    name: '團隊成員-2',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:22.000Z'
  },
  {
    id: 'default-84',
    url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=200&auto=format&fit=crop',
    name: '團隊成員-3',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:23.000Z'
  },
  {
    id: 'default-85',
    url: 'https://images.unsplash.com/photo-1556912998-c57cc6b63ce7?q=80&w=2070&auto=format&fit=crop',
    name: '廚房翻新',
    type: 'image/jpeg',
    createdAt: '2024-01-01T00:01:24.000Z'
  }
];

class MediaService {
  private media: MediaItem[] = [];
  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.load();
  }

  /** Supabase DB 的 snake_case row → 前端 camelCase MediaItem */
  private mapRow(row: any): MediaItem {
    return {
      id: row.id,
      url: row.url,
      name: row.name,
      type: row.type,
      createdAt: row.created_at,
      source: row.source,
      storagePath: row.storage_path ?? undefined,
    };
  }

  private async load() {
    // 先讀 localforage 快取（即時可用）
    try {
      const cached = await store.getItem<MediaItem[]>(STORAGE_KEY);
      if (cached && cached.length > 0) {
        this.media = cached;
      }
    } catch (e) {
      console.warn('[mediaService] localforage load failed', e);
    }

    // 背景從 Supabase 拉最新
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const remote = (data ?? []).map(this.mapRow);

        // 合併：Supabase 資料 + 預設圖（如果 DB 裡沒有的話）
        const merged = [...remote];
        DEFAULT_MEDIA.forEach(def => {
          if (!merged.find(m => m.url === def.url || m.id === def.id)) {
            merged.push(def);
          }
        });
        this.media = merged;
        await this.saveCache();
        return;
      } catch (e) {
        console.warn('[mediaService] Supabase load failed, falling back to cache/defaults', e);
      }
    }

    // Fallback：無 Supabase 或失敗 → 用 cache / localStorage 舊資料 / 預設
    if (this.media.length === 0) {
      const oldStored = localStorage.getItem(STORAGE_KEY);
      if (oldStored) {
        try { this.media = JSON.parse(oldStored); }
        catch { this.media = [...DEFAULT_MEDIA]; }
      } else {
        this.media = [...DEFAULT_MEDIA];
      }
      await this.saveCache();
    }
  }

  /** 更新 localforage 快取（不會 throw） */
  private async saveCache() {
    try {
      await store.setItem(STORAGE_KEY, this.media);
    } catch (e) {
      // 快取失敗不影響主流程
      console.warn('[mediaService] saveCache failed', e);
    }
  }

  async getAll(): Promise<MediaItem[]> {
    await this.initialized;
    return [...this.media].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /** 從 Supabase 重新同步（公開，UI 可呼叫） */
  async refresh(): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const remote = (data ?? []).map(this.mapRow);
      const merged = [...remote];
      DEFAULT_MEDIA.forEach(def => {
        if (!merged.find(m => m.url === def.url || m.id === def.id)) {
          merged.push(def);
        }
      });
      this.media = merged;
      await this.saveCache();
    } catch (e) {
      console.error('[mediaService] refresh failed', e);
    }
  }

  /**
   * 上傳檔案：
   *   - 若 Supabase 已設定：上傳到 Storage bucket，metadata 存 media 表
   *   - 否則：fallback 到 base64 存 localforage（原行為）
   */
  async upload(file: File, source: 'admin' | 'vendor' | 'customer' = 'admin'): Promise<MediaItem> {
    // 基本大小限制（Supabase bucket 上限為 10MB）
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`檔案「${file.name}」超過 10MB 上限`);
    }

    if (isSupabaseConfigured) {
      // Supabase Storage upload (不需要等 this.initialized — 上傳跟初始 cache 載入無關)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `uploads/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_MEDIA_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) {
        throw new Error(`上傳失敗：${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(SUPABASE_MEDIA_BUCKET)
        .getPublicUrl(storagePath);

      const id = Date.now().toString();
      const newItem: MediaItem = {
        id,
        url: urlData.publicUrl,
        name: file.name,
        type: file.type,
        createdAt: new Date().toISOString(),
        source,
        storagePath,
      };

      // 寫入 media metadata 表
      const { error: insertError } = await supabase.from('media').insert({
        id,
        url: newItem.url,
        name: newItem.name,
        type: newItem.type,
        storage_path: storagePath,
        source,
        created_at: newItem.createdAt,
      });
      if (insertError) {
        // Rollback: 移除剛上傳的 storage 檔案
        supabase.storage.from(SUPABASE_MEDIA_BUCKET).remove([storagePath]).catch(() => {});
        throw new Error(`儲存媒體資訊失敗：${insertError.message}`);
      }

      // 更新 in-memory + 背景寫 cache（非阻塞，不影響使用者等待時間）
      this.media.unshift(newItem);
      this.saveCache().catch(err => console.warn('[mediaService] saveCache failed', err));
      return newItem;
    }

    // Fallback：base64 + localforage（無 Supabase 時）
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const newItem: MediaItem = {
          id: Date.now().toString(),
          url: result,
          name: file.name,
          type: file.type,
          createdAt: new Date().toISOString(),
          source
        };
        this.media.unshift(newItem);
        try {
          await store.setItem(STORAGE_KEY, this.media);
        } catch (err) {
          // 回滾記憶體狀態
          this.media = this.media.filter(m => m.id !== newItem.id);
          reject(new Error('儲存空間不足，無法儲存更多圖片'));
          return;
        }
        resolve(newItem);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async delete(id: string) {
    await this.initialized;
    const target = this.media.find(m => m.id === id);

    if (isSupabaseConfigured && target) {
      // 刪 storage 檔案（若有上傳過）
      if (target.storagePath) {
        await supabase.storage.from(SUPABASE_MEDIA_BUCKET)
          .remove([target.storagePath])
          .catch(err => console.warn('[mediaService] Storage remove failed', err));
      }
      // 刪 DB row
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) {
        throw new Error(`刪除媒體失敗：${error.message}`);
      }
    }

    this.media = this.media.filter(item => item.id !== id);
    await this.saveCache();
  }
}

export const mediaService = new MediaService();
