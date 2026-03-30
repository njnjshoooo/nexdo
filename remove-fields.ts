import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src/data/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove product: { ... },
  content = content.replace(/product:\s*\{[\s\S]*?checklist:\s*\[[\s\S]*?\]\s*\},\s*/g, '');
  
  // Remove orderMode: '...',
  content = content.replace(/orderMode:\s*'[^']+',\s*/g, '');
  
  // Remove fixedConfig: { ... },
  content = content.replace(/fixedConfig:\s*\{[\s\S]*?buttonText:\s*'[^']+'\s*\},\s*/g, '');
  
  // Remove quoteConfig: { ... },
  content = content.replace(/quoteConfig:\s*\{[\s\S]*?buttonText:\s*'[^']+'\s*\},\s*/g, '');

  // Remove quoteConfig: { ... } at end of object
  content = content.replace(/quoteConfig:\s*\{[\s\S]*?buttonText:\s*'[^']+'\s*\}/g, '');

  fs.writeFileSync(filePath, content);
});

console.log('Done');
