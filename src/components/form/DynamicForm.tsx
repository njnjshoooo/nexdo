import React, { useState, useEffect } from 'react';
import { Form, FormField } from '../../types/form';
import { Upload, CheckCircle2 } from 'lucide-react';
import { submissionService } from '../../services/submissionService';
import { useAuth } from '../../contexts/AuthContext';
import FormMultiImageUploader from './FormMultiImageUploader';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';

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

  // Calculate min date (today + 4 days)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 4);
    return minDate.toISOString().split('T')[0];
  };

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
      // 2. Initialize checkboxes and multi-file as arrays
      else if (field.type === 'checkbox' || (field.type === 'file' && field.multiple)) {
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
    const minDate = getMinDate();
    const preferredDates: string[] = [];

    form.fields.forEach(field => {
      const value = formData[field.id];
      
      if (field.required && field.type !== 'hidden') {
        if (field.type === 'checkbox') {
          if (!value || value.length === 0) {
            newErrors[field.id] = '此欄位為必填';
          }
        } else if (field.type === 'file') {
          if (field.multiple) {
            if (!value || value.length === 0) {
              newErrors[field.id] = '請上傳照片';
            }
          } else if (!value) {
            newErrors[field.id] = '請上傳檔案';
          }
        } else {
          if (!value || String(value).trim() === '') {
            newErrors[field.id] = '此欄位為必填';
          }
        }
      }

      // Additional validation for "期望日期"
      if (field.type === 'date' && field.label.includes('期望日期') && value) {
        if (value < minDate) {
          newErrors[field.id] = '請選擇 4 天後的日期';
        }
        preferredDates.push(value);
      }
    });

    // Mutual exclusion for preferred dates
    if (preferredDates.length > 1) {
      const uniqueDates = new Set(preferredDates);
      if (uniqueDates.size !== preferredDates.length) {
        // Find which fields have duplicate values
        form.fields.forEach(field => {
          if (field.type === 'date' && field.label.includes('期望日期')) {
            const val = formData[field.id];
            if (val && preferredDates.filter(d => d === val).length > 1) {
              newErrors[field.id] = '期望日期不可重複';
            }
          }
        });
      }
    }

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
        <Label>
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </Label>

        {field.type === 'text' && (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={!!error}
          />
        )}

        {field.type === 'textarea' && (
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            error={!!error}
          />
        )}

        {field.type === 'select' && (
          <Select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
          >
            <option value="" disabled>請選擇</option>
            {(field.options || []).map(opt => (
              <option key={opt.id} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
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
          <div className="space-y-1">
            <Input
              type="date"
              value={value}
              min={field.label.includes('期望日期') ? getMinDate() : undefined}
              onChange={(e) => handleChange(field.id, e.target.value)}
              error={!!error}
            />
            {field.label.includes('期望日期') && (
              <p className="text-[10px] text-stone-400">* 為確保媒合品質，請選擇 4 天後的日期</p>
            )}
          </div>
        )}

        {field.type === 'file' && (
          <div>
            {field.multiple ? (
              <FormMultiImageUploader 
                value={value || []}
                onChange={(urls) => handleChange(field.id, urls)}
                placeholder={field.placeholder || '點擊或拖曳照片至此上傳'}
              />
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                error ? 'border-red-500 bg-red-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-primary'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-stone-400 mb-2" />
                  <p className="text-sm text-stone-500">
                    {value instanceof File ? value.name : (typeof value === 'string' && value ? '已上傳檔案' : '點擊或拖曳檔案至此上傳')}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(field.id, e)}
                  accept="image/*"
                />
              </label>
            )}
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
          
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-6 text-lg mt-8"
          >
            {isSubmitting ? '處理中...' : '送出表單'}
          </Button>
          <p className="mt-4 text-center tracking-wider text-sm text-stone-500 font-medium">
            將有專人立即為您服務
          </p>
        </form>
      )}
    </section>
  );
}