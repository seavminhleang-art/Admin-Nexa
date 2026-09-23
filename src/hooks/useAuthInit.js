import { authCredentials, getRefreshToken } from '../features/auth/authSession';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { setCredentials, setInitialized, logout } from '../features/auth/authSlice';
import { BASE_API_URL } from '../store/api/baseQueryWithReauth';

let pendingRefresh;
let pendingToken;

export function useAuthInit() {
  const dispatch = useAppDispatch();
  const { accessToken, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Ensure any legacy insecure tokens are removed from localStorage
    localStorage.removeItem('nexa_admin_token');

    const refreshToken = getRefreshToken();

    // If already has access token in memory or no refresh token available
    if (accessToken || !refreshToken) {
      dispatch(setInitialized());
      return;
    }

    // Silent session restoration on browser startup/reload
    let isCancelled = false;

    async function silentRefresh() {
      try {
        if (!pendingRefresh || pendingToken !== refreshToken) {
          pendingToken = refreshToken;
          pendingRefresh = fetch(`${BASE_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            signal: AbortSignal.timeout(15000),
          }).then(response => {
            if (!response.ok) throw new Error('Refresh failed');
            return response.json();
          }).finally(() => { pendingRefresh = undefined; });
        }
        const data = await pendingRefresh;
        if (getRefreshToken() !== refreshToken) return;
        if (!isCancelled && data.accessToken) {
          dispatch(
            setCredentials(authCredentials(data, data.refreshToken || refreshToken))
          );
        } else if (!isCancelled) {
          dispatch(logout());
        }
      } catch {
        if (!isCancelled) {
          dispatch(logout());
        }
      } finally {
        if (!isCancelled) {
          dispatch(setInitialized());
        }
      }
    }

    silentRefresh();

    return () => {
      isCancelled = true;
    };
  }, [accessToken, dispatch]);

  return isInitialized;
}

export default useAuthInit;
