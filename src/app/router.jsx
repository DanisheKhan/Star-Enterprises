import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { WorkspaceLayout } from './layouts/WorkspaceLayout';

const PublicHomePage = lazy(() => import('@/features/catalog').then((m) => ({ default: m.PublicHomePage })));
const LoginPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.LoginPage })));
const LauncherPage = lazy(() => import('@/features/launcher').then((m) => ({ default: m.LauncherPage })));
const OwnerDashboardPage = lazy(() => import('@/features/reports').then((m) => ({ default: m.OwnerDashboardPage })));
const StaffManagementPage = lazy(() => import('@/features/staff').then((m) => ({ default: m.StaffManagementPage })));
const POSPage = lazy(() => import('@/features/billing').then((m) => ({ default: m.POSPage })));
const InvoicesListPage = lazy(() => import('@/features/billing').then((m) => ({ default: m.InvoicesListPage })));
const InventoryPage = lazy(() => import('@/features/inventory').then((m) => ({ default: m.InventoryPage })));
const SecondHandIntakePage = lazy(() => import('@/features/second-hand').then((m) => ({ default: m.SecondHandIntakePage })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <PublicHomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'admin',
        element: <LauncherPage />,
      },
      {
        path: 'admin/all',
        element: <OwnerDashboardPage />,
      },
      {
        path: 'admin/staff',
        element: <StaffManagementPage />,
      },
      {
        path: 'admin/my-portal',
        element: <Navigate to="/admin/staff" replace />,
      },
      {
        path: 'admin/:storeCode',
        element: <WorkspaceLayout />,
        children: [
          {
            index: true,
            element: <POSPage />,
          },
          {
            path: 'inventory',
            element: <InventoryPage />,
          },
          {
            path: 'second-hand',
            element: <SecondHandIntakePage />,
          },
          {
            path: 'invoices',
            element: <InvoicesListPage />,
          },
        ],
      },
      {
        path: '*',
        element: (
          <div className="py-24 text-center space-y-4">
            <h1 className="text-2xl font-semibold">404 - Page Not Found</h1>
            <p className="text-sm text-muted">The requested URL does not exist.</p>
          </div>
        ),
      },
    ],
  },
]);
