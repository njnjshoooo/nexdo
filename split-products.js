import fs from 'fs';
import path from 'path';

const productsFile = fs.readFileSync(path.join(process.cwd(), 'src/data/products/index.ts'), 'utf-8');

const match = productsFile.match(/export const initialProducts: Product\[\] = \[\s*([\s\S]*?)\s*\];/);
if (match) {
  const productsStr = match[1];
  const products = productsStr.split('  },').map(p => p.trim() + (p.trim().endsWith('}') ? '' : '\n  }')).filter(p => p.length > 10);
  
  const indexImports = [];
  const indexArray = [];

  for (const p of products) {
    const idMatch = p.match(/id:\s*'([^']+)'/);
    if (idMatch) {
      const id = idMatch[1];
      const varName = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + 'Product';
      
      const fileContent = "import { Product } from '../../types/admin';\n\nexport const " + varName + ": Product = " + p + ";\n";
      fs.writeFileSync(path.join(process.cwd(), "src/data/products/" + id + ".ts"), fileContent);
      
      indexImports.push("import { " + varName + " } from './" + id + "';");
      indexArray.push("  " + varName);
    }
  }

  const indexContent = "import { Product } from '../../types/admin';\n" + indexImports.join('\n') + "\n\nexport const initialProducts: Product[] = [\n" + indexArray.join(',\n') + "\n];\n";
  fs.writeFileSync(path.join(process.cwd(), 'src/data/products/index.ts'), indexContent);
}
