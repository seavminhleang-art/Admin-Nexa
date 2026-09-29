import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../../features/auth/authSlice';
import { authCredentials, getRefreshToken } from '../../features/auth/authSession';
import { FORUM_API_BASE_URL } from '../../config/forumApi';

export const BASE_API_URL = FORUM_API_BASE_URL;

// Authentication requests do not need an access token.
const publicQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  timeout: 15000,
});

// All other requests include the current access token.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  timeout: 15000,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Share one refresh request when several API calls expire at the same time.
let refreshPromise;

async function renewSession(refreshToken, api, extraOptions) {
  const refreshed = await publicQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  // Ignore this response if the user has logged out or changed sessions.
  if (api.getState().auth.refreshToken !== refreshToken) {
    return false;
  }
  if (!refreshed.data?.accessToken) {
    api.dispatch(logout());
    return false;
  }

  const nextRefreshToken = refreshed.data.refreshToken || refreshToken;
  const credentials = authCredentials(refreshed.data, nextRefreshToken);
  api.dispatch(setCredentials(credentials));
  return true;
}

export async function baseQueryWithReauth(args, api, extraOptions) {
  let url = args;
  if (typeof args !== 'string') {
    url = args.url;
  }

  // Invalid login credentials must never trigger session renewal or a retry.
  if (url.startsWith('/auth/')) {
    return publicQuery(args, api, extraOptions);
  }

  const result = await rawBaseQuery(args, api, extraOptions);
  const isUnauthorized =
    result.error?.status === 401 || result.error?.originalStatus === 401;
  if (!isUnauthorized) {
    return result;
  }

  const refreshToken = api.getState().auth.refreshToken || getRefreshToken();
  if (!refreshToken) {
    api.dispatch(logout());
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = renewSession(refreshToken, api, extraOptions).finally(() => {
      refreshPromise = undefined;
    });
  }

  const sessionRenewed = await refreshPromise;
  if (sessionRenewed) {
    return rawBaseQuery(args, api, extraOptions);
  }
  return result;
}

export default baseQueryWithReauth;
