import test from 'node:test';
import assert from 'node:assert/strict';
import { recoveryTokens, validateNewPassword } from '../src/lib/passwordRecovery';
test('only a complete recovery callback is accepted; unrelated login and expired links are rejected', () => {
  assert.deepEqual(recoveryTokens('#type=recovery&access_token=test-access&refresh_token=test-refresh'), { access_token: 'test-access', refresh_token: 'test-refresh' });
  for (const hash of ['', '#type=signup&access_token=x&refresh_token=y', '#type=recovery&access_token=x', '#type=recovery&access_token=x&refresh_token=y&error_code=otp_expired']) assert.equal(recoveryTokens(hash), null);
});
test('new passwords require minimum length and matching confirmation', () => {
  assert.ok(validateNewPassword('short', 'short'));
  assert.ok(validateNewPassword('test-password-only', 'different'));
  assert.ok(validateNewPassword(' '.repeat(15), ' '.repeat(15)));
  assert.equal(validateNewPassword('test-password-only', 'test-password-only'), null);
});
