import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmailTemplate } from '../../../types/emailTemplate';
import { emailTemplateService } from '../../../services/emailTemplateService';
import { ArrowLeft, Save, Info, Heading2, Bold, Italic, Link as LinkIcon, Minus, List } from 'lucide-react';
import SaveButton from '../../../components/admin/SaveButton';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';

export default function EmailEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  
  // Local state for editing
  const [templateKey, setTemplateKey] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      setLoading(true);
      
      if (id === 'new') {
        const newTemplate: any = {
          id: 'new',
          key: '',
          name: '',
          subject: '',
          content: '',
          status: 'active'
        };
        setTemplate(newTemplate);
        setIsActive(true);
      } else {
        const all = await emailTemplateService.getAll();
        const found = all.find(t => t.id === id);
        if (found) {
          setTemplate(found);
          setTemplateKey(found.key || '');
          setTemplateName(found.name || '');
          setSubject(found.subject || '');
          setContent(found.content || '');
          setIsActive(found.status === 'active');
        } else {
          alert('Email template not found');
          navigate('/admin/emails');
        }
      }
      setLoading(false);
    };
    fetchTemplate();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id || !template) return;
    if (id === 'new' && (!templateKey || !templateName)) {
      alert('請填寫信件代碼與名稱');
      return;
    }
    
    setSaveStatus('saving');
    
    if (id === 'new') {
      const created = await emailTemplateService.create({
        key: templateKey,
        name: templateName,
        subject,
        content,
        status: isActive ? 'active' : 'inactive',
        description: '',
        trigger_description: ''
      });
      if (created) {
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
          navigate(`/admin/emails/${created.id}`, { replace: true });
        }, 1000);
      } else {
        setSaveStatus('idle');
        alert('建立失敗');
      }
    } else {
      const success = await emailTemplateService.update(id, {
        subject,
        content,
        status: isActive ? 'active' : 'inactive'
      });
      
      if (success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('idle');
        alert('保存失敗');
      }
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = content;
    const before = currentText.substring(0, start);
    const selection = currentText.substring(start, end);
    const after = currentText.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleVariableClick = (variable: string) => {
    insertMarkdown(variable);
  };

  if (loading) {
    return <div className="p-8">載入中...</div>;
  }

  if (!template) {
    return null;
  }

  // Pre-defined variables mapping based on template key
  const availableVariables: Record<string, { key: string, desc: string }[]> = {
    'welcome_email': [
      { key: '{{buyer_name}}', desc: '訂購人姓名' },
      { key: '{{site_name}}', desc: '網站名稱' },
    ],
    'order_confirmation': [
      { key: '{{buyer_name}}', desc: '訂購人姓名' },
      { key: '{{order_id}}', desc: '訂單編號' },
      { key: '{{payment_amount}}', desc: '付款金額' },
    ],
    'appointment_confirmation': [
      { key: '{{buyer_name}}', desc: '聯絡人姓名' },
      { key: '{{recipient_name}}', desc: '長輩姓名' },
      { key: '{{appointment_date}}', desc: '預約日期' },
      { key: '{{appointment_time}}', desc: '預約時間' },
    ],
  };

  const variables = availableVariables[templateKey] || [
    { key: '{{buyer_name}}', desc: '訂購人/聯絡人姓名' },
    { key: '{{recipient_name}}', desc: '長輩姓名' },
    { key: '{{order_id}}', desc: '訂單編號' },
    { key: '{{payment_amount}}', desc: '付款金額' },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <AdminPageHeader
        title={id === 'new' ? '新增自動發信' : '編輯自動發信'}
        subtitle={id === 'new' ? '建立新的自動發信範本' : templateName}
        backTo="/admin/emails"
        actionButtons={
          <SaveButton 
            onClick={handleSave}
            status={saveStatus}
            type="button"
          />
        }
      />

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* Main Form */}
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between pb-6 border-b border-stone-100">
              <div className="flex-1 mr-8 space-y-4">
                {id === 'new' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        信件名稱 (Email Name)
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-stone-200 rounded-lg outline-none focus:border-stone-400 text-sm"
                        placeholder="例如：會員註冊成功信"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        信件代碼 (Email Key)
                      </label>
                      <input
                        type="text"
                        value={templateKey}
                        onChange={(e) => setTemplateKey(e.target.value)}
                        className="w-full px-3 py-1.5 border border-stone-200 rounded-lg outline-none focus:border-stone-400 text-sm font-mono text-stone-600"
                        placeholder="例如：welcome_email"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      信件代碼 (Email Key)
                    </label>
                    <div className="text-stone-500 font-mono text-sm bg-stone-50 px-3 py-1.5 rounded inline-block">
                      {templateKey}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-stone-700">啟用狀態</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                郵件主旨
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="輸入郵件主旨"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-stone-700">
                  郵件內容編輯器 (支援 Markdown/HTML)
                </label>
                <div className="flex gap-1">
                  <button onClick={() => insertMarkdown('## ')} className="p-1.5 hover:bg-stone-100 rounded text-stone-600 tooltip-trigger" title="標題"><Heading2 size={16} /></button>
                  <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 hover:bg-stone-100 rounded text-stone-600 tooltip-trigger" title="粗體"><Bold size={16} /></button>
                  <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 hover:bg-stone-100 rounded text-stone-600 tooltip-trigger" title="斜體"><Italic size={16} /></button>
                  <button onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 hover:bg-stone-100 rounded text-stone-600 tooltip-trigger" title="連結"><LinkIcon size={16} /></button>
                  <button onClick={() => insertMarkdown('\n- ')} className="p-1.5 hover:bg-stone-100 rounded text-stone-600 tooltip-trigger" title="列表"><List size={16} /></button>
                  <button onClick={() => insertMarkdown('\n---\n')} className="p-1.5 hover:bg-stone-100 rounded text-stone-600 tooltip-trigger" title="分隔線"><Minus size={16} /></button>
                </div>
              </div>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors font-mono text-sm leading-relaxed"
                placeholder="輸入郵件內容（可使用右側變數代碼）"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-stone-800">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">變數提示區</h3>
            </div>
            <p className="text-sm text-stone-600 mb-4 leading-relaxed">
              點擊下列代碼即可插入至內容中。系統會在寄出時自動替換為實際資料。
            </p>
            <div className="space-y-3">
              {variables.map((v) => (
                <div 
                  key={v.key} 
                  className="bg-white p-3 rounded-lg border border-stone-200 hover:border-primary cursor-pointer transition-colors group"
                  onClick={() => handleVariableClick(v.key)}
                >
                  <div className="font-mono text-xs text-primary bg-primary/5 px-2 py-1 rounded inline-block mb-1 group-hover:bg-primary/10">
                    {v.key}
                  </div>
                  <div className="text-sm text-stone-600">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
