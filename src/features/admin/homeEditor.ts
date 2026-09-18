// Update one supported block without removing historical or unrelated CMS data.
export function patchHomeBlock(blocks: any[], type: string, contentKey: string, value: unknown) {
  const index = blocks.findIndex(block => block.type === type);
  if (index < 0) return [...blocks, { id: type.toLowerCase(), type, [contentKey]: value }];
  return blocks.map((block, i) => i === index ? { ...block, [contentKey]: value } : block);
}

// These IDs are matched by ServiceDirectory in RetirementHome, not arbitrary page IDs.
export const editableHomeServices = [
  ['home-safety', '居住安全'], ['renovation', '居家裝潢'], ['cleaning', '收納清潔'],
  ['services/health', '樂齡健康'], ['rent-and-move', '房屋出租'], ['consultant', '安心顧問諮詢'],
] as const;
