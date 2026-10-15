import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Modal } from '@/shared/ui';
import { useStores } from '@/features/stores';
import { useAuth, LoginForm } from '@/features/auth';
import { Smartphone, Tv, Store, ArrowRight, UserCheck, LogIn } from 'lucide-react';

export function LauncherPage() {
  const navigate = useNavigate();
  const { isOwner, canAccessStore, profile, demoRole, setDemoRole, user } = useAuth();
  const { data: stores = [], isLoading } = useStores();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  function handleStartStore(store) {
    navigate(`/admin/${store.code}`);
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center text-muted">
        Loading stores and workspace assignments...
      </div>
    );
  }

  const mobilesStore = stores.find((s) => s.code === 'mobiles');
  const feStore = stores.find((s) => s.code === 'furniture-electronics');

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 min-w-0">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="accent" className="mb-2 px-4 py-1.5 text-xs rounded-full font-medium shadow-sm">
          Star Enterprises POS & ERP
        </Badge>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-text">
          Select Store Workspace
        </h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          Logged in as <span className="font-semibold text-text">{profile?.full_name || 'Staff Member'}</span>{' '}
          ({profile?.role || 'cashier'}). Select your assigned branch workspace to begin operations.
        </p>

        {/* Demo Persona Switcher Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted flex items-center gap-1.5 mr-1">
            <UserCheck size={14} /> Active Persona:
          </span>
          <button
            type="button"
            onClick={() => setDemoRole('owner')}
            className={`px-3.5 py-1.5 text-xs rounded-full border cursor-pointer font-medium transition-all ${
              demoRole === 'owner'
                ? 'bg-accent text-accent-fg border-accent shadow-sm'
                : 'bg-surface text-text border-border hover:bg-bg'
            }`}
          >
            Owner (All Access)
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('mobiles_cashier')}
            className={`px-3.5 py-1.5 text-xs rounded-full border cursor-pointer font-medium transition-all ${
              demoRole === 'mobiles_cashier'
                ? 'bg-accent text-accent-fg border-accent shadow-sm'
                : 'bg-surface text-text border-border hover:bg-bg'
            }`}
          >
            Mobiles Cashier
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('fe_cashier')}
            className={`px-3.5 py-1.5 text-xs rounded-full border cursor-pointer font-medium transition-all ${
              demoRole === 'fe_cashier'
                ? 'bg-accent text-accent-fg border-accent shadow-sm'
                : 'bg-surface text-text border-border hover:bg-bg'
            }`}
          >
            Furniture Cashier
          </button>
          {!user && (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3.5 py-1.5 text-xs rounded-full border border-border text-muted hover:text-text hover:bg-bg cursor-pointer ml-2 flex items-center gap-1.5 transition-colors"
            >
              <LogIn size={13} /> Sign In
            </button>
          )}
        </div>
      </div>

      {/* Two Master Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        {/* Mobiles Store Card */}
        {mobilesStore && (
          <Card
            className={`p-7 sm:p-9 rounded-3xl flex flex-col justify-between transition-all border ${
              canAccessStore(mobilesStore.id)
                ? 'hover:border-accent hover:shadow-sm cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-3xl border border-border bg-bg/80 flex items-center justify-center text-text shadow-sm">
                <Smartphone size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-text tracking-tight">{mobilesStore.name}</h2>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  New phones, certified pre-owned mobiles, IMEI tracking, intake workflow, and accessories.
                </p>
              </div>
              <div className="text-xs text-muted space-y-1.5 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span>GSTIN:</span>
                  <span className="font-mono text-text">{mobilesStore.gstin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Invoice Series:</span>
                  <span className="font-mono text-text">{mobilesStore.invoice_prefix}-2026-XXXX</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
              <Badge variant="default" className="rounded-full px-3.5 py-1">
                Branch #1
              </Badge>
              <Button
                variant="solid"
                disabled={!canAccessStore(mobilesStore.id)}
                onClick={() => handleStartStore(mobilesStore)}
                className="gap-2 rounded-full px-7"
              >
                Start Mobiles <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}

        {/* Furniture & Electronics Card */}
        {feStore && (
          <Card
            className={`p-7 sm:p-9 rounded-3xl flex flex-col justify-between transition-all border ${
              canAccessStore(feStore.id)
                ? 'hover:border-accent hover:shadow-sm cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-3xl border border-border bg-bg/80 flex items-center justify-center text-text shadow-sm">
                <Tv size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-text tracking-tight">{feStore.name}</h2>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  Televisions, refrigerators, home appliances, living room and bedroom furniture.
                </p>
              </div>
              <div className="text-xs text-muted space-y-1.5 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span>GSTIN:</span>
                  <span className="font-mono text-text">{feStore.gstin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Invoice Series:</span>
                  <span className="font-mono text-text">{feStore.invoice_prefix}-2026-XXXX</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
              <Badge variant="default" className="rounded-full px-3.5 py-1">
                Branch #2
              </Badge>
              <Button
                variant="solid"
                disabled={!canAccessStore(feStore.id)}
                onClick={() => handleStartStore(feStore)}
                className="gap-2 rounded-full px-7"
              >
                Start Furniture & Electronics <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Owner Global View */}
      {isOwner && (
        <Card className="p-6 sm:p-7 rounded-3xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-border bg-bg/80 flex items-center justify-center text-text shadow-sm shrink-0">
              <Store size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-base text-text">Owner Master Dashboard</h3>
              <p className="text-xs text-muted mt-0.5">
                Combined financials, multi-store profit margins, inventory valuation, and GST registers.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/all')} className="rounded-full shrink-0">
            View Consolidated Analytics
          </Button>
        </Card>
      )}

      {/* Sign In Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Staff Sign In"
        className="max-w-sm rounded-3xl"
      >
        <LoginForm onSuccess={() => setIsLoginModalOpen(false)} />
      </Modal>
    </div>
  );
}
