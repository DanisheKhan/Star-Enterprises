import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Modal } from '@/shared/ui';
import { useStores } from '@/features/stores';
import { useAuth, LoginForm } from '@/features/auth';
import { Smartphone, Tv, Store, ArrowRight, LogIn, Users } from 'lucide-react';

export function LauncherPage() {
  const navigate = useNavigate();
  const { isOwner, canAccessStore, user } = useAuth();
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
          Logged in as <span className="font-semibold text-text">Store Owner (Admin)</span>. Select your store branch or administrative module to begin operations.
        </p>

        {!user && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full border border-border text-muted hover:text-text hover:bg-bg cursor-pointer transition-colors"
            >
              <LogIn size={13} /> Owner Sign In
            </button>
          </div>
        )}
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
                className="gap-2 rounded-full px-7 cursor-pointer"
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
                className="gap-2 rounded-full px-7 cursor-pointer"
              >
                Start Furniture & Electronics <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Owner Command Modules */}
      {isOwner && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl border border-border bg-bg/80 flex items-center justify-center text-text shadow-sm shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-base text-text">Staff Management System</h3>
                <p className="text-xs text-muted mt-0.5">
                  Manage staff directory, review leaves, and process monthly salaries.
                </p>
              </div>
            </div>
            <Button variant="solid" onClick={() => navigate('/admin/staff')} className="w-full text-xs cursor-pointer">
              Open Staff Management (HRMS) →
            </Button>
          </Card>

          <Card className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl border border-border bg-bg/80 flex items-center justify-center text-text shadow-sm shrink-0">
                <Store size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-base text-text">Owner Master Dashboard</h3>
                <p className="text-xs text-muted mt-0.5">
                  Combined financials, profit margins, stock valuation, and GST registers.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin/all')} className="w-full text-xs cursor-pointer">
              View Consolidated Analytics →
            </Button>
          </Card>
        </div>
      )}

      {/* Sign In Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Store Owner Sign In"
        size="md"
      >
        <LoginForm onSuccess={() => setIsLoginModalOpen(false)} />
      </Modal>
    </div>
  );
}
