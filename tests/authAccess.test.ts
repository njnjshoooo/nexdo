import test from 'node:test';
import assert from 'node:assert/strict';
import { adminAccess, hasPermission, memberReturnPath } from '../src/lib/authAccess.ts';

test('only an explicit admin grant enables administrative access', () => {
  assert.deepEqual(adminAccess(null), { role: 'user', permissions: [] });
  assert.deepEqual(adminAccess({ role: 'user', permissions: ['all'] }), { role: 'user', permissions: [] });
  assert.deepEqual(adminAccess({ role: 'admin', permissions: ['forms', 1] }), { role: 'admin', permissions: ['forms'] });
});
test('permission checks reject legacy ids and respect module grants', () => {
  const member = { id: '1', email: 'admin@nexdo.com', name: 'test', role: 'user' as const, permissions: ['all'] };
  assert.equal(hasPermission(member, 'permissions'), false);
  assert.equal(hasPermission({ ...member, role: 'admin', permissions: ['forms'] }, 'permissions'), false);
  assert.equal(hasPermission({ ...member, role: 'admin', permissions: ['forms'] }, 'forms'), true);
  assert.equal(hasPermission({ ...member, role: 'admin' }, 'permissions'), true);
});
test('member login return paths cannot navigate off-site or into admin', () => {
  for (const input of ['https://example.com', '//example.com', '/admin', '/profile\\evil', undefined]) assert.equal(memberReturnPath(input), '/profile');
  assert.equal(memberReturnPath('/profile/orders'), '/profile/orders');
});
