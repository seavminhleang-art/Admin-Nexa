export function getRefreshToken() {
  return sessionStorage.getItem('nexa_admin_refresh_token') || localStorage.getItem('nexa_admin_refresh_token');
}

export function authCredentials(data, refreshToken = data.refreshToken) {
  let claims = {};
  try {
    const payload = data.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    claims = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
  } catch { /* Opaque tokens have no client-readable role. */ }
  // These claims only control navigation; the server must enforce authorization.
  const roles = [claims.role, ...(Array.isArray(claims.roles) ? claims.roles : [])];
  const role = roles.some(value => ['admin', 'role_admin'].includes(String(value).toLowerCase())) ? 'admin' : 'student';
  return {
    accessToken: data.accessToken,
    refreshToken,
    user: { id: data.userId, displayName: data.displayName, email: data.email, role },
  };
}
