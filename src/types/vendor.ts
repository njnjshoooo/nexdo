export interface Vendor {
  id: string; // 廠商ID
  name: string; // 廠商名稱
  taxId: string; // 統一編號
  type: string; // 廠商類型
  
  // 聯繫資訊
  contactName: string; // 窗口姓名
  jobTitle: string; // 職稱
  phone: string; // 公司電話
  extension?: string; // 分機
  address: string; // 公司地址
  account: string; // 帳號
  password?: string; // 密碼 (通常不直接回傳，但編輯時可能需要)
  
  // 信賴與營運資訊
  status: 'active' | 'suspended' | 'reviewing'; // 合作狀態
  certifications: string[]; // 專業證照 / 認證 (附件 URL)
  
  // 結算與財務設定
  commissionRate?: number; // 分潤比例 (%)
  settlementCycle?: 'Monthly' | 'Bi-weekly' | 'Weekly'; // 結算週期
  bankInfo?: {
    bankCode: string; // 銀行代碼
    bank: string; // 匯款銀行
    bankName: string; // 分行名稱
    accountName: string; // 戶名
    accountNumber: string; // 帳號
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  vendorId: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl?: string;
  hasPoliceRecord: boolean; // 是否提供良民證
  createdAt: string;
  updatedAt: string;
}
