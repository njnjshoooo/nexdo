import React from 'react';

/**
 * 清理並正規化 Markdown 中的超連結網址
 */
export function cleanMarkdownHref(href: string | undefined): string {
  if (!href) return '';
  let clean = href.trim();

  // 1. 去除 url: 或 URL: 前綴
  if (/^url:/i.test(clean)) {
    clean = clean.replace(/^url:/i, '').trim();
  }

  // 2. 如果是 minigame 開頭（但沒有斜線），自動補上 /
  if (/^minigame(\/|#|$)/i.test(clean)) {
    clean = '/' + clean;
  }

  return clean;
}

/**
 * 預先修正文章中的常見 Markdown 格式誤植
 */
export function preprocessMarkdown(content: string | undefined | null): string {
  if (!content || typeof content !== 'string') return '';

  let result = content;

  // 1. 處理 [[標題]](連結) -> [標題](連結)
  result = result.replace(/\[\[(.*?)\]\]\((.*?)\)/g, '[$1]($2)');

  // 2. 處理 (url:https://...) 或 (url:/minigame...)
  result = result.replace(/\(url:(https?:\/\/[^\)]+)\)/gi, '($1)');
  result = result.replace(/\(url:(\/[^\)]+)\)/gi, '($1)');
  result = result.replace(/\(url:(minigame[^\)]*)\)/gi, '(/$1)');

  return result;
}

/**
 * 自訂 Markdown 連結元件：
 * - 偵測 /minigame 與外部連結，強制加上 target="_blank"
 * - 自動清洗不合規定的 url: 前綴
 * - 套用精美品牌風格樣式
 */
export function MarkdownLink({ href, children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cleanHref = cleanMarkdownHref(href);

  // 只要包含 minigame 或是 http/https 外部連結，強制開新分頁
  const isMinigame = cleanHref.includes('minigame');
  const isExternal = cleanHref.startsWith('http://') || cleanHref.startsWith('https://');
  const isNewTab = isMinigame || isExternal || props.target === '_blank';

  return (
    <a
      {...props}
      href={cleanHref}
      target={isNewTab ? '_blank' : undefined}
      rel={isNewTab ? 'noopener noreferrer' : undefined}
      className={className || "text-[#8B5E34] font-medium underline underline-offset-4 decoration-[#8B5E34]/40 hover:decoration-[#8B5E34] hover:text-[#6b4522] transition-colors"}
    >
      {children}
    </a>
  );
}

export const customMarkdownComponents = {
  a: MarkdownLink
};
