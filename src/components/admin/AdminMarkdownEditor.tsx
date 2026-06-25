import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Heading2, Bold, Italic, Minus, Quote, Link as LinkIcon, List } from 'lucide-react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // standard textarea props
}

const AdminMarkdownEditor = forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Expose innerRef to the forwarded ref
  useImperativeHandle(ref, () => innerRef.current!);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = innerRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    
    // To make React Hook Form register the change, we need to set the value natively and dispatch an event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(textarea, newText);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selection.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => insertMarkdown('## ')} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all" title="標題"><Heading2 size={14} /> 標題</button>
        <button type="button" onClick={() => insertMarkdown('**', '**')} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all" title="加粗"><Bold size={14} /> 加粗</button>
        <button type="button" onClick={() => insertMarkdown('*', '*')} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all" title="斜體"><Italic size={14} /> 斜體</button>
        <button type="button" onClick={() => insertMarkdown('\n---\n')} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all" title="分隔線"><Minus size={14} /> 分隔線</button>
        <button type="button" onClick={() => insertMarkdown('> ')} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all" title="引用"><Quote size={14} /> 引用</button>
        <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all" title="連結"><LinkIcon size={14} /> 連結</button>
        <button type="button" onClick={() => insertMarkdown('- ')} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all" title="列表"><List size={14} /> 列表</button>
      </div>
      <textarea
        {...props}
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as any).current = node;
          }
        }}
        className={props.className || "w-full border border-stone-200 p-4 rounded-xl outline-none focus:border-primary font-mono text-sm leading-relaxed bg-white"}
      />
    </div>
  );
});

AdminMarkdownEditor.displayName = 'AdminMarkdownEditor';

export default AdminMarkdownEditor;
