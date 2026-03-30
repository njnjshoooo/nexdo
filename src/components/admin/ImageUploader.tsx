import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function ImageUploader({ value, onChange, className = '', placeholder = '點擊上傳或選擇圖片' }: ImageUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`relative group ${className}`}>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`
          w-full aspect-video rounded-xl border-2 border-dashed 
          flex flex-col items-center justify-center 
          overflow-hidden cursor-pointer transition-all duration-200
          ${value 
            ? 'border-transparent bg-stone-50 hover:border-primary/50' 
            : 'border-stone-300 bg-stone-50 hover:border-primary hover:bg-stone-100'
          }
        `}
      >
        {value ? (
          <>
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                更換圖片
              </span>
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-white/90 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
              title="移除圖片"
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-400 group-hover:text-primary group-hover:bg-white transition-colors">
              <ImageIcon size={24} />
            </div>
            <p className="text-sm text-stone-500 font-medium group-hover:text-primary transition-colors">
              {placeholder}
            </p>
            <p className="text-xs text-stone-400 mt-1">支援 JPG, PNG, GIF</p>
          </div>
        )}
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-2 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-900 transition-colors"
      >
        {value ? '更換圖片' : '上傳圖片'}
      </button>

      <MediaLibraryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={(url) => {
          onChange(url);
          setIsModalOpen(false);
        }} 
      />
    </div>
  );
}
