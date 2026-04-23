export type FormFieldType = 
  | 'text' 
  | 'textarea' 
  | 'radio' 
  | 'checkbox' 
  | 'select' 
  | 'date' 
  | 'hidden' 
  | 'file';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: FormFieldOption[]; // For radio, checkbox, select
  placeholder?: string;
  hiddenValueType?: 'page_slug' | 'page_title' | 'custom'; // For hidden fields
  customHiddenValue?: string;
  multiple?: boolean; // For file uploads
}

export interface Form {
  id: string; // Internal ID
  formId: string; // Unique identifier for anchoring and identification
  name: string;
  description: string;
  purpose?: 'CONSULTATION' | 'BOOKING';
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  userId?: string; // Added userId to track submissions by user
  pageSlug: string;
  pageTitle: string;
  data: Record<string, any>;
  createdAt: string;
  status?: 'PENDING' | 'ASSIGNED' | 'QUOTED' | 'PROCESSED' | 'ACTIVE';
  bookingId?: string;
}
