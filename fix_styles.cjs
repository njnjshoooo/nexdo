const fs = require('fs');
const glob = require('glob');

const labelReplacement = `const Label = ({ children }: any) => (
    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">{children}</label>
  );`;

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Label replacement for HomeEditor, BlogEditor, etc.
  if (content.includes('const Label = ({ children }: any) => (')) {
    content = content.replace(
      /const Label = \(\{ children \}: any\) => \(\s*<label className="block text-xs font-bold text-stone-500 uppercase mb-1">\{children\}<\/label>\s*\);/,
      labelReplacement
    );
    changed = true;
  }

  // 2. card container refactoring (white with shadow)
  // finding instances like bg-stone-50 p-4 rounded-xl border border-stone-200
  const bgStone50CardRegex = /bg-stone-50 p-4 rounded-xl border border-stone-100/g;
  if(content.match(bgStone50CardRegex)) {
    content = content.replace(bgStone50CardRegex, 'bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative');
    changed = true;
  }

  // 3. Update inputs
  // The goal: replace various input tailwind classes with the unified ones
  const unifiedInputClass = 'w-full border border-stone-200 bg-stone-50 p-3 rounded-xl text-sm focus:border-stone-900 focus:bg-white outline-none transition-all';
  
  // match standard hook-form inputs with w-full ...
  // This is a bit tricky, let's target specific known strings
  const wFullClasses = [
    'w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all',
    'w-full px-3 py-2 border border-stone-300 rounded-lg text-sm',
    'w-full px-3 py-2 border border-stone-300 rounded-lg',
    'w-full border border-stone-200 p-4 rounded-xl font-bold bg-white outline-none shadow-sm',
    'w-full border border-stone-200 p-4 rounded-xl bg-white outline-none shadow-sm',
    'w-full border border-stone-200 p-4 rounded-2xl font-bold bg-white shadow-sm outline-none',
    'w-full border border-stone-200 p-4 rounded-2xl bg-white shadow-sm outline-none',
    'w-full border border-stone-200 p-4 rounded-2xl bg-white outline-none',
    'w-full border border-stone-200 p-4 rounded-2xl font-bold text-lg bg-white outline-none',
    'w-full border border-stone-200 p-3 rounded-xl bg-white outline-none text-sm',
    'w-full border border-stone-200 p-4 rounded-xl font-mono text-sm bg-white outline-none shadow-sm',
    'w-full border border-stone-200 p-4 rounded-xl text-sm bg-white outline-none shadow-sm',
    'w-full border border-stone-200 p-6 rounded-3xl text-stone-700 bg-white shadow-sm leading-relaxed outline-none',
    'w-full px-4 py-3 border border-stone-300 rounded-xl font-bold text-lg focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all',
    'w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all text-sm',
    'w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all',
    'w-full border border-stone-300 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#8B5E34] focus:border-transparent outline-none transition-all',
    'w-full border border-stone-200 p-3 rounded-xl outline-none focus:border-primary',
    'w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'w-full border border-stone-300 rounded-lg p-3 outline-none focus:border-stone-900',
    'w-full border border-stone-300 rounded-lg p-3 h-32 outline-none focus:border-stone-900'
  ];

  wFullClasses.forEach(cls => {
    if (content.includes(cls)) {
      content = content.replace(new RegExp(cls.replace(/[.*+?^$\{\}()|\[\]\\]/g, '\\$&'), 'g'), unifiedInputClass);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

['src/pages/admin/editors/HomeEditor.tsx', 
 'src/pages/admin/editors/BlogEditor.tsx', 
 'src/pages/admin/editors/GeneralEditor.tsx',
 'src/pages/admin/PageEditor.tsx'].forEach(processFile);
