export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  trigger_description: string;
  description: string;
  subject: string;
  content: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
