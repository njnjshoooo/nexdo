import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface ProductEditModalProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

function ProductEditModal({ product, onClose, onSave }: ProductEditModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product>(JSON.parse(JSON.stringify(product)));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [newCategory, setNewCategory] = useState('');
  const [orderCodeError, setOrderCodeError] = useState('');
  const [idError, setIdError] = useState('');
  const [depositError, setDepositError] = useState('');
  const [forms, setForms] = useState<Form[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'order'>('basic');
  const [isEditingOrderCode, setIsEditingOrderCode] = useState(false);
  const [tempOrderCode, setTempOrderCode] = useState(product.orderCode || '');
  // 紀錄打開 modal 時的原始 ID，用於判斷是否變更
  const [originalId] = useState(product.id);
  
  useEffect(() => {
    setForms(formService.getAll());
  }, []);
  
  // Get unique existing categories
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const allProducts = await productService.getAll();
      const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean))) as string[];
      setExistingCategories(categories);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      updateProductField('category', newCategory.trim());
      setNewCategory('');
    }
  };

  const handleSave = async () => {
    // 驗證 ID
    const newId = (editedProduct.id || '').trim();
    if (!newId) {
      setIdError('產品 ID 為必填欄位');
      setActiveTab('basic');
      return;
    }
    if (!/^[a-z0-9-]+$/i.test(newId)) {
      setIdError('產品 ID 僅能包含英文字母、數字與連字號 (-)');
      setActiveTab('basic');
      return;
    }
    // 若 ID 有變更，檢查不可重複
    if (newId !== originalId) {
      const all = await productService.getAll();
      if (all.some(p => p.id === newId)) {
        setIdError(`此 ID「${newId}」已被其他產品使用`);
        setActiveTab('basic');
        return;
      }
    }

    // Validate orderCode if not editing
    if (isEditingOrderCode) {
      setOrderCodeError('請先確認修改訂單代碼');
      setActiveTab('order');
      return;
    }

    if (!editedProduct.orderCode || editedProduct.orderCode.trim() === '') {
      setOrderCodeError('訂單代碼為必填欄位');
      setActiveTab('order');
      return;
    }

    if (editedProduct.orderMode === 'FIXED' && editedProduct.fixedConfig?.enableDeposit) {
      const deposit = editedProduct.fixedConfig.depositRatio || 0;
      const balance = editedProduct.fixedConfig.balanceRatio || 0;
      if (deposit + balance !== 100) {
        setDepositError('訂金比例與尾款比例相加必須等於 100%');
        setActiveTab('order');
        return;
      }
    }

    setIdError('');
    setOrderCodeError('');
    setDepositError('');
    setSaveStatus('saving');

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (newId !== originalId) {
      // ID 已變更：先 create 新產品，再 delete 舊的（避免中途失敗造成資料遺失）
      const { id: _omit, ...rest } = editedProduct;
      try {
        await productService.create({ ...rest, id: newId });
        await productService.delete(originalId);
      } catch (err) {
        setIdError(`儲存失敗：${err instanceof Error ? err.message : String(err)}`);
        setSaveStatus('idle');
        setActiveTab('basic');
        return;
      }
    } else {
      await productService.update(editedProduct.id, editedProduct);
    }

    setSaveStatus('saved');

    setTimeout(() => {
      onSave();
      onClose();
    }, 500);
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

  const handleConfirmOrderCode = () => {
    if (!tempOrderCode || tempOrderCode.trim() === '') {
      setOrderCodeError('訂單代碼為必填欄位');
      return;
    }

    const code = tempOrderCode.toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      setOrderCodeError('訂單代碼必須為 3 碼大寫英文字母');
      return;
    }
    
    // Check uniqueness
    const checkUniqueness = async () => {
      const allProducts = await productService.getAll();
      const isDuplicate = allProducts.some(p => p.id !== editedProduct.id && p.orderCode === code);
      if (isDuplicate) {
        setOrderCodeError('此訂單代碼已與其他產品重複');
        return;
      }
      
      setOrderCodeError('');
      updateProductField('orderCode', code);
      setIsEditingOrderCode(false);
    };
    checkUniqueness();
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
        <div className="p-8 border-b border-stone-100 flex justify-between items-start bg-stone-50/50 gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">編輯產品核心資訊</h2>
            <div className="flex items-center gap-2">
              <label className="text-stone-500 text-sm font-medium shrink-0">產品 ID：</label>
              <input
                type="text"
                value={editedProduct.id}
                onChange={(e) => {
                  updateProductField('id', e.target.value);
                  if (idError) setIdError('');
                }}
                placeholder="例如：safety-assessment"
                className={`flex-1 max-w-md px-3 py-1.5 bg-white border rounded-lg text-sm font-mono focus:ring-2 outline-none transition-all ${idError ? 'border-red-400 focus:ring-red-200' : 'border-stone-200 focus:ring-primary/20 focus:border-primary'}`}
              />
            </div>
            {idError && <p className="text-red-500 text-xs mt-1.5 ml-1">{idError}</p>}
            {!idError && editedProduct.id !== originalId && (
              <p className="text-amber-600 text-xs mt-1.5 ml-1">⚠️ 變更 ID 會建立新產品並刪除舊的，請確認沒有訂單依賴此 ID</p>
            )}
            <p className="text-stone-400 text-xs mt-1 ml-1">僅能包含英文字母、數字、連字號 (-)。前台網址會用到此 ID。</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors shrink-0">
            <X size={24} className="text-stone-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'basic' ? 'border-primary text-primary' : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            產品基本資訊
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'order' ? 'border-primary text-primary' : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            訂單設定
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'basic' && (
            <section className="space-y-6">
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

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">產品輪播圖 (Gallery)</label>
                <MultiImageUploader 
                  values={editedProduct.images || []} 
                  onChange={(urls) => updateProductField('images', urls)} 
                />
                <p className="text-[10px] text-stone-400 mt-2 ml-1">
                  這些圖片將顯示在產品詳情頁的輪播圖中。建議尺寸 1200x800px。
                </p>
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
          )}

          {activeTab === 'order' && (
            <section className="space-y-8">
              {/* Order Code */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-stone-900">訂單代碼</label>
                  {!isEditingOrderCode && (
                    <button
                      onClick={() => {
                        setIsEditingOrderCode(true);
                        setTempOrderCode(editedProduct.orderCode || '');
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      修改訂單代碼
                    </button>
                  )}
                </div>
                
                {isEditingOrderCode ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        maxLength={3}
                        value={tempOrderCode}
                        onChange={(e) => {
                          setOrderCodeError('');
                          setTempOrderCode(e.target.value.toUpperCase());
                        }}
                        placeholder="例如: HTF (3碼大寫英文字母)"
                        className={`flex-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${orderCodeError ? 'border-red-500' : 'border-stone-200'}`}
                      />
                      <button
                        onClick={handleConfirmOrderCode}
                        className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors"
                      >
                        確認修改
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingOrderCode(false);
                          setOrderCodeError('');
                        }}
                        className="px-6 py-3 bg-stone-200 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                    {orderCodeError && <p className="text-red-500 text-xs ml-1">{orderCodeError}</p>}
                    <p className="text-xs text-stone-500 ml-1">注意：修改訂單代碼可能會影響現有訂單的關聯，請謹慎操作。</p>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 font-mono font-bold">
                    {editedProduct.orderCode || '尚未設定'}
                  </div>
                )}
              </div>

              {/* Order Mode */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 mb-4">訂單模式</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => updateProductField('orderMode', 'FIXED')}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold bg-white ${editedProduct.orderMode === 'FIXED' ? 'border-primary text-primary' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editedProduct.orderMode === 'FIXED' ? 'border-primary' : 'border-stone-300'}`}>
                        {editedProduct.orderMode === 'FIXED' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      標價模式 (FIXED)
                    </button>
                    <button 
                      onClick={() => updateProductField('orderMode', 'INTERNAL_FORM')}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold bg-white ${editedProduct.orderMode === 'INTERNAL_FORM' ? 'border-primary text-primary' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editedProduct.orderMode === 'INTERNAL_FORM' ? 'border-primary' : 'border-stone-300'}`}>
                        {editedProduct.orderMode === 'INTERNAL_FORM' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      內部表單 (INTERNAL_FORM)
                    </button>
                    <button 
                      onClick={() => updateProductField('orderMode', 'EXTERNAL_LINK')}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold bg-white ${editedProduct.orderMode === 'EXTERNAL_LINK' ? 'border-primary text-primary' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-stone-200">
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

                  {/* Deposit Settings */}
                  <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">啟用訂金/尾款模式</h4>
                        <p className="text-xs text-stone-500 mt-1">開啟後結帳將拆分為應付訂金與尾款，關閉則為全額支付。</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={editedProduct.fixedConfig.enableDeposit || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            updateProductField('fixedConfig.enableDeposit', isChecked);
                            if (isChecked && !editedProduct.fixedConfig.depositRatio) {
                              updateProductField('fixedConfig.depositRatio', 30);
                              updateProductField('fixedConfig.balanceRatio', 70);
                            }
                            setDepositError('');
                          }}
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {editedProduct.fixedConfig.enableDeposit && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">訂金比例 (%)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={editedProduct.fixedConfig.depositRatio || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateProductField('fixedConfig.depositRatio', val);
                                setDepositError('');
                              }}
                              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none ${depositError ? 'border-red-500' : 'border-stone-200'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">尾款比例 (%)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={editedProduct.fixedConfig.balanceRatio || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateProductField('fixedConfig.balanceRatio', val);
                                setDepositError('');
                              }}
                              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none ${depositError ? 'border-red-500' : 'border-stone-200'}`}
                            />
                          </div>
                        </div>
                        {depositError && <p className="text-red-500 text-xs ml-1">{depositError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Field Toggles */}
                  <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
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
                        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">期望時段（＊必選，可多選：9:00~12:00、13:00~18:00）</span>
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
                </div>
              ) : editedProduct.orderMode === 'INTERNAL_FORM' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-2xl border border-stone-200">
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

                  {/* Deposit Settings */}
                  <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">啟用訂金/尾款模式</h4>
                        <p className="text-xs text-stone-500 mt-1">開啟後結帳將拆分為應付訂金與尾款，關閉則為全額支付。</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={editedProduct.internalFormConfig?.enableDeposit || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            updateProductField('internalFormConfig.enableDeposit', isChecked);
                            if (isChecked && !editedProduct.internalFormConfig?.depositRatio) {
                              updateProductField('internalFormConfig.depositRatio', 30);
                              updateProductField('internalFormConfig.balanceRatio', 70);
                            }
                            setDepositError('');
                          }}
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {editedProduct.internalFormConfig?.enableDeposit && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">訂金比例 (%)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={editedProduct.internalFormConfig.depositRatio || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateProductField('internalFormConfig.depositRatio', val);
                                setDepositError('');
                              }}
                              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none ${depositError ? 'border-red-500' : 'border-stone-200'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">尾款比例 (%)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={editedProduct.internalFormConfig.balanceRatio || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateProductField('internalFormConfig.balanceRatio', val);
                                setDepositError('');
                              }}
                              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none ${depositError ? 'border-red-500' : 'border-stone-200'}`}
                            />
                          </div>
                        </div>
                        {depositError && <p className="text-red-500 text-xs ml-1">{depositError}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-2xl border border-stone-200">
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

                  {/* Deposit Settings */}
                  <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">啟用訂金/尾款模式</h4>
                        <p className="text-xs text-stone-500 mt-1">開啟後結帳將拆分為應付訂金與尾款，關閉則為全額支付。</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={editedProduct.externalLinkConfig?.enableDeposit || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            updateProductField('externalLinkConfig.enableDeposit', isChecked);
                            if (isChecked && !editedProduct.externalLinkConfig?.depositRatio) {
                              updateProductField('externalLinkConfig.depositRatio', 30);
                              updateProductField('externalLinkConfig.balanceRatio', 70);
                            }
                            setDepositError('');
                          }}
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {editedProduct.externalLinkConfig?.enableDeposit && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">訂金比例 (%)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={editedProduct.externalLinkConfig.depositRatio || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateProductField('externalLinkConfig.depositRatio', val);
                                setDepositError('');
                              }}
                              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none ${depositError ? 'border-red-500' : 'border-stone-200'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2">尾款比例 (%)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={editedProduct.externalLinkConfig.balanceRatio || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateProductField('externalLinkConfig.balanceRatio', val);
                                setDepositError('');
                              }}
                              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none ${depositError ? 'border-red-500' : 'border-stone-200'}`}
                            />
                          </div>
                        </div>
                        {depositError && <p className="text-red-500 text-xs ml-1">{depositError}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Variants */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-stone-900">新增規格</h4>
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
                              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">價格 (NT$)</label>
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
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-200 transition-all"
          >
            取消
          </button>
          <SaveButton 
            onClick={handleSave}
            status={saveStatus}
            label="儲存產品資訊"
          />
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

  const handleAddProduct = async () => {
    const newProduct = await productService.create({ name: '新產品' });
    await loadProducts();
    setEditingProduct(newProduct);
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
          <h1 className="text-3xl font-bold text-stone-900 mb-2">產品管理</h1>
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
                      <AdminTable.Edit onClick={() => setEditingProduct(product)} />
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

      <AnimatePresence>
        {editingProduct && (
          <ProductEditModal 
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={loadProducts}
          />
        )}
      </AnimatePresence>

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
