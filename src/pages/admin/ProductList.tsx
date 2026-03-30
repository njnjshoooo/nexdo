import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, ExternalLink, RefreshCw, Check, AlertCircle, Edit2, X, Save, Plus, Trash2, FileText } from 'lucide-react';
import { productService } from '../../services/productService';
import { pageService } from '../../services/pageService';
import { formService } from '../../services/formService';
import { Product } from '../../types/admin';
import { Form } from '../../types/form';
import { motion, AnimatePresence } from 'motion/react';
import ImageUploader from '../../components/admin/ImageUploader';

interface ProductEditModalProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

function ProductEditModal({ product, onClose, onSave }: ProductEditModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product>(JSON.parse(JSON.stringify(product)));
  const [isSaving, setIsSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [orderCodeError, setOrderCodeError] = useState('');
  const [forms, setForms] = useState<Form[]>([]);
  
  useEffect(() => {
    setForms(formService.getAll());
  }, []);
  
  // Get unique existing categories
  const existingCategories = Array.from(new Set(productService.getAll().map(p => p.category).filter(Boolean))) as string[];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      updateProductField('category', newCategory.trim());
      setNewCategory('');
    }
  };

  const handleSave = async () => {
    // Validate orderCode
    if (!editedProduct.orderCode || editedProduct.orderCode.trim() === '') {
      setOrderCodeError('訂單代碼為必填欄位');
      return;
    }

    const code = editedProduct.orderCode.toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      setOrderCodeError('訂單代碼必須為 3 碼大寫英文字母');
      return;
    }

    // Check uniqueness
    const allProducts = productService.getAll();
    const isDuplicate = allProducts.some(p => p.id !== editedProduct.id && p.orderCode === code);
    if (isDuplicate) {
      setOrderCodeError('此訂單代碼已與其他產品重複');
      return;
    }

    // Update to uppercase
    editedProduct.orderCode = code;

    setOrderCodeError('');
    setIsSaving(true);
    try {
      await productService.update(editedProduct.id, editedProduct);
      onSave();
      onClose();
    } catch (error) {
      console.error('儲存產品失敗:', error);
      alert('操作失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProductField = (field: string, value: any) => {
    setEditedProduct(prev => {
      const newProduct = { ...prev };
      if (field.includes('.')) {
        const parts = field.split('.');
        let current: any = newProduct;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          // Clone the nested object to avoid direct mutation of previous state
          current[part] = { ...(current[part] || {}) };
          current = current[part];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        (newProduct as any)[field] = value;
        
        // Initialize configs if switching modes and they don't exist
        if (field === 'orderMode') {
          if (value === 'INTERNAL_FORM' && !newProduct.internalFormConfig) {
            newProduct.internalFormConfig = { priceText: '依需求報價', buttonText: '填寫表單', formId: '' };
          }
          if (value === 'EXTERNAL_LINK' && !newProduct.externalLinkConfig) {
            newProduct.externalLinkConfig = { priceText: '依需求報價', buttonText: 'LINE諮詢報價', url: '' };
          }
        }
      }
      return newProduct;
    });
  };

  const handleAddChecklist = () => {
    const checklist = [...(editedProduct.checklist || [])];
    checklist.push({ text: '' });
    updateProductField('checklist', checklist);
  };

  const handleRemoveChecklist = (index: number) => {
    const checklist = [...(editedProduct.checklist || [])];
    checklist.splice(index, 1);
    updateProductField('checklist', checklist);
  };

  const handleUpdateChecklist = (index: number, text: string) => {
    const checklist = [...(editedProduct.checklist || [])];
    checklist[index].text = text;
    updateProductField('checklist', checklist);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">編輯產品核心資訊</h2>
            <p className="text-stone-500 text-sm mt-1">ID: {product.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X size={24} className="text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Basic Info Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-stone-400">
              <Package size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">產品基本資訊</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">產品名稱</label>
                  <input 
                    type="text" 
                    value={editedProduct.name}
                    onChange={(e) => updateProductField('name', e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">訂單代碼 (3碼大寫英文字母)</label>
                  <input 
                    type="text" 
                    maxLength={3}
                    value={editedProduct.orderCode || ''}
                    onChange={(e) => {
                      setOrderCodeError('');
                      updateProductField('orderCode', e.target.value.toUpperCase());
                    }}
                    placeholder="例如: HTF"
                    className={`w-full px-4 py-3 bg-stone-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${orderCodeError ? 'border-red-500' : 'border-stone-200'}`}
                  />
                  {orderCodeError && <p className="text-red-500 text-xs mt-1 ml-1">{orderCodeError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">分類</label>
                  <div className="space-y-3">
                    <select
                      value={editedProduct.category || ''}
                      onChange={(e) => updateProductField('category', e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="">選擇分類...</option>
                      {existingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      {editedProduct.category && !existingCategories.includes(editedProduct.category) && (
                        <option value={editedProduct.category}>{editedProduct.category}</option>
                      )}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="輸入新分類名稱"
                        className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                      <button
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                        className="px-4 py-2 bg-stone-200 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-300 transition-colors disabled:opacity-50"
                      >
                        新增
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">產品描述</label>
                  <textarea 
                    rows={4}
                    value={editedProduct.description}
                    onChange={(e) => updateProductField('description', e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">產品主圖</label>
                <ImageUploader 
                  value={editedProduct.image || ''} 
                  onChange={(url) => updateProductField('image', url)} 
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-bold text-stone-400 uppercase ml-1">產品特色清單 (Checklist)</label>
                <button 
                  onClick={handleAddChecklist}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> 新增項目
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {editedProduct.checklist?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <input 
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateChecklist(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="輸入特色描述..."
                    />
                    <button 
                      onClick={() => handleRemoveChecklist(index)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Transaction Parameters Section */}
          <section className="space-y-6 pt-10 border-t border-stone-100">
            <div className="flex items-center gap-2 text-stone-400">
              <RefreshCw size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">交易參數設定</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-3 ml-1">訂單模式</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => updateProductField('orderMode', 'FIXED')}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold ${editedProduct.orderMode === 'FIXED' ? 'border-primary bg-primary/5 text-primary' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editedProduct.orderMode === 'FIXED' ? 'border-primary' : 'border-stone-300'}`}>
                      {editedProduct.orderMode === 'FIXED' && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    標價模式 (FIXED)
                  </button>
                  <button 
                    onClick={() => updateProductField('orderMode', 'INTERNAL_FORM')}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold ${editedProduct.orderMode === 'INTERNAL_FORM' ? 'border-primary bg-primary/5 text-primary' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editedProduct.orderMode === 'INTERNAL_FORM' ? 'border-primary' : 'border-stone-300'}`}>
                      {editedProduct.orderMode === 'INTERNAL_FORM' && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    內部表單 (INTERNAL_FORM)
                  </button>
                  <button 
                    onClick={() => updateProductField('orderMode', 'EXTERNAL_LINK')}
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold ${editedProduct.orderMode === 'EXTERNAL_LINK' ? 'border-primary bg-primary/5 text-primary' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editedProduct.orderMode === 'EXTERNAL_LINK' ? 'border-primary' : 'border-stone-300'}`}>
                      {editedProduct.orderMode === 'EXTERNAL_LINK' && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    外部連結 (EXTERNAL_LINK)
                  </button>
                </div>
              </div>

              {editedProduct.orderMode === 'FIXED' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">價格 (NT$)</label>
                      <input 
                        type="number" 
                        value={editedProduct.fixedConfig.price}
                        onChange={(e) => updateProductField('fixedConfig.price', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">單位</label>
                      <input 
                        type="text" 
                        value={editedProduct.fixedConfig.unit}
                        onChange={(e) => updateProductField('fixedConfig.unit', e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">按鈕文字</label>
                      <input 
                        type="text" 
                        value={editedProduct.fixedConfig.buttonText}
                        onChange={(e) => updateProductField('fixedConfig.buttonText', e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* Field Toggles */}
                  <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 mb-4">前台下單欄位配置 (Field Toggles)</h4>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={editedProduct.requireDate || false}
                          onChange={(e) => updateProductField('requireDate', e.target.checked)}
                          className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">期望日期（＊必填，至少填三個為佳）</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={editedProduct.requireTime || false}
                          onChange={(e) => updateProductField('requireTime', e.target.checked)}
                          className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">期望時段（＊必選，下拉選單：上午8:00~12:00、14:00~18:00）</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={editedProduct.requireNotes || false}
                          onChange={(e) => updateProductField('requireNotes', e.target.checked)}
                          className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">備註需求</span>
                      </label>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-stone-900">多規格定價 (Variants)</h4>
                      <button 
                        onClick={() => {
                          const variants = [...(editedProduct.variants || [])];
                          variants.push({ id: `var-${Date.now()}`, name: '', description: '', price: 0, unit: '' });
                          updateProductField('variants', variants);
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus size={14} /> 新增產品規格
                      </button>
                    </div>
                    
                    {editedProduct.variants && editedProduct.variants.length > 0 ? (
                      <div className="space-y-4">
                        {editedProduct.variants.map((variant, index) => (
                          <div key={variant.id} className="p-4 bg-white rounded-xl border border-stone-200 relative group">
                            <button 
                              onClick={() => {
                                const variants = [...(editedProduct.variants || [])];
                                variants.splice(index, 1);
                                updateProductField('variants', variants);
                              }}
                              className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                              <div>
                                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">規格名稱</label>
                                <input 
                                  type="text" 
                                  value={variant.name}
                                  onChange={(e) => {
                                    const variants = [...(editedProduct.variants || [])];
                                    variants[index].name = e.target.value;
                                    updateProductField('variants', variants);
                                  }}
                                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">加價金額 (NT$)</label>
                                  <input 
                                    type="number" 
                                    value={variant.price}
                                    onChange={(e) => {
                                      const variants = [...(editedProduct.variants || [])];
                                      variants[index].price = parseInt(e.target.value) || 0;
                                      updateProductField('variants', variants);
                                    }}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">單位</label>
                                  <input 
                                    type="text" 
                                    value={variant.unit}
                                    onChange={(e) => {
                                      const variants = [...(editedProduct.variants || [])];
                                      variants[index].unit = e.target.value;
                                      updateProductField('variants', variants);
                                    }}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">描述</label>
                              <textarea 
                                rows={2}
                                value={variant.description}
                                onChange={(e) => {
                                  const variants = [...(editedProduct.variants || [])];
                                  variants[index].description = e.target.value;
                                  updateProductField('variants', variants);
                                }}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-500 text-center py-4">目前沒有設定任何規格，將使用預設價格。</p>
                    )}
                  </div>
                </div>
              ) : editedProduct.orderMode === 'INTERNAL_FORM' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">報價文字</label>
                    <input 
                      type="text" 
                      value={editedProduct.internalFormConfig?.priceText || ''}
                      onChange={(e) => updateProductField('internalFormConfig.priceText', e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">按鈕文字</label>
                    <input 
                      type="text" 
                      value={editedProduct.internalFormConfig?.buttonText || ''}
                      onChange={(e) => updateProductField('internalFormConfig.buttonText', e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">關聯表單</label>
                    <select
                      value={editedProduct.internalFormConfig?.formId || ''}
                      onChange={(e) => updateProductField('internalFormConfig.formId', e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                    >
                      <option value="">請選擇表單...</option>
                      {forms.map(form => (
                        <option key={form.id} value={form.id}>{form.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">報價文字</label>
                    <input 
                      type="text" 
                      value={editedProduct.externalLinkConfig?.priceText || ''}
                      onChange={(e) => updateProductField('externalLinkConfig.priceText', e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">按鈕文字</label>
                    <input 
                      type="text" 
                      value={editedProduct.externalLinkConfig?.buttonText || ''}
                      onChange={(e) => updateProductField('externalLinkConfig.buttonText', e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">外部連結 (網址)</label>
                    <input 
                      type="text" 
                      value={editedProduct.externalLinkConfig?.url || ''}
                      onChange={(e) => updateProductField('externalLinkConfig.url', e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="https://"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-200 transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-black transition-all flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            儲存產品資訊
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    const allProducts = productService.getAll();
    setProducts(allProducts);
    setLoading(false);
  };

  const handleAddProduct = async () => {
    try {
      const newProduct = await productService.create({ name: '新產品' });
      loadProducts();
      setEditingProduct(newProduct);
    } catch (error) {
      console.error('新增產品失敗:', error);
      alert('操作失敗');
    }
  };

  const existingCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getPageUrlForProduct = (productId: string) => {
    const pages = pageService.getAll();
    const page = pages.find(p => p.template === 'SUB_ITEM' && p.content.subItem?.productId === productId);
    return page ? `/admin/pages/${page.slug}` : null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">產品管理</h1>
          <p className="text-stone-500 mt-1">管理所有服務項目的定價模式與按鈕導向</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
          >
            <option value="">所有分類</option>
            {existingCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="搜尋產品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all"
          >
            <Plus size={16} /> 新增產品
          </button>
          <button 
            onClick={loadProducts}
            className="p-2 text-stone-400 hover:text-primary transition-colors"
            title="重新整理"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-sm font-bold text-stone-600">產品名稱</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">分類</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">訂單代碼</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">當前模式</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">價格 / 報價內容</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">按鈕目的地</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredProducts.map((product) => {
                const isFixed = product.orderMode === 'FIXED';
                const pageUrl = getPageUrlForProduct(product.id);

                return (
                  <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    </td>
                    <td className="px-6 py-4">
                      {product.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.orderCode ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                          {product.orderCode}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${isFixed ? 'text-primary' : 'text-stone-500'}`}>
                          {product.orderMode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        {isFixed ? (
                          <>
                            <ArrowRight size={14} className="text-emerald-500" />
                            <span>/checkout (購物車)</span>
                          </>
                        ) : product.orderMode === 'INTERNAL_FORM' ? (
                          <>
                            <FileText size={14} className="text-primary" />
                            <span>內部表單</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink size={14} className="text-primary" />
                            <span>外部連結</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="flex items-center gap-1.5 text-stone-600 hover:text-primary font-bold text-sm transition-colors"
                        >
                          <Edit2 size={16} />
                          編輯
                        </button>
                        {pageUrl && (
                          <>
                            <div className="w-px h-4 bg-stone-200" />
                            <Link 
                              to={pageUrl}
                              className="text-stone-400 hover:text-stone-900 text-sm font-medium transition-colors"
                            >
                              編輯關聯頁面
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                    目前尚無產品資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editingProduct && (
          <ProductEditModal 
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={loadProducts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
