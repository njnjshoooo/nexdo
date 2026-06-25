const fs = require('fs');

const path = 'src/pages/admin/PageEditor.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-stone-900 outline-none"/g, 'className="w-full border border-stone-200 bg-stone-50 p-3 rounded-xl text-sm focus:border-stone-900 focus:bg-white outline-none transition-all"');
c = c.replace(/className="w-full border border-stone-200 p-3 rounded-xl text-sm font-mono focus:border-stone-900 outline-none"/g, 'className="w-full border border-stone-200 bg-stone-50 p-3 rounded-xl text-sm font-mono focus:border-stone-900 focus:bg-white outline-none transition-all"');
c = c.replace(/className="w-full border border-stone-200 p-3 rounded-xl text-sm focus:border-stone-900 outline-none bg-stone-50 text-stone-500"/g, 'className="w-full border border-stone-200 p-3 rounded-xl text-sm bg-stone-50 text-stone-400 outline-none cursor-not-allowed transition-all"');

fs.writeFileSync(path, c);
