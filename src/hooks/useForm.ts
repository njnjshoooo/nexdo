import { useState, useEffect } from 'react';
import { formService } from '../services/formService';
import { Form } from '../types/form';

export function useForm(id?: string | null): Form | null {
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (!id) {
      setForm(null);
      return;
    }

    let isMounted = true;

    const loadForm = async () => {
      let f = formService.getById(id) || formService.getByFormId(id);
      
      if (!f) {
        await formService.refresh();
        f = formService.getById(id) || formService.getByFormId(id);
      }
      
      if (isMounted) {
        setForm(f || null);
      }
    };

    loadForm();

    const handleRefresh = () => {
      if (!isMounted) return;
      const f = formService.getById(id) || formService.getByFormId(id);
      setForm(f || null);
    };

    window.addEventListener('forms_refreshed', handleRefresh);
    
    return () => {
      isMounted = false;
      window.removeEventListener('forms_refreshed', handleRefresh);
    };
  }, [id]);

  return form;
}
