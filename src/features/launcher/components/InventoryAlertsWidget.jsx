import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/format';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * Inventory Alerts & Reorder Watchlist Widget
 * @param {Object} props
 * @param {Array} props.alerts
 */
export function InventoryAlertsWidget({ alerts = [] }) {
  const navigate = useNavigate();

  return (
    <Card className="h-full p-6 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-4 min-w-0">
      <div className="space-y-3 min-w-0">
        {/* Header with clean separation between title, badge, and description */}
        <div className="pb-3 border-b border-border space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-text text-base tracking-tight truncate">
              Low-Stock Watchlist
            </h3>
            {alerts.length > 0 ? (
              <Badge variant="danger" className="text-[10px] font-semibold shrink-0">
                {alerts.length} Critical
              </Badge>
            ) : (
              <Badge variant="default" className="text-[10px] font-normal shrink-0">
                Optimal
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted">
            Inventory items at or below reorder threshold
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="py-8 text-center text-muted space-y-2">
            <CheckCircle2 size={24} className="mx-auto text-text" />
            <p className="text-xs">All store inventory levels are currently above reorder limits.</p>
          </div>
        ) : (
          <div className="divide-y divide-border min-w-0">
            {alerts.map((item) => {
              const isMobiles = item.storeCode === 'mobiles';
              return (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs min-w-0"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-text truncate max-w-44 sm:max-w-xs">
                        {item.name}
                      </span>
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0 font-normal">
                        {isMobiles ? 'Mobiles' : 'Furniture'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted flex items-center gap-2">
                      <span className="font-mono">{item.sku}</span>
                      <span>•</span>
                      <span>Selling: {formatCurrency(item.sellingPrice)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-semibold text-danger flex items-center justify-end gap-1">
                      <AlertTriangle size={12} className="shrink-0" />
                      <span>{item.currentStock} left</span>
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      Min: {item.reorderLevel} units
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted text-[11px]">
          Auto-synced with store stock
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/mobiles/inventory')}
          className="text-xs cursor-pointer gap-1"
        >
          <span>Open Full Stock</span>
          <ArrowRight size={13} />
        </Button>
      </div>
    </Card>
  );
}
