import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../../features/auth/authSlice';
import { authCredentials, getRefreshToken } from '../../features/auth/authSession';
import { FORUM_API_BASE_URL } from '../../config/forumApi';

export const BASE_API_URL = FORUM_API_BASE_URL;
const publicQuery = fetchBaseQuery({ baseUrl: BASE_API_URL, timeout: 15000 });
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  timeout: 15000,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});
let refreshPromise;
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url;
  // Invalid login credentials must never trigger session renewal or a retry.
  if (url.startsWith('/auth/')) return publicQuery(args, api, extraOptions);
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401 && result.error?.originalStatus !== 401) return result;
  const refreshToken = api.getState().auth.refreshToken || getRefreshToken();
  if (!refreshToken) { api.dispatch(logout()); return result; }
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshed = await publicQuery({ url: '/auth/refresh', method: 'POST', body: { refreshToken } }, api, extraOptions);
      if (api.getState().auth.refreshToken !== refreshToken) return false;
      if (!refreshed.data?.accessToken) { api.dispatch(logout()); return false; }
      api.dispatch(setCredentials(authCredentials(refreshed.data, refreshed.data.refreshToken || refreshToken)));
      return true;
    })().finally(() => { refreshPromise = undefined; });
  }
  return await refreshPromise ? rawBaseQuery(args, api, extraOptions) : result;
};
export default baseQueryWithReauth;
