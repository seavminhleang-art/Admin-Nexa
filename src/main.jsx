import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import auth from './features/auth/authSlice';
import theme from './store/slices/themeSlice';
import { baseApi } from './store/api/baseApi';
import { LanguageProvider } from './Components/Language/LanguageContext';
import AdminShell from './features/admin/workspace/AdminShell';
import Dashboard from './features/admin/workspace/Dashboard';
import ResourcePage from './features/admin/workspace/ResourcePage';
import { AdminGuard, AdminLogin } from './AdminLogin';
import './index.css';
import './i18n';

const store = configureStore({
  reducer: { auth, theme, [baseApi.reducerPath]: baseApi.reducer },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(baseApi.middleware),
});
const router = createBrowserRouter([
  { path: '/login', element: <AdminLogin /> },
  { element: <AdminGuard />, children: [
    { element: <AdminShell />, children: [
      { path: '/admin/dashboard', element: <Dashboard /> },
      ...['categories', 'users', 'posts', 'comments', 'tags', 'lost-found', 'moderation', 'marketplace', 'notifications', 'settings', 'locations', 'claims', 'leaderboard'].map(resource => ({
        path: `/admin/${resource}`, element: <ResourcePage key={resource} resource={resource} />,
      })),
    ] },
  ] },
  { path: '*', element: <Navigate to="/admin/dashboard" replace /> },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Provider store={store}><LanguageProvider><RouterProvider router={router} /></LanguageProvider></Provider></React.StrictMode>,
);
