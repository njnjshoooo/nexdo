import { orderService } from './orderService';
import { submissionService } from './submissionService';

export const idService = {
  generateBookingId: async (formId: string): Promise<string> => {
    const submissions = await submissionService.getAll();
    
    // 1. Generate Form Abbreviation
    // e.g., home-organize-booking-form -> HOME-ORG
    const parts = formId.replace(/-form$/, '').split('-');
    const formAbbr = parts.slice(0, 2).map(p => p.toUpperCase()).join('-');
    
    // 2. Generate Date Prefix (YYMMDD)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    
    // 3. Generate Sequence
    // Format: BK-[FORM]-[YYMMDD]-[SEQ]
    const prefix = `BK-${formAbbr}-${datePrefix}-`;
    
    const todaySubmissions = submissions.filter(s => s.bookingId && s.bookingId.startsWith(prefix));
    
    let maxSequence = 0;
    todaySubmissions.forEach(s => {
      const seqStr = s.bookingId!.slice(-3);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    });
    
    const sequence = String(maxSequence + 1).padStart(3, '0');
    
    return `${prefix}${sequence}`;
  }
};
