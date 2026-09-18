import test from 'node:test';
import assert from 'node:assert/strict';
import { patchHomeBlock } from '../src/features/admin/homeEditor.ts';

test('editing live home content preserves historical blocks and unrelated metadata', () => {
  const legacy = { id: 'hero', type: 'HERO_1', hero: { title: '歷史主視覺' } };
  const blocks = [legacy, { id: 'services', type: 'SERVICES', archived: true, services: [{ pageId: 'cleaning', title: '舊文字' }] }];
  const result = patchHomeBlock(blocks, 'SERVICES', 'services', [{ pageId: 'cleaning', title: '新文字' }]);
  assert.deepEqual(result[0], legacy);
  assert.equal(result[1].archived, true);
  assert.equal(result[1].id, 'services');
  assert.equal(blocks[1].services[0].title, '舊文字');
});
test('adding a missing live block retains all existing CMS blocks', () => {
  const blocks = [{ id: 'old', type: 'TESTIMONIALS', testimonials: { title: '舊資料' } }];
  const result = patchHomeBlock(blocks, 'MORE_SERVICES', 'moreServices', { pageIds: ['cleaning'] });
  assert.deepEqual(result.slice(0, 1), blocks);
  assert.deepEqual(result[1].moreServices, { pageIds: ['cleaning'] });
});
