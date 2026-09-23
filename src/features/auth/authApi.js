import { authCredentials } from './authSession';
import { baseApi } from '../../store/api/baseApi';
import { setCredentials, logout as logoutAction } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email: credentials.email, password: credentials.password },
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.accessToken) {
            localStorage.removeItem('nexa_admin_refresh_token');
            sessionStorage.removeItem('nexa_admin_refresh_token');
            sessionStorage.setItem('nexa_admin_session_only', String(!args.rememberMe));
            dispatch(setCredentials(authCredentials(data)));
          }
        } catch {
          // Handled by component error state
        }
      },
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    logoutApi: builder.mutation({
      queryFn: (body, api, _options, fetchWithBQ) => {
        const refreshToken = body?.refreshToken || api.getState().auth.refreshToken;
        if (!refreshToken) return { error: { status: 'CUSTOM_ERROR', error: 'No forum API refresh token is available for logout.' } };
        return fetchWithBQ({ url: '/auth/logout', method: 'POST', body: { refreshToken } });
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Local logout still completes if the server is unavailable.
        } finally {
          dispatch(logoutAction());
        }
      },
      invalidatesTags: ['User', 'Bookmark', 'Notification'],
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body, // { token }
      }),
    }),
    resendVerification: builder.mutation({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body, // { email }
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body, // { email }
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body, // { token, newPassword, confirmPassword }
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutApiMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

export const useLogoutUserMutation = useLogoutApiMutation;

export default authApi;
