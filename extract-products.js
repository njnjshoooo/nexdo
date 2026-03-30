import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/data/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const products = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
  if (content.includes("template: 'SUB_ITEM'")) {
    const idMatch = content.match(/id:\s*'([^']+)'/);
    if (!idMatch) continue;
    const id = idMatch[1];
    
    // Extract product object
    const nameMatch = content.match(/name:\s*'([^']+)'/);
    const descMatch = content.match(/description:\s*'([^']+)'/);
    const imageMatch = content.match(/image:\s*'([^']*)'/);
    
    // Extract orderMode
    const orderModeMatch = content.match(/orderMode:\s*'([^']+)'/);
    
    // Extract fixedConfig
    const fixedPriceMatch = content.match(/price:\s*(\d+)/);
    const fixedUnitMatch = content.match(/unit:\s*'([^']+)'/);
    const fixedBtnMatch = content.match(/buttonText:\s*'([^']+)'/);
    
    // Extract quoteConfig
    const quotePriceMatch = content.match(/priceText:\s*'([^']+)'/);
    const quoteBtnMatch = content.match(/buttonText:\s*'([^']+)'/);
    const quoteLinkMatch = content.match(/link:\s*'([^']*)'/);

    // Extract checklist
    const checklistMatch = content.match(/checklist:\s*(\[.*?\])/s);

    if (nameMatch) {
      products.push(`
  {
    id: '${id}',
    name: '${nameMatch[1]}',
    description: '${descMatch ? descMatch[1] : ''}',
    image: '${imageMatch ? imageMatch[1] : ''}',
    checklist: ${checklistMatch ? checklistMatch[1] : '[]'},
    orderMode: '${orderModeMatch ? orderModeMatch[1] : 'QUOTE'}',
    fixedConfig: {
      price: ${fixedPriceMatch ? fixedPriceMatch[1] : 0},
      unit: '${fixedUnitMatch ? fixedUnitMatch[1] : '次'}',
      buttonText: '${fixedBtnMatch ? fixedBtnMatch[1] : '立即下單'}'
    },
    quoteConfig: {
      priceText: '${quotePriceMatch ? quotePriceMatch[1] : '依需求報價'}',
      buttonText: '${quoteBtnMatch ? quoteBtnMatch[1] : 'LINE諮詢報價'}',
      link: '${quoteLinkMatch ? quoteLinkMatch[1] : ''}'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }`);
    }
  }
}

const output = `import { Product } from '../../types/admin';

export const initialProducts: Product[] = [${products.join(',')}
];
`;

fs.mkdirSync(path.join(process.cwd(), 'src/data/products'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'src/data/products/index.ts'), output);
console.log('Done');
