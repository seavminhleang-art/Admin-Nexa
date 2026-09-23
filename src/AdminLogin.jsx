import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuthInit';
import { useLoginMutation, useLogoutApiMutation } from './features/auth/authApi';
import { logout } from './features/auth/authSlice';
import { baseApi } from './store/api/baseApi';
import BrandLogo from './Components/common/BrandLogo';

export function AdminGuard() {
  const ready = useAuthInit();
  const { accessToken, role } = useSelector(state => state.auth);
  if (!ready) return <p role="status" className="p-8">Restoring your session…</p>;
  return accessToken && role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminLogin() {
  const ready = useAuthInit();
  const { accessToken, role } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [signOut, { isLoading: signingOut }] = useLogoutApiMutation();
  const [error, setError] = useState('');
  if (!ready) return <p role="status" className="p-8">Restoring your session…</p>;
  if (accessToken && role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  const denied = Boolean(accessToken);
  async function submit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await login({ email: form.get('email').trim(), password: form.get('password'), rememberMe: form.get('remember') === 'on' }).unwrap();
      if (!response?.accessToken) setError('The server did not return a valid session. Please try again.');
    } catch (failure) {
      setError(failure.status === 401 ? 'Incorrect email or password.' : 'Unable to sign in. Please check your connection and try again.');
    }
  }
  async function switchAccount() {
    await signOut();
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    setError('');
  }
  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <BrandLogo darkMode={false} className="h-12 w-auto mb-8" />
      <h1 className="text-2xl font-semibold text-slate-900">Admin sign in</h1>
      <p className="mt-2 mb-6 text-sm text-slate-500">Sign in to manage the NEXA community.</p>
      {denied ? <div><p role="alert" className="mb-5 text-red-700">This account does not have administrator access.</p><button disabled={signingOut} onClick={switchAccount} className="rounded-lg bg-slate-900 px-4 py-3 text-white">{signingOut ? 'Signing out…' : 'Use another account'}</button></div> :
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-medium">Email<input className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3" name="email" type="email" autoComplete="username" required /></label>
        <label className="block text-sm font-medium">Password<input className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3" name="password" type="password" autoComplete="current-password" required /></label>
        <label className="flex items-center gap-2 text-sm"><input name="remember" type="checkbox" />Remember me</label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={isLoading} className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white disabled:opacity-60">{isLoading ? 'Signing in…' : 'Sign in'}</button>
      </form>}
    </section>
  </main>;
}
