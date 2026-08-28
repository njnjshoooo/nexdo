import React, { useState, useEffect } from 'react';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, ExternalLink, RefreshCw, Edit2, X, Plus, Trash2, FileText } from 'lucide-react';
import CreateButton from '../../components/admin/CreateButton';
import { productService } from '../../services/productService';
import { pageService } from '../../services/pageService';
import { formService } from '../../services/formService';
import { Product } from '../../types/admin';
import { Form } from '../../types/form';
import { motion, AnimatePresence } from 'motion/react';
import ImageUploader from '../../components/admin/ImageUploader';
import MultiImageUploader from '../../components/admin/MultiImageUploader';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import AdminFilterSelect from '../../components/admin/search/AdminFilterSelect';
import AdminTable from '../../components/admin/AdminTable';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { Pagination } from '../../components/ui/Pagination';

import SaveButton from '../../components/admin/SaveButton';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const allProducts = await productService.getAll();
    setProducts(allProducts);
    setLoading(false);
  };

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const existingCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const getPageUrlForProduct = (productId: string) => {
    const pages = pageService.getAll();
    const page = pages.find(p => p.template === 'SUB_ITEM' && p.content.subItem?.productId === productId);
    return page ? `/admin/pages/${page.slug}` : null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <PageMainTitle className="!text-3xl mb-2">產品管理</PageMainTitle>
          <p className="text-stone-500 mt-1">管理所有服務項目的定價模式與按鈕導向</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateButton
            onClick={handleAddProduct}
            text="新增產品"
            icon={Plus}
          />
          <button 
            onClick={loadProducts}
            className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-400 hover:text-primary hover:border-primary transition-all h-11 flex items-center justify-center"
            title="重新整理"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋產品名稱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <AdminFilterSelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={[
            { label: '所有分類', value: '' },
            ...existingCategories.map(cat => ({ label: cat, value: cat }))
          ]}
          className="min-w-[200px]"
        />
      </AdminSearchBar>

      {/* Product Table */}
      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>產品名稱</AdminTable.Th>
              <AdminTable.Th>分類</AdminTable.Th>
              <AdminTable.Th>價格 / 報價內容</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedProducts.map((product) => {
              const isFixed = product.orderMode === 'FIXED';
              const pageUrl = getPageUrlForProduct(product.id);

              return (
                <AdminTable.Row key={product.id}>
                  <AdminTable.Td>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image || undefined} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{product.name}</p>
                        <p className="text-xs text-stone-400">ID: {product.id}</p>
                      </div>
                    </div>
                  </AdminTable.Td>
                  <AdminTable.Td>
                    {product.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400">-</span>
                    )}
                  </AdminTable.Td>
                  <AdminTable.Td>
                    {isFixed ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-stone-400">NT$</span>
                        <span className="text-lg font-bold text-stone-900">{product.fixedConfig.price.toLocaleString()}</span>
                        <span className="text-xs font-bold text-stone-400">/ {product.fixedConfig.unit}</span>
                      </div>
                    ) : product.orderMode === 'INTERNAL_FORM' ? (
                      <span className="text-sm font-medium text-stone-600">{product.internalFormConfig?.priceText}</span>
                    ) : (
                      <span className="text-sm font-medium text-stone-600">{product.externalLinkConfig?.priceText}</span>
                    )}
                  </AdminTable.Td>
                  <AdminTable.Td className="text-right">
                    <AdminTable.Actions>
                      <AdminTable.Edit onClick={() => navigate(`/admin/products/${product.id}`)} />
                      <AdminTable.Delete onClick={() => setProductToDelete(product)} />
                      {pageUrl && (
                        <Link 
                          to={pageUrl}
                          className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                          title="編輯關聯頁面"
                        >
                          <FileText size={18} />
                        </Link>
                      )}
                    </AdminTable.Actions>
                  </AdminTable.Td>
                </AdminTable.Row>
              );
            })}
            {paginatedProducts.length === 0 && !loading && (
              <AdminTable.Empty colSpan={4}>
                目前尚無產品資料
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

      

      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={async () => {
          if (productToDelete) {
            await productService.delete(productToDelete.id);
            await loadProducts();
            setProductToDelete(null);
          }
        }}
        title="刪除產品"
        message={`確定要刪除產品「${productToDelete?.name}」嗎？此操作無法復原。`}
      />
    </div>
  );
}
