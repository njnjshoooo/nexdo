import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, Filter, Calendar, Info } from 'lucide-react';
import { mediaService, MediaItem } from '../../services/mediaService';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import CreateButton from '../../components/admin/CreateButton';
import { Pagination } from '../../components/ui/Pagination';

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // 6 columns * 4 rows

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const allMedia = await mediaService.getAll();
    setMedia(allMedia.filter(m => m.source === 'admin' || m.id.startsWith('default-')));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      const inputEl = e.target;
      try {
        const files = Array.from(e.target.files);
        // 並行上傳所有檔案，加快多檔速度。allSettled 讓單檔失敗不會中斷其他
        const results = await Promise.allSettled(
          files.map(file => mediaService.upload(file, 'admin'))
        );
        const failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
        if (failed.length > 0) {
          const msg = failed
            .map(f => f.reason instanceof Error ? f.reason.message : String(f.reason))
            .join('\n');
          alert(`部分上傳失敗 (${failed.length}/${files.length})：\n${msg}`);
        }
        await loadMedia();
      } catch (error) {
        console.error('Upload failed', error);
        alert(`上傳失敗：${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setUploading(false);
        // 清空 input value 讓使用者可以再次選同一個檔案重新上傳
        inputEl.value = '';
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await mediaService.delete(id);
      if (selectedItem?.id === id) setSelectedItem(null);
      await loadMedia();
    } catch (error) {
      alert(`刪除失敗：${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const filteredMedia = media.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            媒體庫
          </h1>
          <p className="text-stone-500 mt-1">管理網站所有的圖片與檔案</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateButton
            text={uploading ? '上傳中...' : '上傳檔案'}
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          />
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            multiple 
            onChange={handleUpload} 
            className="hidden" 
            disabled={uploading} 
          />
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-stone-100 flex items-center gap-4 bg-stone-50/50">
            <AdminSearchInput
              placeholder="搜尋檔案名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md"
            />
            <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors">
              <Filter size={20} />
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 flex-1 content-start">
              {paginatedMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    selectedItem?.id === item.id 
                      ? 'ring-2 ring-primary border-transparent shadow-lg' 
                      : 'border-stone-200 hover:border-primary hover:shadow-md'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 transition-colors ${
                    selectedItem?.id === item.id ? 'bg-primary/5' : 'group-hover:bg-black/5'
                  }`} />
                  
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity font-medium text-stone-600">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center shrink-0">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-stone-200 p-6 overflow-y-auto hidden lg:block sticky top-8 self-start max-h-[calc(100vh-4rem)]">
          {selectedItem ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-stone-900 flex items-center gap-2">
                <Info size={18} className="text-primary" />
                檔案詳情
              </h3>
              
              <div className="aspect-square rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">名稱</label>
                  <p className="text-sm font-medium text-stone-800 break-all">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">類型</label>
                  <p className="text-sm font-medium text-stone-800">{selectedItem.type}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">上傳日期</label>
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-800">
                    <Calendar size={14} className="text-stone-400" />
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">網址</label>
                  <div className="mt-1 flex gap-2">
                    <input 
                      readOnly 
                      value={selectedItem.url} 
                      className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedItem.url);
                        alert('已複製網址');
                      }}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      複製
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(selectedItem.id, e as any)}
                className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                刪除此檔案
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center space-y-4">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                <ImageIcon size={32} />
              </div>
              <p className="text-sm">點擊圖片查看詳細資訊</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
