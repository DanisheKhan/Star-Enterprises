import { useParams, Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '@/features/stores';
import { Container } from '@/shared/ui';
import { CreditCard, Package, RotateCcw, ReceiptText, ArrowLeft } from 'lucide-react';

export function WorkspaceLayout() {
  const { storeCode } = useParams();
  const location = useLocation();
  const { data: store, isLoading, error } = useStore(storeCode);

  if (isLoading) {
    return (
      <Container size="xl" className="py-16 text-center text-muted">
        Loading store workspace...
      </Container>
    );
  }

  if (error || !store) {
    return (
      <Container size="xl" className="py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-danger">Store Workspace Not Found</h2>
        <p className="text-sm text-muted">
          The requested store code "{storeCode}" does not exist or has been disabled.
        </p>
        <Link to="/admin" className="text-sm font-semibold underline">
          Return to Launcher
        </Link>
      </Container>
    );
  }

  const basePath = `/admin/${storeCode}`;
  const isPos = location.pathname === basePath || location.pathname === `${basePath}/`;
  const isInventory = location.pathname === `${basePath}/inventory`;
  const isSecondHand = location.pathname === `${basePath}/second-hand`;
  const isInvoices = location.pathname === `${basePath}/invoices`;

  return (
    <div>
      {/* Store Navigation Subheader (Sticky below top bar) */}
      <div className="border-b border-border bg-surface sticky top-14 z-30 no-print shadow-xs">
        <Container size="xl" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to="/admin"
              className="p-1.5 sm:p-2 rounded-full border border-border text-muted hover:text-text hover:bg-bg transition-colors shrink-0"
              title="Back to Launcher"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-text truncate">{store.name}</h2>
              <p className="text-[10px] sm:text-[11px] text-muted truncate">
                GSTIN: {store.gstin} • Prefix: {store.invoice_prefix}
              </p>
            </div>
          </div>

          {/* Workspace Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto min-w-0 w-full sm:w-auto pb-1 sm:pb-0">
            <Link
              to={basePath}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                isPos
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-muted hover:text-text hover:bg-bg border border-transparent'
              }`}
            >
              <CreditCard size={14} /> POS Billing
            </Link>

            <Link
              to={`${basePath}/inventory`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                isInventory
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-muted hover:text-text hover:bg-bg border border-transparent'
              }`}
            >
              <Package size={14} /> Inventory & Serials
            </Link>

            {store.code === 'mobiles' && (
              <Link
                to={`${basePath}/second-hand`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                  isSecondHand
                    ? 'bg-accent text-accent-fg shadow-sm'
                    : 'text-muted hover:text-text hover:bg-bg border border-transparent'
                }`}
              >
                <RotateCcw size={14} /> Second-Hand Intake
              </Link>
            )}

            <Link
              to={`${basePath}/invoices`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                isInvoices
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-muted hover:text-text hover:bg-bg border border-transparent'
              }`}
            >
              <ReceiptText size={14} /> Invoices
            </Link>
          </nav>
        </Container>
      </div>

      {/* Workspace Page Body */}
      <Container size="xl" className="py-6 min-w-0">
        <Outlet context={{ store }} />
      </Container>
    </div>
  );
}
