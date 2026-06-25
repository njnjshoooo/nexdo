import React from 'react';
import { UseFormRegister, Control, Controller } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { ButtonConfig } from '../../types/admin';
import { FieldLabel, InputClass, InnerBlockContainer } from './ui/AdminEditorUI';

interface ButtonEditorProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
  label: string;
  forms: any[];
}

export default function ButtonEditor({ control, register, name, label, forms }: ButtonEditorProps) {
  return (
    <InnerBlockContainer className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-bold text-stone-900 text-sm tracking-tight">{label}</label>
        <Controller
          control={control}
          name={`${name}.isVisible`}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`p-2 rounded-lg transition-colors ${field.value ? 'text-primary hover:bg-stone-50' : 'text-stone-300 hover:bg-stone-50'}`}
            >
              {field.value ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel>按鈕文字</FieldLabel>
          <input {...register(`${name}.text`)} className={InputClass} />
        </div>
        <div>
          <FieldLabel>連結類型</FieldLabel>
          <select {...register(`${name}.type`)} className={InputClass}>
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
            <FieldLabel>
              {value === 'FORM' ? '選擇表單' : 'URL / 錨點'}
            </FieldLabel>
            {value === 'FORM' ? (
              <select {...register(`${name}.value`)} className={InputClass}>
                <option value="">請選擇表單...</option>
                {forms.map(form => <option key={form.id} value={form.id}>{form.name}</option>)}
              </select>
            ) : (
              <div className="space-y-3">
                <input {...register(`${name}.value`)} className={InputClass} placeholder="https://..." />
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register(`${name}.newTab`)} className="w-4 h-4 text-primary border-stone-300 rounded focus:ring-primary" id={`${name}.newTab`} />
                  <label htmlFor={`${name}.newTab`} className="text-sm font-bold text-stone-600 cursor-pointer user-select-none">點擊後跳出新分頁</label>
                </div>
              </div>
            )}
          </div>
        )}
      />
    </InnerBlockContainer>
  );
}
