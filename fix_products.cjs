const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ProductList.tsx', 'utf-8');

// 1. Remove ProductEditModal
const start = content.indexOf('interface ProductEditModalProps');
const end = content.indexOf('export default function ProductList() {');
if (start !== -1 && end !== -1) {
    content = content.substring(0, start) + content.substring(end);
}

// 2. add useNavigate import if not there
if (!content.includes('useNavigate')) {
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link, useNavigate } from 'react-router-dom';");
}

// 3. remove editingProduct state
content = content.replace(/const \[editingProduct, setEditingProduct\] = useState<Product \| null>\(null\);\n/g, '');

// 4. Update handleAddProduct 
content = content.replace(/const handleAddProduct = async \(\) => {[\s\S]*?setEditingProduct\(newProduct\);\n  };\n/, `const handleAddProduct = () => {\n    navigate('/admin/products/new');\n  };\n`);

// 5. Add navigate hook inside ProductList component
content = content.replace('export default function ProductList() {', 'export default function ProductList() {\n  const navigate = useNavigate();');

// 6. Change Edit button click to navigate
content = content.replace(/onClick={() => setEditingProduct\(product\)}/g, "onClick={() => navigate(`/admin/products/${product.id}`)}");

// 7. remove the AnimatePresence block that renders ProductEditModal
const apStart = content.indexOf('<AnimatePresence>');
const apEnd = content.indexOf('</AnimatePresence>') + '</AnimatePresence>'.length;
if(apStart !== -1 && apEnd !== -1) {
    content = content.substring(0, apStart) + content.substring(apEnd);
}

fs.writeFileSync('src/pages/admin/ProductList.tsx', content);
