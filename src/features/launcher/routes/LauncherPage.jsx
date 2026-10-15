import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '@/shared/ui';
import { useStores } from '@/features/stores';
import { useAuth } from '@/features/auth';
import { Smartphone, Tv, Store, ArrowRight } from 'lucide-react';

export function LauncherPage() {
  const navigate = useNavigate();
  const { isOwner, canAccessStore, profile } = useAuth();
  const { data: stores = [], isLoading } = useStores();

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
      <div className="text-center space-y-2">
        <Badge variant="accent" className="mb-2">
          Star Enterprises POS & ERP
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold text-text">
          Select Store Workspace
        </h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          Logged in as <span className="font-semibold text-text">{profile?.full_name || 'Staff Member'}</span>{' '}
          ({profile?.role || 'cashier'}). Select your assigned branch workspace to begin operations.
        </p>
      </div>

      {/* Two Master Buttons / Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        {/* Mobiles Store Card */}
        {mobilesStore && (
          <Card
            className={`p-6 sm:p-8 flex flex-col justify-between transition-all border ${
              canAccessStore(mobilesStore.id)
                ? 'hover:border-accent cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded border border-border bg-bg flex items-center justify-center text-text">
                <Smartphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text">{mobilesStore.name}</h2>
                <p className="text-sm text-muted mt-1">
                  New phones, certified pre-owned mobiles, IMEI tracking, intake workflow, and accessories.
                </p>
              </div>
              <div className="text-xs text-muted space-y-1 pt-2 border-t border-border">
                <div>GSTIN: {mobilesStore.gstin}</div>
                <div>Invoice Series: {mobilesStore.invoice_prefix}-2026-XXXX</div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Branch #1</span>
              <Button
                variant="solid"
                disabled={!canAccessStore(mobilesStore.id)}
                onClick={() => handleStartStore(mobilesStore)}
                className="gap-2"
              >
                Start Mobiles <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}

        {/* Furniture & Electronics Card */}
        {feStore && (
          <Card
            className={`p-6 sm:p-8 flex flex-col justify-between transition-all border ${
              canAccessStore(feStore.id)
                ? 'hover:border-accent cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded border border-border bg-bg flex items-center justify-center text-text">
                <Tv size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text">{feStore.name}</h2>
                <p className="text-sm text-muted mt-1">
                  Televisions, refrigerators, home appliances, living room and bedroom furniture.
                </p>
              </div>
              <div className="text-xs text-muted space-y-1 pt-2 border-t border-border">
                <div>GSTIN: {feStore.gstin}</div>
                <div>Invoice Series: {feStore.invoice_prefix}-2026-XXXX</div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Branch #2</span>
              <Button
                variant="solid"
                disabled={!canAccessStore(feStore.id)}
                onClick={() => handleStartStore(feStore)}
                className="gap-2"
              >
                Start Furniture & Electronics <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Owner Global View */}
      {isOwner && (
        <Card className="p-6 bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-border bg-bg flex items-center justify-center text-text">
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-text">Owner Master Dashboard</h3>
              <p className="text-xs text-muted">
                Combined financials, multi-store profit margins, inventory valuation, and GST registers.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/all')}>
            View Consolidated Analytics
          </Button>
        </Card>
      )}
    </div>
  );
}
