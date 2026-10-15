import { useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '@/shared/ui';
import { useOwnerOverview } from '../hooks/useReports';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { TrendingUp, Package, DollarSign, ArrowLeft } from 'lucide-react';

export function OwnerDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useOwnerOverview();

  if (isLoading) {
    return (
      <Container size="xl" className="py-16 text-center text-muted">
        Loading consolidated owner financials...
      </Container>
    );
  }

  const invoices = data?.invoices || [];
  const products = data?.products || [];

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

  // Per Store breakdown
  const mobilesSales = invoices
    .filter((inv) => inv.stores?.code === 'mobiles')
    .reduce((acc, inv) => acc + (parseFloat(inv.grand_total) || 0), 0);

  const feSales = invoices
    .filter((inv) => inv.stores?.code === 'furniture-electronics')
    .reduce((acc, inv) => acc + (parseFloat(inv.grand_total) || 0), 0);

  return (
    <Container size="xl" className="py-8 space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft size={16} /> Launcher
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-text">
              Owner Consolidated Overview
            </h1>
            <p className="text-sm text-muted">
              Live multi-store sales, tax liability, and inventory asset valuation.
            </p>
          </div>
        </div>
        <Badge variant="accent">Global Owner Access</Badge>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Combined Sales</span>
            <DollarSign size={18} />
          </div>
          <div className="text-2xl font-semibold text-text">{formatCurrency(totalSales)}</div>
          <div className="text-xs text-muted">Across Mobiles & Furniture</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">GST Collected</span>
            <TrendingUp size={18} />
          </div>
          <div className="text-2xl font-semibold text-text">{formatCurrency(totalTax)}</div>
          <div className="text-xs text-muted">GSTR-1 Liability (CGST + SGST)</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Asset Value</span>
            <Package size={18} />
          </div>
          <div className="text-2xl font-semibold text-text">{formatCurrency(totalInventoryValue)}</div>
          <div className="text-xs text-muted">Total Cost Valuation on Hand</div>
        </Card>
      </div>

      {/* Store Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        <Card className="p-6 space-y-4">
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
            className="w-full"
            onClick={() => navigate('/admin/mobiles')}
          >
            Open Mobiles Workspace
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
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
            className="w-full"
            onClick={() => navigate('/admin/furniture-electronics')}
          >
            Open Furniture & Electronics Workspace
          </Button>
        </Card>
      </div>

      {/* Combined Recent Invoices Table */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text">Consolidated Recent Sales Across Stores</h3>
        {invoices.length === 0 ? (
          <Card className="p-8 text-center text-muted border-dashed">
            No sales recorded yet across stores.
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
              {invoices.slice(0, 10).map((inv) => (
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
                  <TableCell className="font-semibold">
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
