import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { mediaService, MediaItem } from '../../services/mediaService';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setMedia(await mediaService.getAll());
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        await mediaService.upload(e.target.files[0]);
        await loadMedia();
      } catch (error) {
        console.error('Upload failed', error);
        alert('上傳失敗');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await mediaService.delete(id);
    await loadMedia();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="text-primary" />
            媒體庫
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={24} className="text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Upload Button */}
            <label className="aspect-square border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group relative">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white transition-colors">
                <Upload size={24} className="text-stone-400 group-hover:text-primary" />
              </div>
              <span className="text-sm font-medium text-stone-500 group-hover:text-primary">
                {uploading ? '上傳中...' : '上傳圖片'}
              </span>
            </label>

            {/* Media Items */}
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.url);
                  onClose();
                }}
                className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-white cursor-pointer hover:ring-2 hover:ring-primary hover:shadow-md transition-all"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm"
                  title="刪除圖片"
                >
                  <Trash2 size={14} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
