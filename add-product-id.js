import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/data/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const file of files) {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
  if (content.includes("template: 'SUB_ITEM'")) {
    const idMatch = content.match(/id:\s*'([^']+)'/);
    if (!idMatch) continue;
    const id = idMatch[1];
    
    // Add productId to subItem
    if (content.includes('subItem: {') && !content.includes('productId:')) {
      content = content.replace('subItem: {', "subItem: {\n      productId: '" + id + "',");
      fs.writeFileSync(path.join(pagesDir, file), content);
    }
  }
}
console.log('Done');
