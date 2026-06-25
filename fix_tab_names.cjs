const fs = require('fs');

const path = 'src/pages/admin/PageEditor.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/label="表單開關"/g, 'label="服務表單"');

fs.writeFileSync(path, c);
