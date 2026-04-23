import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, Loader2, Plus } from 'lucide-react';
import { mediaService } from '../../services/mediaService';
import { motion, Reorder } from 'motion/react';

interface FormMultiImageUploaderProps {
  value?: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
  maxImages?: number;
}

export default function FormMultiImageUploader({ 
  value = [], 
  onChange, 
  className = '', 
  placeholder = '點擊或拖曳檔案至此上傳',
  maxImages = 10
}: FormMultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max images
    if (value.length + files.length > maxImages) {
      alert(`最多只能上傳 ${maxImages} 張照片`);
      return;
    }

    setUploading(true);
    try {
      const results = await Promise.all(files.map(file => mediaService.upload(file, 'customer')));
      const urls = results.map(r => r.url);
      onChange([...value, ...urls]);
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

  const handleRemove = (index: number) => {
    const newValues = [...value];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {value.length > 0 && (
        <Reorder.Group 
          axis="y" 
          values={value} 
          onReorder={onChange}
          className="space-y-2"
        >
          {value.map((url, index) => (
            <Reorder.Item 
              key={url + index} 
              value={url}
              className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl group"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-200">
                <img 
                  src={url} 
                  alt={`Image ${index + 1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-400 truncate">{url}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                title="移除圖片"
              >
                <Trash2 size={18} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {value.length < maxImages && (
        <div 
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative group w-full h-32 border-2 border-dashed rounded-xl 
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
            multiple
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
                  <Plus size={20} />
                </div>
                <p className="text-sm text-stone-500 font-medium group-hover:text-primary transition-colors">
                  {placeholder}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">支援 JPG, PNG (最多 {maxImages} 張)</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
