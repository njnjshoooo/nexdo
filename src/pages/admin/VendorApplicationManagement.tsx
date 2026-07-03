import React, { useState, useEffect } from 'react';
import { vendorApplicationService } from '../../services/vendorApplicationService';
import { VendorApplication } from '../../types/vendor';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';
import AdminTable from '../../components/admin/AdminTable';
import AdminSearchBar from '../../components/admin/search/AdminSearchBar';
import AdminSearchInput from '../../components/admin/search/AdminSearchInput';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { Eye } from 'lucide-react';

export default function VendorApplicationManagement() {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusToSet, setStatusToSet] = useState<'approved' | 'rejected'>('approved');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      const data = await vendorApplicationService.syncFromSupabase();
      setApplications(data);
      setLoading(false);
    };
    fetchApplications();
  }, []);

  const handleUpdateStatus = (app: VendorApplication, status: 'approved' | 'rejected') => {
    setSelectedApplication(app);
    setStatusToSet(status);
    setShowStatusModal(true);
  };

  const handleView = (app: VendorApplication) => {
    setSelectedApplication(app);
    setShowViewModal(true);
  };

  const confirmUpdateStatus = async () => {
    if (!selectedApplication) return;
    setIsUpdating(true);
    try {
      await vendorApplicationService.updateStatus(selectedApplication.id, statusToSet);
      setApplications(apps => 
        apps.map(a => a.id === selectedApplication.id ? { ...a, status: statusToSet } : a)
      );
      setShowStatusModal(false);
      setShowViewModal(false);
    } catch (error: any) {
      alert(error.message || '狀態更新失敗');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApplications = applications.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.taxId.includes(searchTerm) ||
    a.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">載入中...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <PageMainTitle className="!text-3xl mb-2">廠商加盟申請</PageMainTitle>
          <p className="text-stone-500">檢視與審核所有廠商送出的加盟申請</p>
        </div>
      </div>

      <AdminSearchBar>
        <AdminSearchInput
          placeholder="搜尋名稱、統編、聯絡人或信箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </AdminSearchBar>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>申請日期</AdminTable.Th>
              <AdminTable.Th>廠商名稱 / 統編</AdminTable.Th>
              <AdminTable.Th>聯絡人 / 職稱</AdminTable.Th>
              <AdminTable.Th>聯絡資訊</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {filteredApplications.length > 0 ? (
              filteredApplications.map(app => (
                <AdminTable.Row key={app.id}>
                  <AdminTable.Td className="whitespace-nowrap text-stone-500 text-sm">
                    {new Date(app.createdAt).toLocaleDateString('zh-TW')}
                  </AdminTable.Td>
                  <AdminTable.Td>
                    <div className="font-medium text-stone-900">{app.name}</div>
                    <div className="text-sm text-stone-500">統編: {app.taxId}</div>
                  </AdminTable.Td>
                  <AdminTable.Td>
                    <div className="text-stone-900">{app.contactName}</div>
                    <div className="text-sm text-stone-500">{app.jobTitle}</div>
                  </AdminTable.Td>
                  <AdminTable.Td>
                    <div className="text-stone-900">{app.phone}{app.extension ? ` #${app.extension}` : ''}</div>
                    <div className="text-sm text-stone-500">{app.email}</div>
                  </AdminTable.Td>
                  <AdminTable.Td>
                    <StatusBadge 
                      status={app.status === 'pending' ? 'warning' : app.status === 'approved' ? 'success' : 'error'} 
                      text={app.status === 'pending' ? '審核中' : app.status === 'approved' ? '已核准' : '已拒絕'}
                    />
                  </AdminTable.Td>
                  <AdminTable.Td className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <button 
                        onClick={() => handleView(app)}
                        className="p-2 text-stone-500 hover:text-primary transition-colors rounded hover:bg-stone-100"
                        title="查看詳情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(app, 'approved')}
                            className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition-colors text-sm"
                          >
                            核准
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(app, 'rejected')}
                            className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors text-sm"
                          >
                            拒絕
                          </button>
                        </>
                      )}
                    </div>
                  </AdminTable.Td>
                </AdminTable.Row>
              ))
            ) : (
              <AdminTable.Empty colSpan={6}>
                沒有找到符合的申請紀錄
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>

      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={confirmUpdateStatus}
        title={statusToSet === 'approved' ? '確認核准申請？' : '確認拒絕申請？'}
        message={`確定要${statusToSet === 'approved' ? '核准' : '拒絕'} ${selectedApplication?.name} 的加盟申請嗎？`}
        confirmText={statusToSet === 'approved' ? '確認核准' : '確認拒絕'}
        cancelText="取消"
        variant={statusToSet === 'approved' ? 'primary' : 'danger'}
      />

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        className="max-w-3xl w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-stone-900">加盟申請詳情</h3>
          </div>
        {selectedApplication && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-stone-500 mb-1">廠商資訊</h4>
                <div className="bg-stone-50 p-4 rounded-xl space-y-3">
                  <div>
                    <div className="text-xs text-stone-500">廠商名稱</div>
                    <div className="font-medium text-stone-900">{selectedApplication.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500">統一編號</div>
                    <div className="text-stone-900">{selectedApplication.taxId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500">公司地址</div>
                    <div className="text-stone-900">{selectedApplication.address}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-stone-500 mb-1">聯絡人資訊</h4>
                <div className="bg-stone-50 p-4 rounded-xl space-y-3">
                  <div>
                    <div className="text-xs text-stone-500">聯絡人姓名 / 職稱</div>
                    <div className="text-stone-900">{selectedApplication.contactName} / {selectedApplication.jobTitle}</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500">聯絡電話</div>
                    <div className="text-stone-900">{selectedApplication.phone} {selectedApplication.extension ? `#${selectedApplication.extension}` : ''}</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500">電子信箱</div>
                    <div className="text-stone-900">{selectedApplication.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-stone-500 mb-1">申請動機 / 備註</h4>
              <div className="bg-stone-50 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap text-stone-900">
                {selectedApplication.motivation || '未填寫'}
              </div>
            </div>

            {selectedApplication.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleUpdateStatus(selectedApplication, 'rejected');
                  }}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                >
                  拒絕申請
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleUpdateStatus(selectedApplication, 'approved');
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
                >
                  核准申請
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </Modal>
    </div>
  );
}
