import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { EmailTemplate } from '../../types/emailTemplate';
import { emailTemplateService } from '../../services/emailTemplateService';
import CreateButton from '../../components/admin/CreateButton';
import { PageMainTitle } from '../../components/admin/ui/AdminEditorUI';

export default function EmailManagement() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const data = await emailTemplateService.getAll();
      setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <PageMainTitle className="!text-3xl mb-2">自動發信管理</PageMainTitle>
          <p className="text-stone-500">管理系統各項自動發送通知信件的範本與規則</p>
        </div>
        <CreateButton text="新增功能" onClick={() => navigate('/admin/emails/new')} icon={Plus} />
      </div>

      <AdminTable.Container>
        <AdminTable.Main>
          <AdminTable.Head>
            <tr>
              <AdminTable.Th>發信功能名稱</AdminTable.Th>
              <AdminTable.Th>狀態</AdminTable.Th>
              <AdminTable.Th>觸發條件</AdminTable.Th>
              <AdminTable.Th>建立時間</AdminTable.Th>
              <AdminTable.Th>上次更新時間</AdminTable.Th>
              <AdminTable.Th className="text-right">操作</AdminTable.Th>
            </tr>
          </AdminTable.Head>
          <AdminTable.Body>
            {loading ? (
              <AdminTable.Empty colSpan={6}>載入中...</AdminTable.Empty>
            ) : templates.map((template) => (
              <AdminTable.Row key={template.id}>
                <AdminTable.Td>
                  <div className="font-medium text-stone-800">{template.name}</div>
                </AdminTable.Td>
                <AdminTable.Td>
                  {template.status === 'active' ? (
                    <StatusBadge status="success" icon="check" text="作用中" />
                  ) : (
                    <StatusBadge status="inactive" icon="cross" text="未啟用" />
                  )}
                </AdminTable.Td>
                <AdminTable.Td className="text-stone-600">
                  {template.trigger_description}
                </AdminTable.Td>
                <AdminTable.Td className="text-stone-500 text-sm">
                  {new Date(template.created_at).toLocaleString('zh-TW')}
                </AdminTable.Td>
                <AdminTable.Td className="text-stone-500 text-sm">
                  {new Date(template.updated_at).toLocaleString('zh-TW')}
                </AdminTable.Td>
                <AdminTable.Td className="text-right">
                  <AdminTable.Actions>
                    <AdminTable.Edit onClick={() => navigate(`/admin/emails/${template.id}`)} />
                  </AdminTable.Actions>
                </AdminTable.Td>
              </AdminTable.Row>
            ))}
            {!loading && templates.length === 0 && (
              <AdminTable.Empty colSpan={6}>
                尚無自動發信範本
              </AdminTable.Empty>
            )}
          </AdminTable.Body>
        </AdminTable.Main>
      </AdminTable.Container>
    </div>
  );
}
