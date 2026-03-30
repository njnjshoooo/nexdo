import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, ClipboardCheck, Eye } from 'lucide-react';
import { formService } from '../../services/formService';
import { Form, FormField, FormFieldType, FormFieldOption } from '../../types/form';
import { v4 as uuidv4 } from 'uuid';

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<Omit<Form, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    formId: '',
    description: '',
    purpose: 'CONSULTATION',
    fields: []
  });

  useEffect(() => {
    if (isEditing && id) {
      const existingForm = formService.getById(id);
      if (existingForm) {
        setForm(existingForm);
      } else {
        navigate('/admin/forms');
      }
    }
  }, [id, isEditing, navigate]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('請輸入表單名稱');
      return;
    }
    if (!(form as Form).formId?.trim()) {
      alert('請輸入表單 ID');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && id) {
        formService.update(id, form as any);
      } else {
        formService.create(form as any);
      }
      
      // Simulate delay for feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      alert('表單已儲存');
      navigate('/admin/forms');
    } catch (error: any) {
      alert(error.message || '儲存失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: uuidv4(),
      label: '新欄位',
      type: 'text',
      required: false
    };
    setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    }));
  };

  const removeField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === form.fields.length - 1)
    ) return;

    const newFields = [...form.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    setForm(prev => ({ ...prev, fields: newFields }));
  };

  const addOption = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => {
        if (f.id === fieldId) {
          const options = f.options || [];
          return {
            ...f,
            options: [...options, { id: uuidv4(), label: `選項 ${options.length + 1}`, value: `option_${options.length + 1}` }]
          };
        }
        return f;
      })
    }));
  };

  const updateOption = (fieldId: string, optionId: string, updates: Partial<FormFieldOption>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => {
        if (f.id === fieldId && f.options) {
          return {
            ...f,
            options: f.options.map(o => o.id === optionId ? { ...o, ...updates } : o)
          };
        }
        return f;
      })
    }));
  };

  const removeOption = (fieldId: string, optionId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => {
        if (f.id === fieldId && f.options) {
          return {
            ...f,
            options: f.options.filter(o => o.id !== optionId)
          };
        }
        return f;
      })
    }));
  };

  const renderFieldEditor = (field: FormField, index: number) => {
    return (
      <div key={field.id} className="bg-white border border-stone-200 rounded-xl p-6 mb-4 shadow-sm relative group">
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-stone-50 rounded-l-xl border-r border-stone-200">
          <button 
            onClick={() => moveField(index, 'up')}
            disabled={index === 0}
            className="p-1 text-stone-400 hover:text-primary disabled:opacity-30"
          >
            ↑
          </button>
          <GripVertical size={16} className="text-stone-300 my-2" />
          <button 
            onClick={() => moveField(index, 'down')}
            disabled={index === form.fields.length - 1}
            className="p-1 text-stone-400 hover:text-primary disabled:opacity-30"
          >
            ↓
          </button>
        </div>

        <div className="pl-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">欄位名稱 (標籤)</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="例如：姓名、聯絡電話"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">欄位類型</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value as FormFieldType })}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="text">單行文字</option>
                  <option value="textarea">多行文字</option>
                  <option value="radio">單選框</option>
                  <option value="checkbox">複選框</option>
                  <option value="select">下拉選單</option>
                  <option value="date">日期選擇器</option>
                  <option value="file">檔案上傳</option>
                  <option value="hidden">隱藏欄位</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => removeField(field.id)}
              className="ml-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="刪除欄位"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="w-4 h-4 text-primary rounded border-stone-300 focus:ring-primary"
              />
              <span className="text-sm text-stone-700">必填欄位</span>
            </label>
          </div>

          {/* Type specific settings */}
          {(field.type === 'text' || field.type === 'textarea') && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">提示文字 (Placeholder)</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="例如：請輸入您的姓名"
              />
            </div>
          )}

          {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') && (
            <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-stone-700">選項設定</label>
                <button
                  onClick={() => addOption(field.id)}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> 新增選項
                </button>
              </div>
              
              <div className="space-y-2">
                {(field.options || []).map((option, optIndex) => (
                  <div key={option.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(field.id, option.id, { label: e.target.value, value: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                      placeholder={`選項 ${optIndex + 1}`}
                    />
                    <button
                      onClick={() => removeOption(field.id, option.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(!field.options || field.options.length === 0) && (
                  <p className="text-sm text-stone-500 text-center py-2">尚未新增任何選項</p>
                )}
              </div>
            </div>
          )}

          {field.type === 'hidden' && (
            <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <label className="block text-sm font-medium text-stone-700 mb-2">隱藏欄位值來源</label>
              <select
                value={field.hiddenValueType || 'page_slug'}
                onChange={(e) => updateField(field.id, { hiddenValueType: e.target.value as any })}
                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-primary mb-3"
              >
                <option value="page_slug">自動抓取：當前頁面 Slug (網址路徑)</option>
                <option value="page_title">自動抓取：當前頁面標題 (Title)</option>
                <option value="custom">自訂固定值</option>
              </select>
              
              {field.hiddenValueType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">自訂值</label>
                  <input
                    type="text"
                    value={field.customHiddenValue || ''}
                    onChange={(e) => updateField(field.id, { customHiddenValue: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="輸入固定隱藏值"
                  />
                </div>
              )}
              <p className="text-xs text-stone-500 mt-2">
                隱藏欄位不會顯示在前端表單中，但會在送出時一併夾帶資料。這非常適合用來追蹤使用者是從哪個頁面送出表單的。
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/forms')}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-2xl font-bold text-stone-900">
            {isEditing ? '編輯表單' : '新增表單'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${isSaving ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
        >
          <Save size={20} />
          {isSaving ? '儲存中...' : '儲存表單'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic Settings */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
          <h2 className="text-lg font-bold text-stone-900 mb-6">基本設定</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                表單名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="例如：代租代管諮詢表單 (內部識別用)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                表單 ID (用於錨點跳轉與網址) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={(form as Form).formId || ''}
                  onChange={(e) => setForm({ ...form, formId: e.target.value.replace(/\s+/g, '-') } as any)}
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  placeholder="例如：home-consult"
                />
                {(form as Form).formId && (
                  <a
                    href={`/forms/${(form as Form).formId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors font-medium"
                    title="預覽表單頁面"
                  >
                    <Eye size={20} />
                  </a>
                )}
              </div>
              {(form as Form).formId && (
                <p className="text-xs text-stone-500 mt-2">
                  表單網址：<span className="font-mono text-primary">{window.location.origin}/forms/{(form as Form).formId}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                表單目的
              </label>
              <select
                value={form.purpose || 'CONSULTATION'}
                onChange={(e) => {
                  const newPurpose = e.target.value as 'CONSULTATION' | 'BOOKING';
                  const updates: any = { purpose: newPurpose };
                  
                  // If switching to BOOKING and fields are empty, populate defaults
                  if (newPurpose === 'BOOKING' && form.fields.length === 0) {
                    updates.fields = [
                      { id: uuidv4(), label: '姓名', type: 'text', required: true },
                      { id: uuidv4(), label: '聯絡電話', type: 'text', required: true },
                      { id: uuidv4(), label: '電子郵件', type: 'text', required: true },
                      { id: uuidv4(), label: '服務地址', type: 'text', required: true },
                      { id: uuidv4(), label: 'LINE ID', type: 'text', required: false, placeholder: '選填' }
                    ];
                  }
                  
                  setForm({ ...form, ...updates });
                }}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="CONSULTATION">諮詢</option>
                <option value="BOOKING">預約</option>
              </select>
              <p className="text-xs text-stone-500 mt-2">定義此表單的主要目的，可用於後續統計或分類。</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                表單描述
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                placeholder="簡短描述此表單的用途..."
              />
            </div>
          </div>
        </section>

        {/* Fields Management */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-stone-900">欄位管理</h2>
            <div className="flex gap-2">
              {form.purpose === 'BOOKING' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('確定要套用預約表單預設欄位嗎？這將會覆蓋現有的欄位。')) {
                      setForm({
                        ...form,
                        fields: [
                          { id: uuidv4(), label: '姓名', type: 'text', required: true },
                          { id: uuidv4(), label: '聯絡電話', type: 'text', required: true },
                          { id: uuidv4(), label: '電子郵件', type: 'text', required: true },
                          { id: uuidv4(), label: '服務地址', type: 'text', required: true },
                          { id: uuidv4(), label: 'LINE ID', type: 'text', required: false, placeholder: '選填' }
                        ]
                      });
                    }
                  }}
                  className="flex items-center gap-2 text-stone-600 hover:text-stone-800 font-medium bg-stone-100 px-4 py-2 rounded-lg transition-colors"
                >
                  <ClipboardCheck size={20} />
                  套用預約範本
                </button>
              )}
              <button
                onClick={addField}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium bg-primary/10 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
                新增欄位
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {form.fields.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <GripVertical size={32} />
                </div>
                <h3 className="text-lg font-medium text-stone-900 mb-2">尚未新增任何欄位</h3>
                <p className="text-stone-500 mb-6">點擊上方按鈕開始建立表單欄位</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={addField}
                    className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    <Plus size={20} />
                    新增第一個欄位
                  </button>
                  {form.purpose === 'BOOKING' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          fields: [
                            { id: uuidv4(), label: '姓名', type: 'text', required: true },
                            { id: uuidv4(), label: '聯絡電話', type: 'text', required: true },
                            { id: uuidv4(), label: '電子郵件', type: 'text', required: true },
                            { id: uuidv4(), label: '服務地址', type: 'text', required: true },
                            { id: uuidv4(), label: 'LINE ID', type: 'text', required: false, placeholder: '選填' }
                          ]
                        });
                      }}
                      className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 px-6 py-2.5 rounded-lg hover:bg-stone-200 transition-colors border border-stone-200"
                    >
                      <ClipboardCheck size={20} />
                      套用預約範本
                    </button>
                  )}
                </div>
              </div>
            ) : (
              form.fields.map((field, index) => renderFieldEditor(field, index))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
