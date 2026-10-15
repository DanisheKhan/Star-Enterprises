import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useStores } from '@/features/stores';
import { Container, Button } from '@/shared/ui';
import { LogOut, LayoutGrid } from 'lucide-react';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isOwner, signOut } = useAuth();
  const { data: stores = [] } = useStores();

  // Find if currently in a store workspace
  const currentStoreMatch = location.pathname.match(/\/admin\/([^/]+)/);
  const currentStoreCode = currentStoreMatch ? currentStoreMatch[1] : null;

  function handleStoreChange(e) {
    const code = e.target.value;
    if (code === 'launcher') {
      navigate('/admin');
    } else if (code === 'all') {
      navigate('/admin/all');
    } else {
      navigate(`/admin/${code}`);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <Container size="xl" className="h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-semibold text-text tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
              <span>STAR ENTERPRISES</span>
            </Link>

            {/* Store Switcher Dropdown */}
            {stores.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
                <span className="text-xs text-muted">Store:</span>
                <select
                  value={currentStoreCode || (location.pathname === '/admin/all' ? 'all' : 'launcher')}
                  onChange={handleStoreChange}
                  className="text-xs font-semibold bg-bg border border-border rounded-full px-3.5 py-1.5 text-text cursor-pointer hover:border-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <option value="launcher">Switch Workspace...</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                  {isOwner && <option value="all">★ All Stores Combined</option>}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-text">
                {profile?.full_name || 'Staff User'}
              </span>
              <span className="text-[10px] text-muted capitalize">
                {profile?.role || 'cashier'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="text-xs"
              title="Return to Launcher"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Launcher</span>
            </Button>

            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="text-xs"
                title="Sign Out"
              >
                <LogOut size={14} />
              </Button>
            )}
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-border py-4 bg-surface text-center text-xs text-muted no-print">
        <Container size="xl">
          <span>Star Enterprises Management System • Built on PostgreSQL 17 + Supabase</span>
        </Container>
      </footer>
    </div>
  );
}
