import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formService } from '../services/formService';
import { Form } from '../types/form';
import DynamicForm from '../components/form/DynamicForm';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FormPage() {
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    console.log('FormPage: formId from params:', formId);
    if (formId) {
      // Try to find by formId (slug) first, then by internal id
      let foundForm = formService.getByFormId(formId);
      if (!foundForm) {
        foundForm = formService.getById(formId);
      }
      console.log('FormPage: foundForm:', foundForm);
      setForm(foundForm || null);
    }
    setLoading(false);
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">找不到此表單</h1>
          <p className="text-stone-600 mb-8">抱歉，您所連結的表單可能已移除或網址不正確。</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-bold"
          >
            <Home size={20} />
            回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            返回首頁
          </Link>
        </div>

        <DynamicForm 
          form={form} 
          pageSlug={`/forms/${formId}`}
          pageTitle={form.name}
          initialData={{
            name: currentUser?.name || '',
            phone: currentUser?.phone || ''
          }}
        />
      </div>
    </div>
  );
}
