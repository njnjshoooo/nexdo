export function recoveryTokens(fragment: string): { access_token: string; refresh_token: string } | null {
  const params = new URLSearchParams(fragment.replace(/^#/, ''));
  if (params.has('error') || params.has('error_code') || params.get('type') !== 'recovery') return null;
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  return access_token && refresh_token ? { access_token, refresh_token } : null;
}
export function validateNewPassword(password: string, confirmation: string): string | null {
  if (password.length < 12 || password.length > 128 || !password.trim()) return '密碼須為 12 至 128 個字元。';
  if (password !== confirmation) return '兩次輸入的密碼不一致。';
  return null;
}
