export const AUTH_COOKIE_NAME = 'serwis_it_auth';

export function setAuthedCookie(): void {
  // 7 days
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE_NAME}=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function clearAuthedCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}
