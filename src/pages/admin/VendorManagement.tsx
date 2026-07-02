import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';
import { Plus, Search, Edit2, Trash2, X, Upload, Briefcase } from 'lucide-react';
import { Vendor } from '../../types/vendor';
import { vendorService } from '../../services/vendorService';
import ImageUploader from '../../components/admin/ImageUploader';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import { Pagination } from '../../components/ui/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';

export default function VendorManagement() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(() => vendorService.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setVendors(vendorService.getAll());
    
    const handleStorage = () => {
      setVendors(vendorService.getAll());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveVendors = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    vendorService.saveAll(newVendors);
  };

  const handleDelete = (id: string) => {
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
      setVendorToDelete(vendor);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await vendorService.delete(vendorToDelete.id);
      setVendors(vendors.filter(v => v.id !== vendorToDelete.id));
      setShowDeleteConfirm(false);
      setVendorToDelete(null);
    } catch (error: any) {
      alert(error.message || '刪除失敗');
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.taxId.includes(searchTerm) ||
    v.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success" icon="check" text="合作中" />;
      case 'suspended':
        return <StatusBadge status="error" icon="cross" text="停權中" />;
      case 'reviewing':
        return <StatusBadge status="warning" text="審核中" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <PageMainTitle className="!text-3xl mb-2">廠商管理</PageMainTitle>
          <p className="text-stone-500">管理所有合作廠商資訊與狀態</p>
        </div>
        <button
          onClick={() => navigate('/admin/vendors/new')}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          新增廠商資訊
        </button>
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋廠商名稱、統編或聯絡人..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>廠商名稱</AdminTable.Th>
              <AdminTable.Th>統一編號</AdminTable.Th>
              <AdminTable.Th>廠商類型</AdminTable.Th>
              <AdminTable.Th>聯絡人</AdminTable.Th>
              <AdminTable.Th>聯絡人電話</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {paginatedVendors.map((vendor) => (
              <AdminTable.Row key={vendor.id}>
                <AdminTable.Td>
                  <div className="font-medium text-stone-900">{vendor.name}</div>
                  <div className="text-xs text-stone-500">ID: {vendor.id}</div>
                </AdminTable.Td>
                <AdminTable.Td className="text-stone-600">{vendor.taxId}</AdminTable.Td>
                <AdminTable.Td className="text-stone-600">{vendor.type}</AdminTable.Td>
                <AdminTable.Td>
                  <div className="text-stone-900">{vendor.contactName}</div>
                  <div className="text-xs text-stone-500">{vendor.jobTitle}</div>
                </AdminTable.Td>
                <AdminTable.Td className="text-stone-600">
                  {vendor.phone}{vendor.extension ? ` #${vendor.extension}` : ''}
                </AdminTable.Td>
                <AdminTable.Td>{getStatusBadge(vendor.status)}</AdminTable.Td>
                <AdminTable.Td className="text-right">
                  <AdminTable.Actions>
                    <AdminTable.Edit onClick={() => navigate(`/admin/vendors/${vendor.id}`)} />
                    <AdminTable.Delete onClick={() => handleDelete(vendor.id)} />
                  </AdminTable.Actions>
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {paginatedVendors.length === 0 && (
              <AdminTable.Empty colSpan={7}>
                找不到符合的廠商
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center gap-3 text-red-600">
              <Trash2 size={24} />
              <h2 className="text-xl font-bold">確認刪除廠商</h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 mb-2">
                您確定要刪除此廠商嗎？
              </p>
              <p className="text-sm text-stone-400">
                此動作將會移除該廠商的所有資訊，且無法復原。
              </p>
              {vendorToDelete && (
                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">廠商名稱</p>
                  <p className="text-stone-800 font-bold">{vendorToDelete.name}</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setVendorToDelete(null);
                }}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-sm"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
