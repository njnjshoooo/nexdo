import type { Page, Product } from '../types/admin';

export const LINE_QUOTE_URL = 'https://line.me/R/ti/p/@021souxl';
export const organizingProducts: Product[] = [
  {
    "id": "organizing",
    "name": "老前整理",
    "category": "老前整理",
    "description": "在人生的重要時刻，陪您整理空間、保存回憶，安排下一段生活",
    "orderMode": "EXTERNAL_LINK",
    "orderCode": "ORGA",
    "fixedConfig": {
      "price": 0,
      "unit": "次",
      "buttonText": ""
    },
    "externalLinkConfig": {
      "priceText": "依整理範圍評估報價",
      "buttonText": "Line 報價預約",
      "url": "https://line.me/R/ti/p/@021souxl"
    },
    "checklist": [
      {
        "text": "物品分為「留／傳／贈／離」四類"
      },
      {
        "text": "重要文件整理，方便日後尋找"
      },
      {
        "text": "紀念物拍照建檔，留下您的故事"
      },
      {
        "text": "可銜接整戶清空與清運"
      }
    ],
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z",
    "image": "/images/uniforms/scene-94.webp"
  },
  {
    "id": "vacant-property",
    "name": "空屋整理",
    "category": "房屋出租",
    "description": "出租前的整戶備妥，模組化選購",
    "orderMode": "EXTERNAL_LINK",
    "orderCode": "VACP",
    "fixedConfig": {
      "price": 0,
      "unit": "案",
      "buttonText": ""
    },
    "externalLinkConfig": {
      "priceText": "NT$ 20,000 – 150,000（依坪數與範圍）",
      "buttonText": "Line 報價預約",
      "url": "https://line.me/R/ti/p/@021souxl"
    },
    "checklist": [
      {
        "text": "清空：確認物品與搬運範圍"
      },
      {
        "text": "修繕評估：先說明需要改善的地方"
      },
      {
        "text": "清潔：依空間現況安排"
      },
      {
        "text": "拍照與上架：可接續好齡居代租代管"
      }
    ],
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z"
  },
  {
    "id": "removal",
    "name": "清運",
    "category": "房屋出租",
    "description": "不用的物品，我們幫您送走",
    "orderMode": "EXTERNAL_LINK",
    "orderCode": "REMV",
    "fixedConfig": {
      "price": 0,
      "unit": "車",
      "buttonText": ""
    },
    "externalLinkConfig": {
      "priceText": "NT$ 3,000 – 20,000（依車次與物品類型）",
      "buttonText": "Line 報價預約",
      "url": "https://line.me/R/ti/p/@021souxl"
    },
    "checklist": [
      {
        "text": "家電拆解與載運，先確認設備狀況"
      },
      {
        "text": "大型家具拆卸與搬運"
      },
      {
        "text": "雜物分類與清運"
      },
      {
        "text": "依物品類型安排回收或合適處理"
      }
    ],
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z"
  }
];

