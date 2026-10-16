import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/shared/ui';
import { useOwnerOverview } from '../hooks/useReports';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { TrendingUp, Package, IndianRupee, ArrowLeft, Receipt } from 'lucide-react';

export function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('all');
  const { data, isLoading } = useOwnerOverview();

  const invoices = useMemo(() => data?.invoices || [], [data?.invoices]);
  const products = useMemo(() => data?.products || [], [data?.products]);

  // Aggregations
  const totalSales = invoices.reduce((acc, inv) => acc + (parseFloat(inv.grand_total) || 0), 0);
  const totalTax = invoices.reduce(
    (acc, inv) => acc + (parseFloat(inv.cgst_amount) || 0) + (parseFloat(inv.sgst_amount) || 0),
    0
  );
  const totalInventoryValue = products.reduce((acc, prod) => {
    const qty = prod.inventory?.[0]?.quantity_on_hand ?? 0;
    return acc + (parseFloat(prod.cost_price) || 0) * qty;
  }, 0);

  const avgCostRatio = products.length > 0
    ? products.reduce((acc, p) => acc + ((parseFloat(p.cost_price) || 0) / (parseFloat(p.selling_price) || 1)), 0) / products.length
    : 0.82;
  const estimatedMargin = totalSales > 0 ? totalSales * (1 - avgCostRatio) : 0;
  const marginPercentage = totalSales > 0 ? (estimatedMargin / totalSales) * 100 : 0;

  // Per Store breakdown
  const mobilesSales = invoices
    .filter((inv) => inv.stores?.code === 'mobiles')
    .reduce((acc, inv) => acc + (parseFloat(inv.grand_total) || 0), 0);

  const feSales = invoices
    .filter((inv) => inv.stores?.code === 'furniture-electronics')
    .reduce((acc, inv) => acc + (parseFloat(inv.grand_total) || 0), 0);

  const filteredInvoices = useMemo(() => {
    if (selectedStoreFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.stores?.code === selectedStoreFilter);
  }, [invoices, selectedStoreFilter]);

  if (isLoading) {
    return (
      <Container size="xl" className="py-16 text-center text-muted">
        Loading consolidated owner financials...
      </Container>
    );
  }

  return (
    <Container size="xl" className="py-8 space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft size={16} /> Launcher
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-text">
              Owner Consolidated Overview
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Live multi-store sales, tax liability, and inventory asset valuation.
            </p>
          </div>
        </div>
        <Badge variant="accent">Global Owner Access</Badge>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Card className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-3 min-w-0">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <div className="w-8 h-8 rounded-lg border border-border bg-bg flex items-center justify-center text-text shrink-0">
              <IndianRupee size={15} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-text tracking-tight truncate">{formatCurrency(totalSales)}</div>
            <div className="text-xs text-muted mt-1 truncate">Across Mobiles & Furniture</div>
          </div>
        </Card>

        <Card className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-3 min-w-0">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Gross Margin</span>
            <div className="w-8 h-8 rounded-lg border border-border bg-bg flex items-center justify-center text-text shrink-0">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-text tracking-tight truncate">{formatCurrency(estimatedMargin)}</div>
            <div className="text-xs text-muted mt-1 truncate">{marginPercentage.toFixed(1)}% catalog markup</div>
          </div>
        </Card>

        <Card className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-3 min-w-0">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">GST Output Tax</span>
            <div className="w-8 h-8 rounded-lg border border-border bg-bg flex items-center justify-center text-text shrink-0">
              <Receipt size={15} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-text tracking-tight truncate">{formatCurrency(totalTax)}</div>
            <div className="text-xs text-muted mt-1 truncate">GSTR-1 Liability (CGST + SGST)</div>
          </div>
        </Card>

        <Card className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-3 min-w-0">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Valuation</span>
            <div className="w-8 h-8 rounded-lg border border-border bg-bg flex items-center justify-center text-text shrink-0">
              <Package size={15} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-text tracking-tight truncate">{formatCurrency(totalInventoryValue)}</div>
            <div className="text-xs text-muted mt-1 truncate">Total Cost Valuation on Hand</div>
          </div>
        </Card>
      </div>

      {/* Store Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        <Card className="p-6 rounded-xl border border-border bg-surface space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-semibold text-text">Star Mobiles Branch</h3>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Total Invoiced:</span>
              <span className="font-semibold text-text">{formatCurrency(mobilesSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Invoice Prefix:</span>
              <span className="font-mono">MOB-2026</span>
            </div>
          </div>
          <Button
            variant="solid"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/admin/mobiles')}
          >
            Open Mobiles Workspace
          </Button>
        </Card>

        <Card className="p-6 rounded-xl border border-border bg-surface space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-semibold text-text">Star Furniture & Electronics</h3>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Total Invoiced:</span>
              <span className="font-semibold text-text">{formatCurrency(feSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Invoice Prefix:</span>
              <span className="font-mono">FE-2026</span>
            </div>
          </div>
          <Button
            variant="solid"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/admin/furniture-electronics')}
          >
            Open Furniture & Electronics Workspace
          </Button>
        </Card>
      </div>

      {/* Combined Recent Invoices Table with Filter Pills */}
      <div className="space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-text text-base">Consolidated Sales Ledger</h3>
            <p className="text-xs text-muted">All customer invoices across both showroom branches</p>
          </div>

          <div className="flex items-center bg-surface border border-border rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStoreFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                selectedStoreFilter === 'all'
                  ? 'bg-accent text-accent-fg'
                  : 'text-muted hover:text-text hover:bg-bg'
              }`}
            >
              All Stores
            </button>
            <button
              type="button"
              onClick={() => setSelectedStoreFilter('mobiles')}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                selectedStoreFilter === 'mobiles'
                  ? 'bg-accent text-accent-fg'
                  : 'text-muted hover:text-text hover:bg-bg'
              }`}
            >
              Mobiles
            </button>
            <button
              type="button"
              onClick={() => setSelectedStoreFilter('furniture-electronics')}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                selectedStoreFilter === 'furniture-electronics'
                  ? 'bg-accent text-accent-fg'
                  : 'text-muted hover:text-text hover:bg-bg'
              }`}
            >
              Furniture & Electronics
            </button>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <Card className="p-8 text-center text-muted border-dashed rounded-xl">
            No sales recorded yet for the selected store.
          </Card>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Store</TableHeaderCell>
                <TableHeaderCell>Invoice Number</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Taxable Value</TableHeaderCell>
                <TableHeaderCell>GST</TableHeaderCell>
                <TableHeaderCell>Grand Total</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.slice(0, 15).map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Badge variant="default">{inv.stores?.name}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {inv.invoice_number}
                  </TableCell>
                  <TableCell className="text-xs text-muted">
                    {formatDate(inv.created_at)}
                  </TableCell>
                  <TableCell>{formatCurrency(inv.subtotal)}</TableCell>
                  <TableCell>
                    {formatCurrency((inv.cgst_amount || 0) + (inv.sgst_amount || 0))}
                  </TableCell>
                  <TableCell className="font-semibold text-text">
                    {formatCurrency(inv.grand_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Container>
  );
}
