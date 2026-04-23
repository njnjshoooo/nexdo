import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { mediaService } from '../../services/mediaService';

interface VendorImageUploaderProps {
  value?: string | string[];
  onChange: (value: any) => void;
  className?: string;
  placeholder?: string;
  label?: string;
  aspectRatio?: 'square' | 'video';
  multiple?: boolean;
}

export default function VendorImageUploader({ 
  value, 
  onChange, 
  className = '', 
  placeholder = '點擊上傳大頭照',
  label = '上傳大頭照',
  aspectRatio = 'square',
  multiple = false
}: VendorImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.all(files.map(file => mediaService.upload(file, 'vendor')));
      const urls = results.map(r => r.url);
      
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
        onChange([...currentValues, ...urls]);
      } else {
        onChange(urls[0]);
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('圖片上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent, index?: number) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValues = [...value];
      newValues.splice(index!, 1);
      onChange(newValues);
    } else {
      onChange('');
    }
  };

  const values = multiple ? (Array.isArray(value) ? value : (value ? [value] : [])) : (value ? [value as string] : []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-bold text-stone-700">{label}</label>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {values.map((url, index) => (
          <div 
            key={index}
            className={`relative group w-full ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'} rounded-2xl border-2 border-transparent overflow-hidden`}
          >
            <img 
              src={url} 
              alt={`Preview ${index}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => handleRemove(e, index)}
                className="p-2 bg-white/90 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm transition-all"
                title="移除圖片"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {(multiple || values.length === 0) && (
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative group w-full ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'} rounded-2xl border-2 border-dashed 
              flex flex-col items-center justify-center 
              overflow-hidden cursor-pointer transition-all duration-200
              border-stone-300 bg-stone-50 hover:border-primary hover:bg-stone-100
              ${uploading ? 'cursor-not-allowed opacity-70' : ''}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple={multiple}
              className="hidden"
            />

            <div className="text-center p-4">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 size={24} className="text-primary animate-spin mb-2" />
                  <p className="text-xs text-stone-500 font-medium">上傳中...</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400 group-hover:text-primary group-hover:bg-white transition-colors">
                    <Upload size={20} />
                  </div>
                  <p className="text-xs text-stone-500 font-medium group-hover:text-primary transition-colors">
                    {placeholder}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
