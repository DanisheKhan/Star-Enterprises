import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { WorkspaceLayout } from './layouts/WorkspaceLayout';
import { LauncherPage } from '@/features/launcher';
import { POSPage, InvoicesListPage } from '@/features/billing';
import { InventoryPage } from '@/features/inventory';
import { SecondHandIntakePage } from '@/features/second-hand';
import { OwnerDashboardPage } from '@/features/reports';
import { PublicHomePage } from '@/features/catalog';
import { LoginPage } from '@/features/auth';
import { StaffManagementPage, StaffPortalPage } from '@/features/staff';

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
        element: <StaffPortalPage />,
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
