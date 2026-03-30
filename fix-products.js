import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/data/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const indexImports = [];
const indexArray = [];

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
      const varName = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + 'Product';
      
      let fileContent = "import { Product } from '../../types/admin';\n\n";
      fileContent += "export const " + varName + ": Product = {\n";
      fileContent += "  id: '" + id + "',\n";
      fileContent += "  name: '" + nameMatch[1] + "',\n";
      fileContent += "  description: '" + (descMatch ? descMatch[1] : '') + "',\n";
      fileContent += "  image: '" + (imageMatch ? imageMatch[1] : '') + "',\n";
      fileContent += "  checklist: " + (checklistMatch ? checklistMatch[1] : '[]') + ",\n";
      fileContent += "  orderMode: '" + (orderModeMatch ? orderModeMatch[1] : 'QUOTE') + "',\n";
      fileContent += "  fixedConfig: {\n";
      fileContent += "    price: " + (fixedPriceMatch ? fixedPriceMatch[1] : 0) + ",\n";
      fileContent += "    unit: '" + (fixedUnitMatch ? fixedUnitMatch[1] : '次') + "',\n";
      fileContent += "    buttonText: '" + (fixedBtnMatch ? fixedBtnMatch[1] : '立即下單') + "'\n";
      fileContent += "  },\n";
      fileContent += "  quoteConfig: {\n";
      fileContent += "    priceText: '" + (quotePriceMatch ? quotePriceMatch[1] : '依需求報價') + "',\n";
      fileContent += "    buttonText: '" + (quoteBtnMatch ? quoteBtnMatch[1] : 'LINE諮詢報價') + "',\n";
      fileContent += "    link: '" + (quoteLinkMatch ? quoteLinkMatch[1] : '') + "'\n";
      fileContent += "  },\n";
      fileContent += "  createdAt: new Date().toISOString(),\n";
      fileContent += "  updatedAt: new Date().toISOString()\n";
      fileContent += "};\n";

      fs.writeFileSync(path.join(process.cwd(), "src/data/products/" + id + ".ts"), fileContent);
      
      indexImports.push("import { " + varName + " } from './" + id + "';");
      indexArray.push("  " + varName);
    }
  }
}

const indexContent = "import { Product } from '../../types/admin';\n" + indexImports.join('\n') + "\n\nexport const initialProducts: Product[] = [\n" + indexArray.join(',\n') + "\n];\n";
fs.writeFileSync(path.join(process.cwd(), 'src/data/products/index.ts'), indexContent);
console.log('Done');
