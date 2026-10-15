import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useStores } from '@/features/stores';
import { useCart, CartDrawer } from '@/features/catalog';
import { Container, Button } from '@/shared/ui';
import { SITE } from '@/shared/lib/site';
import { LogOut, LayoutGrid, ShoppingBag, LogIn, Phone, Shield } from 'lucide-react';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, signOut } = useAuth();
  const { data: stores = [] } = useStores();
  const { totalCount, setIsCartOpen } = useCart();

  const isPublicPage = location.pathname === '/';

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
          {/* Left Brand */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              to={isPublicPage ? '/' : '/admin'}
              className="font-semibold text-text tracking-tight flex items-center gap-2 shrink-0 text-xs sm:text-base"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block shrink-0" />
              <span className="truncate">STAR ENTERPRISES</span>
            </Link>

            {/* Admin Workspace Dropdown (Only on Admin Routes) */}
            {!isPublicPage && stores.length > 0 && (
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

          {/* Right Actions */}
          {isPublicPage ? (
            /* Public Storefront Actions */
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a
                href={`https://wa.me/${SITE.whatsappPhone}`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors mr-1"
              >
                <Phone size={13} />
                <span>+91 98200 12345</span>
              </a>

              {/* Cart Drawer Trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="text-xs gap-1.5 cursor-pointer relative"
                aria-label="View shopping cart"
              >
                <ShoppingBag size={14} />
                <span>Cart</span>
                {totalCount > 0 && (
                  <span className="bg-accent text-accent-fg text-[10px] font-semibold px-1.5 py-0.2 rounded-full ml-0.5">
                    {totalCount}
                  </span>
                )}
              </Button>

              {/* Discreet Staff & Admin Portal Link */}
              <Link
                to="/login"
                className="text-xs px-2.5 sm:px-3 py-1.5 rounded-full border border-border text-muted hover:text-text hover:bg-bg transition-colors flex items-center gap-1.5 font-medium"
              >
                <Shield size={13} />
                <span className="hidden sm:inline">Staff Portal</span>
              </Link>
            </div>
          ) : (
            /* Admin & Workspace Actions */
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="text-xs px-2.5 sm:px-3"
                title="View Public Storefront"
              >
                <span className="hidden sm:inline">Storefront</span>
                <span className="sm:hidden">Store</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="text-xs px-2.5 sm:px-3"
                title="Return to Launcher"
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Launcher</span>
              </Button>

              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="text-xs px-2.5 sm:px-3"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-xs px-2.5 sm:px-3"
                  title="Sign In"
                >
                  <LogIn size={13} />
                </Button>
              )}
            </div>
          )}
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      {/* Cart Drawer for Public Browsing */}
      {isPublicPage && <CartDrawer />}

      {/* Global Minimal Footer */}
      <footer className="border-t border-border py-6 bg-surface text-center text-xs text-muted no-print min-w-0">
        <Container size="xl" className="space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-muted">
            <span>© 2026 Star Enterprises • Mobiles, Electronics & Modern Furniture</span>
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-text transition-colors">
                Public Store
              </Link>
              <Link to="/login" className="hover:text-text transition-colors font-medium">
                Staff & Admin Portal
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
