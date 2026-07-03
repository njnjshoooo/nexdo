export function parseContentToMarkdown(content: string): string {
  if (!content) return '';
  if (typeof content !== 'string') return '';
  
  const trimmed = content.trim();
  // Check if it's likely a BlockNote JSON array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const blocks = JSON.parse(trimmed);
      if (Array.isArray(blocks) && blocks.length > 0 && ('type' in blocks[0] || 'content' in blocks[0])) {
        return convertBlocksToMarkdown(blocks);
      }
    } catch (e) {
      // Not valid JSON, just return original content
      return content;
    }
  }
  
  return content;
}

function convertBlocksToMarkdown(blocks: any[]): string {
  let markdown = '';
  
  for (const block of blocks) {
    if (!block.type) continue;
    
    let blockText = '';
    
    // Extract inline content
    if (Array.isArray(block.content)) {
      blockText = block.content.map((inline: any) => {
        if (inline.type === 'text') {
          let text = inline.text;
          if (inline.styles) {
            if (inline.styles.bold) text = `**${text}**`;
            if (inline.styles.italic) text = `*${text}*`;
            if (inline.styles.strike) text = `~~${text}~~`;
            if (inline.styles.code) text = `\`${text}\``;
          }
          if (inline.type === 'link' || inline.href) {
            text = `[${text}](${inline.href})`;
          }
          return text;
        }
        if (inline.type === 'link') {
            let text = inline.content ? inline.content.map((c: any) => c.text).join('') : inline.href;
            return `[${text}](${inline.href})`;
        }
        return '';
      }).join('');
    } else if (typeof block.content === 'string') {
      blockText = block.content;
    }
    
    // Apply block formatting
    switch (block.type) {
      case 'heading':
        const level = block.props?.level || 1;
        markdown += `${'#'.repeat(level)} ${blockText}\n\n`;
        break;
      case 'paragraph':
        markdown += `${blockText}\n\n`;
        break;
      case 'bulletListItem':
        markdown += `- ${blockText}\n`;
        break;
      case 'numberedListItem':
        markdown += `1. ${blockText}\n`;
        break;
      case 'checkListItem':
        const checked = block.props?.checked ? 'x' : ' ';
        markdown += `- [${checked}] ${blockText}\n`;
        break;
      case 'image':
        const url = block.props?.url || '';
        const alt = block.props?.alt || '';
        markdown += `![${alt}](${url})\n\n`;
        break;
      default:
        markdown += `${blockText}\n\n`;
    }
    
    // Handle nested blocks
    if (block.children && Array.isArray(block.children)) {
      const childrenMarkdown = convertBlocksToMarkdown(block.children);
      // Indent children
      markdown += childrenMarkdown.split('\n').map(line => line ? `  ${line}` : '').join('\n') + '\n';
    }
  }
  
  return markdown.replace(/\n{3,}/g, '\n\n').trim();
}
