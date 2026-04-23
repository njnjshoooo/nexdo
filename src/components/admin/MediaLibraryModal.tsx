import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { mediaService, MediaItem } from '../../services/mediaService';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/Modal';
import { Button } from '../ui/Button';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  multiple?: boolean;
}

export default function MediaLibraryModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  onSelectMultiple,
  multiple = false 
}: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedUrls([]);
    }
  }, [isOpen]);

  const loadMedia = async () => {
    const allMedia = await mediaService.getAll();
    setMedia(allMedia.filter(m => m.source === 'admin' || m.id.startsWith('default-')));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      try {
        const uploadPromises = Array.from(e.target.files).map(file => mediaService.upload(file, 'admin'));
        await Promise.all(uploadPromises);
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

  const handleConfirmSelection = () => {
    if (multiple && onSelectMultiple) {
      onSelectMultiple(selectedUrls);
    } else if (selectedUrls.length > 0) {
      onSelect(selectedUrls[0]);
    }
    onClose();
  };

  const toggleSelection = (url: string) => {
    if (multiple) {
      setSelectedUrls(prev => 
        prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
      );
    } else {
      onSelect(url);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-4 w-full">
          <ModalTitle className="flex items-center gap-2">
            <ImageIcon className="text-primary" />
            媒體庫
          </ModalTitle>
          {multiple && selectedUrls.length > 0 && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold animate-in zoom-in duration-200">
              已選擇 {selectedUrls.length} 張
            </span>
          )}
          <div className="flex-grow" />
          {multiple && (
            <Button 
              onClick={handleConfirmSelection}
              disabled={selectedUrls.length === 0}
              size="sm"
            >
              確認選擇
            </Button>
          )}
        </div>
      </ModalHeader>

      <ModalContent className="p-6 bg-stone-50 h-[60vh]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Upload Button */}
          <label className="aspect-square border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group relative">
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white transition-colors">
              <Upload size={24} className="text-stone-400 group-hover:text-primary" />
            </div>
            <span className="text-sm font-medium text-stone-500 group-hover:text-primary">
              {uploading ? '上傳中...' : '上傳圖片'}
            </span>
          </label>

          {/* Media Items */}
          {media.map((item) => {
            const isSelected = selectedUrls.includes(item.url);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelection(item.url)}
                className={`
                  group relative aspect-square rounded-xl overflow-hidden border bg-white cursor-pointer transition-all
                  ${isSelected 
                    ? 'ring-4 ring-primary border-transparent shadow-lg scale-[0.98]' 
                    : 'border-stone-200 hover:ring-2 hover:ring-primary/50 hover:shadow-md'
                  }
                `}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-primary/10' : 'bg-black/0 group-hover:bg-black/10'}`} />
                
                {/* Selection Indicator */}
                {multiple && (
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white/50 border-white text-transparent'}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                )}

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
            );
          })}
        </div>
      </ModalContent>
    </Modal>
  );
}
