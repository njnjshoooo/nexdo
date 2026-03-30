import React from 'react';
import { UseFormRegister, Control, Controller } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { ButtonConfig } from '../../types/admin';

interface ButtonEditorProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
  label: string;
  forms: any[];
}

export default function ButtonEditor({ control, register, name, label, forms }: ButtonEditorProps) {
  return (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-bold text-stone-700">{label}</label>
        <Controller
          control={control}
          name={`${name}.isVisible`}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`p-2 rounded-lg transition-colors ${field.value ? 'text-stone-600 hover:bg-stone-200' : 'text-stone-400 hover:bg-stone-200'}`}
            >
              {field.value ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">按鈕文字</label>
          <input {...register(`${name}.text`)} className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">連結類型</label>
          <select {...register(`${name}.type`)} className="w-full px-3 py-2 border border-stone-300 rounded-lg">
            <option value="FORM">表單</option>
            <option value="URL">外部網址</option>
          </select>
        </div>
      </div>
      
      <Controller
        control={control}
        name={`${name}.type`}
        render={({ field: { value } }) => (
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">
              {value === 'FORM' ? '選擇表單' : 'URL / 錨點'}
            </label>
            {value === 'FORM' ? (
              <select {...register(`${name}.value`)} className="w-full px-3 py-2 border border-stone-300 rounded-lg">
                <option value="">請選擇表單...</option>
                {forms.map(form => <option key={form.id} value={form.id}>{form.name}</option>)}
              </select>
            ) : (
              <input {...register(`${name}.value`)} className="w-full px-3 py-2 border border-stone-300 rounded-lg" placeholder="https://..." />
            )}
          </div>
        )}
      />
    </div>
  );
}
