import { Card } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/format';
import { QrCode, Banknote, CreditCard, Landmark } from 'lucide-react';

/**
 * Payment Methods & Store Contribution Widget
 * @param {Object} props
 * @param {Object} props.payments
 * @param {Object} props.stores
 * @param {number} props.totalSales
 */
export function PaymentSplitWidget({ payments = {}, stores = {}, totalSales = 0 }) {
  const mobilesSales = stores.mobiles?.sales || 0;
  const feSales = stores['furniture-electronics']?.sales || 0;
  const combinedStoreSales = mobilesSales + feSales;

  const mobilesPct = combinedStoreSales > 0 ? Math.round((mobilesSales / combinedStoreSales) * 100) : 50;
  const fePct = combinedStoreSales > 0 ? 100 - mobilesPct : 50;

  const { upi = 0, cash = 0, card = 0, emi = 0 } = payments;
  const effectiveTotal = (upi + cash + card + emi) || totalSales || 1;

  const methods = [
    {
      key: 'cash',
      label: 'Cash at Counter',
      amount: cash,
      pct: Math.round((cash / effectiveTotal) * 100),
      icon: Banknote,
    },
    {
      key: 'upi',
      label: 'UPI (QR / GPay / PhonePe)',
      amount: upi,
      pct: Math.round((upi / effectiveTotal) * 100),
      icon: QrCode,
    },
    {
      key: 'card',
      label: 'Card POS Terminal',
      amount: card,
      pct: Math.round((card / effectiveTotal) * 100),
      icon: CreditCard,
    },
    {
      key: 'emi',
      label: 'Consumer Finance (EMI)',
      amount: emi,
      pct: Math.round((emi / effectiveTotal) * 100),
      icon: Landmark,
    },
  ];

  return (
    <Card className="h-full p-6 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-5 min-w-0">
      <div className="space-y-4 min-w-0">
        {/* Clean Header with Dedicated Subtitle */}
        <div className="pb-3 border-b border-border space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-text text-base tracking-tight truncate">
              Payment & Store Share
            </h3>
            <span className="text-[11px] font-mono text-muted shrink-0">Live Split</span>
          </div>
          <p className="text-xs text-muted">
            Revenue contribution across branches & channels
          </p>
        </div>

        {/* Store Contribution Bar */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center justify-between text-xs min-w-0">
            <span className="text-text font-medium truncate">
              Mobiles: <span className="text-muted">{formatCurrency(mobilesSales)}</span> ({mobilesPct}%)
            </span>
            <span className="text-text font-medium truncate text-right">
              Furniture: <span className="text-muted">{formatCurrency(feSales)}</span> ({fePct}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full border border-border bg-bg overflow-hidden flex">
            <div
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${mobilesPct}%` }}
              title={`Mobiles: ${mobilesPct}%`}
            />
            <div
              className="bg-muted/40 h-full transition-all duration-300"
              style={{ width: `${fePct}%` }}
              title={`Furniture & Electronics: ${fePct}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
              <span>Star Mobiles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted/40 shrink-0" />
              <span>Star Furniture</span>
            </div>
          </div>
        </div>

        {/* Single-Column Payment Channels List (Never wrapped or cramped) */}
        <div className="space-y-2 pt-2 border-t border-border min-w-0">
          <div className="text-xs font-semibold text-text uppercase tracking-wider">
            Payment Mode Mix
          </div>

          <div className="space-y-2 min-w-0">
            {methods.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.key}
                  className="p-2.5 rounded-lg border border-border bg-bg/50 flex items-center justify-between gap-3 min-w-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md border border-border bg-surface flex items-center justify-center text-text shrink-0">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-text truncate">{m.label}</div>
                      <div className="text-[11px] text-muted">{m.pct}% of collections</div>
                    </div>
                  </div>
                  <div className="font-semibold text-text text-xs shrink-0 text-right">
                    {formatCurrency(m.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