export const organizingPages: Page[] = [
  {
    "id": "organizing",
    "slug": "services/organizing",
    "title": "老前整理",
    "template": "SUB_ITEM",
    "isPublished": true,
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z",
    "content": {
      "hero": {
        "title": "老前整理",
        "mainButton": {
          "text": "安心顧問諮詢",
          "type": "URL",
          "value": "/consultant",
          "isVisible": true
        },
        "description": "在人生的重要時刻，陪您整理空間、保存回憶，安排下一段生活",
        "backgroundImage": "",
        "secondaryButton": {
          "text": "",
          "type": "URL",
          "value": "",
          "isVisible": false
        }
      },
      "cases": [],
      "subItem": {
        "faqs": [
          {
            "id": "organizing-price",
            "answer": "退休整理、老前整理、遺物整理與搬家整理，都是同一項服務，使用相同計價方式。實際費用依整理範圍、物品量、人力與時程評估，先確認報價再安排。",
            "question": "不同整理目標，收費方式不同嗎？"
          }
        ],
        "cases": [],
        "button": {
          "text": "Line 報價預約",
          "type": "URL",
          "value": "https://line.me/R/ti/p/@021souxl",
          "isVisible": true
        },
        "partners": [],
        "mainTitle": "老前整理",
        "productId": "organizing",
        "coreServices": [
          {
            "title": "01 評估",
            "content": "安心顧問先了解您的需求、空間與希望的節奏。"
          },
          {
            "title": "02 報價",
            "content": "說明服務範圍、時程與費用，經您確認後安排。"
          },
          {
            "title": "03 整理",
            "content": "依約定範圍執行；物品處置前先取得同意。"
          },
          {
            "title": "04 交付",
            "content": "一起核對整理結果與物品紀錄，討論後續安排。"
          }
        ],
        "serviceIntro": {
          "sections": [
            {
              "id": "organizing-intro",
              "text": {
                "content": "## 可陪您做的事\n\n- 物品分為「留／傳／贈／離」四類\n\n- 重要文件整理，方便日後尋找\n\n- 紀念物拍照建檔，留下您的故事\n\n- 可銜接整戶清空與清運\n\n## 依您的節奏安排\n\n**陪伴型**：慢慢做，與家人一起討論物品和居住安排。\n\n**效率型**：您已決定範圍與物品去留，由我們依約定時程執行。\n\n先評估再報價，第一次到府免費。後續服務範圍與費用，經您確認後才安排。",
                "fontSize": "body",
                "alignment": "left"
              },
              "type": "TEXT"
            }
          ]
        },
        "linkedProductId": "organizing",
        "additionalServices": [
          "vacant-property",
          "removal"
        ],
        "hideProductMainImage": true,
        "coreServicesSectionTitle": "從了解需求，到一起完成"
      },
      "services": [],
      "showForm": false
    }
  },
  {
    "id": "vacant-property",
    "slug": "services/vacant-property",
    "title": "空屋整理",
    "template": "SUB_ITEM",
    "isPublished": true,
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z",
    "content": {
      "hero": {
        "title": "空屋整理",
        "description": "出租前的整戶備妥，模組化選購",
        "backgroundImage": "",
        "mainButton": {
          "text": "安心顧問諮詢",
          "type": "URL",
          "value": "/consultant",
          "isVisible": true
        },
        "secondaryButton": {
          "text": "",
          "type": "URL",
          "value": "",
          "isVisible": false
        }
      },
      "services": [],
      "cases": [],
      "showForm": false,
      "subItem": {
        "productId": "vacant-property",
        "linkedProductId": "vacant-property",
        "hideProductMainImage": true,
        "mainTitle": "出租前的整戶備妥，模組化選購",
        "coreServicesSectionTitle": "從了解需求，到一起完成",
        "coreServices": [
          {
            "title": "01 評估",
            "content": "安心顧問先了解您的需求、空間與希望的節奏。"
          },
          {
            "title": "02 報價",
            "content": "說明服務範圍、時程與費用，經您確認後安排。"
          },
          {
            "title": "03 整理",
            "content": "依約定範圍執行；物品處置前先取得同意。"
          },
          {
            "title": "04 交付",
            "content": "一起核對整理結果與物品紀錄，討論後續安排。"
          }
        ],
        "partners": [],
        "cases": [],
        "faqs": [
          {
            "id": "vacant-property-0",
            "question": "一定要全套嗎？",
            "answer": "不用，可以依現況選擇清空、修繕評估、清潔、拍照或上架模組。各項範圍與費用會先說明，再由您決定。"
          },
          {
            "id": "vacant-property-1",
            "question": "清運費用怎麼算？",
            "answer": "依物品類型、數量、車次與搬運條件評估。報價時會說明是否包含清運，避免重複計費。"
          },
          {
            "id": "vacant-property-2",
            "question": "可以只做拍照嗎？",
            "answer": "可以先提出拍照需求。顧問會確認空間是否備妥、拍攝範圍與上架需求後報價。"
          }
        ],
        "additionalServices": [
          "rental-management",
          "organizing"
        ],
        "button": {
          "text": "Line 報價預約",
          "type": "URL",
          "value": "https://line.me/R/ti/p/@021souxl",
          "isVisible": true
        },
        "serviceIntro": {
          "sections": [
            {
              "id": "vacant-property-intro",
              "type": "TEXT",
              "text": {
                "content": "## 可陪您做的事\n\n- 清空：確認物品與搬運範圍\n\n- 修繕評估：先說明需要改善的地方\n\n- 清潔：依空間現況安排\n\n- 拍照與上架：可接續好齡居代租代管\n\n先了解您的需求與現場條件，確認範圍與費用後再安排服務。",
                "alignment": "left",
                "fontSize": "body"
              }
            }
          ]
        }
      }
    }
  },
  {
    "id": "removal",
    "slug": "services/removal",
    "title": "清運",
    "template": "SUB_ITEM",
    "isPublished": true,
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z",
    "content": {
      "hero": {
        "title": "清運",
        "description": "不用的物品，我們幫您送走",
        "backgroundImage": "",
        "mainButton": {
          "text": "安心顧問諮詢",
          "type": "URL",
          "value": "/consultant",
          "isVisible": true
        },
        "secondaryButton": {
          "text": "",
          "type": "URL",
          "value": "",
          "isVisible": false
        }
      },
      "services": [],
      "cases": [],
      "showForm": false,
      "subItem": {
        "productId": "removal",
        "linkedProductId": "removal",
        "hideProductMainImage": true,
        "mainTitle": "不用的物品，我們幫您送走",
        "coreServicesSectionTitle": "從了解需求，到一起完成",
        "coreServices": [
          {
            "title": "01 評估",
            "content": "安心顧問先了解您的需求、空間與希望的節奏。"
          },
          {
            "title": "02 報價",
            "content": "說明服務範圍、時程與費用，經您確認後安排。"
          },
          {
            "title": "03 整理",
            "content": "依約定範圍執行；物品處置前先取得同意。"
          },
          {
            "title": "04 交付",
            "content": "一起核對整理結果與物品紀錄，討論後續安排。"
          }
        ],
        "partners": [],
        "cases": [],
        "faqs": [
          {
            "id": "removal-0",
            "question": "大型家具可以嗎？",
            "answer": "可以先提供家具尺寸與照片。顧問會確認電梯、樓梯及拆卸需求，再評估人力與車次。"
          },
          {
            "id": "removal-1",
            "question": "需要自己搬到門口嗎？",
            "answer": "可以委託搬運，無須先自行搬動。請先告知樓層與出入條件，費用會納入報價說明。"
          },
          {
            "id": "removal-2",
            "question": "有回收價嗎？",
            "answer": "依品項、材質與現況確認，並非每件物品都有回收價。可折抵的金額與清運費用會分別說明。"
          }
        ],
        "additionalServices": [
          "rental-management",
          "organizing"
        ],
        "button": {
          "text": "Line 報價預約",
          "type": "URL",
          "value": "https://line.me/R/ti/p/@021souxl",
          "isVisible": true
        },
        "serviceIntro": {
          "sections": [
            {
              "id": "removal-intro",
              "type": "TEXT",
              "text": {
                "content": "## 可陪您做的事\n\n- 家電拆解與載運，先確認設備狀況\n\n- 大型家具拆卸與搬運\n\n- 雜物分類與清運\n\n- 依物品類型安排回收或合適處理\n\n先了解您的需求與現場條件，確認範圍與費用後再安排服務。",
                "alignment": "left",
                "fontSize": "body"
              }
            }
          ]
        }
      }
    }
  }
];
