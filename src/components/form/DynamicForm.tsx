import React, { useState, useEffect } from 'react';
import { Form, FormField } from '../../types/form';
import { Upload } from 'lucide-react';
import { submissionService } from '../../services/submissionService';
import { useAuth } from '../../contexts/AuthContext';

interface DynamicFormProps {
  form: Form;
  pageSlug?: string;
  pageTitle?: string;
  onSubmit?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export default function DynamicForm({ form, pageSlug = '', pageTitle = '', onSubmit, initialData: propInitialData }: DynamicFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize hidden fields and pre-fill user data
  useEffect(() => {
    const initialData: Record<string, any> = { ...propInitialData };
    form.fields.forEach(field => {
      // 1. Handle hidden fields
      if (field.type === 'hidden') {
        if (field.hiddenValueType === 'page_slug') {
          initialData[field.id] = pageSlug;
        } else if (field.hiddenValueType === 'page_title') {
          initialData[field.id] = pageTitle;
        } else if (field.hiddenValueType === 'custom') {
          initialData[field.id] = field.customHiddenValue || '';
        }
      } 
      // 2. Initialize checkboxes as arrays
      else if (field.type === 'checkbox') {
        initialData[field.id] = [];
      }
      
      // 3. Pre-fill user data if available
      if (user) {
        // Try to match by field ID
        if (field.id === 'name' && user.name) initialData[field.id] = user.name;
        if (field.id === 'phone' && user.phone) initialData[field.id] = user.phone;
        if (field.id === 'email' && user.email) initialData[field.id] = user.email;
        if (field.id === 'address' && user.address) initialData[field.id] = user.address;
        if (field.id === 'lineId' && user.lineId) initialData[field.id] = user.lineId;
        
        // Also try to match by common labels if ID doesn't match
        const label = field.label.toLowerCase();
        if (!initialData[field.id]) {
          if (label.includes('姓名') && user.name) initialData[field.id] = user.name;
          if ((label.includes('電話') || label.includes('手機')) && user.phone) initialData[field.id] = user.phone;
          if (label.includes('email') && user.email) initialData[field.id] = user.email;
          if (label.includes('地址') && user.address) initialData[field.id] = user.address;
          if (label.includes('line') && user.lineId) initialData[field.id] = user.lineId;
        }
      }
    });
    setFormData(prev => ({ ...prev, ...initialData }));
  }, [form, pageSlug, pageTitle, user, propInitialData]);

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user types
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (fieldId: string, optionValue: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...currentValues, optionValue] };
      } else {
        return { ...prev, [fieldId]: currentValues.filter((v: string) => v !== optionValue) };
      }
    });
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleFileChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange(fieldId, file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    form.fields.forEach(field => {
      if (field.required && field.type !== 'hidden') {
        const value = formData[field.id];
        if (field.type === 'checkbox') {
          if (!value || value.length === 0) {
            newErrors[field.id] = '此欄位為必填';
          }
        } else if (field.type === 'file') {
          if (!value) {
            newErrors[field.id] = '請上傳檔案';
          }
        } else {
          if (!value || String(value).trim() === '') {
            newErrors[field.id] = '此欄位為必填';
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      // Save submission
      await submissionService.create({
        formId: form.id,
        userId: user?.id, // Include userId if available
        pageSlug,
        pageTitle,
        data: formData
      });
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setIsSuccess(true);
      // Reset form (except hidden fields)
      const resetData: Record<string, any> = {};
      form.fields.forEach(field => {
        if (field.type === 'hidden') {
          resetData[field.id] = formData[field.id];
        } else if (field.type === 'checkbox') {
          resetData[field.id] = [];
        } else {
          resetData[field.id] = '';
        }
      });
      setFormData(resetData);
      
      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('送出失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    if (field.type === 'hidden') return null;

    const error = errors[field.id];
    const value = formData[field.id] || '';

    return (
      <div key={field.id} className="mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>

        {field.type === 'text' && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
              error ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-primary'
            }`}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`w-full px-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none ${
              error ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-primary'
            }`}
          />
        )}

        {field.type === 'select' && (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={`w-full px-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors appearance-none ${
                error ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-primary'
              }`}
            >
              <option value="" disabled>請選擇</option>
              {(field.options || []).map(opt => (
                <option key={opt.id} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}

        {field.type === 'radio' && (
          <div className="space-y-3">
            {(field.options || []).map(opt => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  value === opt.value ? 'border-primary bg-primary' : 'border-stone-300 group-hover:border-primary'
                }`}>
                  {value === opt.value && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="hidden"
                />
                <span className="text-stone-700">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && (
          <div className="space-y-3">
            {(field.options || []).map(opt => {
              const isChecked = (formData[field.id] || []).includes(opt.value);
              return (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    isChecked ? 'border-primary bg-primary' : 'border-stone-300 group-hover:border-primary'
                  }`}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.5L3.5 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(field.id, opt.value, e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-stone-700">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {field.type === 'date' && (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`w-full px-4 py-3 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
              error ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-primary'
            }`}
          />
        )}

        {field.type === 'file' && (
          <div>
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              error ? 'border-red-500 bg-red-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-primary'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <p className="text-sm text-stone-500">
                  {value ? (value as File).name : '點擊或拖曳檔案至此上傳'}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(field.id, e)}
                accept="image/*"
              />
            </label>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  return (
    <section 
      id={form.formId} 
      style={{ scrollMarginTop: '100px' }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100"
    >
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-stone-900 mb-2">{form.name}</h3>
        {form.description && (
          <p className="text-stone-600">{form.description}</p>
        )}
      </div>

      {isSuccess ? (
        <div className="bg-green-50 text-green-800 p-6 rounded-xl text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4 className="text-lg font-bold mb-2">收到您的預約了！</h4>
          <p>好鄰居會儘速與您聯繫</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {form.fields.map(renderField)}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-8"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                處理中...
              </>
            ) : (
              '送出表單'
            )}
          </button>
        </form>
      )}
    </section>
  );
}