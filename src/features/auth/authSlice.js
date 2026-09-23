import { getRefreshToken } from './authSession';
import { createSlice } from '@reduxjs/toolkit';

const getStoredItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const storedUser = getStoredItem('nexa_admin_user');
const storedRefreshToken = getRefreshToken();

// SECURITY: accessToken is stored EXCLUSIVELY in Redux memory (RAM).
// This avoids persisting access tokens; it does not prevent XSS.
const initialState = {
  user: storedUser || null,
  accessToken: null, // Strictly in-memory
  refreshToken: storedRefreshToken || null,
  isAuthenticated: false,
  isInitialized: !storedRefreshToken, // Wait for silent refresh if a refresh token exists
  role: storedUser?.role || 'student',
  status: 'idle',
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;

      // Access token is held in memory only
      if (accessToken !== undefined) {
        state.accessToken = accessToken;
        state.isAuthenticated = !!accessToken;
      }

      // Refresh token is stored for silent session renewal
      if (refreshToken !== undefined) {
        state.refreshToken = refreshToken;
        if (refreshToken) {
          const storage = sessionStorage.getItem('nexa_admin_session_only') === 'true' ? sessionStorage : localStorage;
          storage.setItem('nexa_admin_refresh_token', refreshToken);
        } else {
          localStorage.removeItem('nexa_admin_refresh_token');
          sessionStorage.removeItem('nexa_admin_refresh_token');
        }
      }

      if (user !== undefined) {
        state.user = user;
        state.role = user?.role || 'student';
        if (user) {
          localStorage.setItem('nexa_admin_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('nexa_admin_user');
        }
      }

      state.isInitialized = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      const { user, token, accessToken, refreshToken } = action.payload;
      const validToken = accessToken || token;

      state.user = user;
      state.accessToken = validToken;
      state.refreshToken = refreshToken || null;
      state.role = user?.role || 'student';
      state.isAuthenticated = !!validToken;
      state.isInitialized = true;
      state.error = null;

      if (user) localStorage.setItem('nexa_admin_user', JSON.stringify(user));
      if (refreshToken) localStorage.setItem('nexa_admin_refresh_token', refreshToken);
      // Clean up any legacy localStorage tokens
      localStorage.removeItem('nexa_admin_token');
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.error = null;

      localStorage.removeItem('nexa_admin_user');
      localStorage.removeItem('nexa_admin_refresh_token');
          sessionStorage.removeItem('nexa_admin_refresh_token');
      localStorage.removeItem('nexa_admin_token'); // Ensure legacy token is cleaned
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (action.payload.role) {
        state.role = action.payload.role;
      }
      localStorage.setItem('nexa_admin_user', JSON.stringify(state.user));
    },

    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('nexa_admin_user', JSON.stringify(state.user));
    },


  },
});

export const {
  setCredentials,
  loginSuccess,
  setInitialized,
  logout,
  updateUser,
  updateProfile,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentToken = (state) => state.auth.accessToken;
export const selectUserRole = (state) => state.auth.role;
export const selectIsAuthInitialized = (state) => state.auth.isInitialized;

export default authSlice.reducer;
