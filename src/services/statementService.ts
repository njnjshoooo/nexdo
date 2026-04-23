import { Statement } from '../types/admin';

const STORAGE_KEY = 'statements';

export const statementService = {
  getAll: (): Statement[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  getById: (id: string): Statement | undefined => {
    return statementService.getAll().find(s => s.id === id);
  },
  
  getByVendorId: (vendorId: string): Statement[] => {
    return statementService.getAll().filter(s => s.vendorId === vendorId);
  },
  
  create: (statement: Statement): Statement => {
    const statements = statementService.getAll();
    statements.push(statement);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statements));
    return statement;
  },
  
  update: (id: string, updates: Partial<Statement>): Statement | undefined => {
    const statements = statementService.getAll();
    const index = statements.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    const updated = { ...statements[index], ...updates };
    statements[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statements));
    return updated;
  }
};
