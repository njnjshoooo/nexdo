const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/editors/GeneralEditor.tsx', 'utf8');
c = c.replace(/\/ \/>/g, '/>');
fs.writeFileSync('src/pages/admin/editors/GeneralEditor.tsx', c);
