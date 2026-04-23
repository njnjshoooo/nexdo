import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';
import { motion, Reorder } from 'motion/react';

interface MultiImageUploaderProps {
  values?: string[];
  onChange: (values: string[]) => void;
  className?: string;
  maxImages?: number;
}

export default function MultiImageUploader({ 
  values = [], 
  onChange, 
  className = '',
  maxImages = 10
}: MultiImageUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const handleAdd = (url: string) => {
    if (values.length < maxImages) {
      onChange([...values, url]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Reorder.Group 
        axis="y" 
        values={values} 
        onReorder={onChange}
        className="space-y-2"
      >
        {values.map((url, index) => (
          <Reorder.Item 
            key={url + index} 
            value={url}
            className="flex items-center gap-3 p-2 bg-white border border-stone-200 rounded-xl group"
          >
            <div className="cursor-grab active:cursor-grabbing text-stone-300">
              <GripVertical size={20} />
            </div>
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
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
              onClick={() => handleRemove(index)}
              className="p-2 text-stone-300 hover:text-red-500 transition-colors"
              title="移除圖片"
            >
              <Trash2 size={18} />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {values.length < maxImages && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
        >
          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
            <Plus size={20} />
          </div>
          <span className="text-sm font-bold">新增圖片 ({values.length}/{maxImages})</span>
        </button>
      )}

      <MediaLibraryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        multiple={true}
        onSelect={() => {}} // Not used when multiple is true
        onSelectMultiple={(urls) => {
          const newValues = [...values];
          urls.forEach(url => {
            if (!newValues.includes(url) && newValues.length < maxImages) {
              newValues.push(url);
            }
          });
          onChange(newValues);
          setIsModalOpen(false);
        }} 
      />
    </div>
  );
}
