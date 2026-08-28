export interface WidgetProps {
  block: any;
  isFirstBlock?: boolean;
  isSubItem?: boolean;
  navigate?: (path: string) => void;
  handleAnchorClick?: (e: any, link: string, type?: string) => void;
  currentPage?: any;
}
