export interface User {
  id: string;
  name: string;
  title?: string;
  nickname?: string;
  email: string;
  phone?: string;
  address?: string;
  lineId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialRequirements?: string;
  role: 'admin' | 'user';
  permissions?: string[];
  createdAt?: string;
}
