import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Button,
  Card,
  Badge,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from '@/shared/ui';
import { useInvoices, useInvoiceDetail } from '../hooks/useBilling';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Printer, Eye } from 'lucide-react';

export function InvoicesListPage() {
  const { store } = useOutletContext();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const { data: invoices = [], isLoading } = useInvoices(store?.id);
  const { data: invoiceDetail, isLoading: detailLoading } = useInvoiceDetail(selectedInvoiceId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text">
            {store?.name} Sales Invoices
          </h1>
          <p className="text-sm text-muted">
            GST compliant sales register, payment modes, and reprint capabilities.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted">Loading invoice register...</div>
      ) : invoices.length === 0 ? (
        <Card className="p-8 text-center text-muted border-dashed">
          No invoices generated yet for this store.
        </Card>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Invoice Number</TableHeaderCell>
              <TableHeaderCell>Date & Time</TableHeaderCell>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Taxable Value</TableHeaderCell>
              <TableHeaderCell>Total GST</TableHeaderCell>
              <TableHeaderCell>Grand Total</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs font-semibold">
                  {inv.invoice_number}
                </TableCell>
                <TableCell className="text-xs text-muted">
                  {formatDate(inv.created_at)}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-text">{inv.customer_name}</div>
                  {inv.customer_phone && (
                    <div className="text-xs text-muted">{inv.customer_phone}</div>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(inv.subtotal)}</TableCell>
                <TableCell>
                  {formatCurrency((inv.cgst_amount || 0) + (inv.sgst_amount || 0))}
                </TableCell>
                <TableCell className="font-semibold text-text">
                  {formatCurrency(inv.grand_total)}
                </TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'paid' ? 'success' : 'danger'}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedInvoiceId(inv.id)}
                  >
                    <Eye size={14} /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoiceId && (
        <Modal
          isOpen={Boolean(selectedInvoiceId)}
          onClose={() => setSelectedInvoiceId(null)}
          title={`Invoice ${invoiceDetail?.invoice_number || ''}`}
          className="max-w-md"
        >
          {detailLoading || !invoiceDetail ? (
            <div className="py-8 text-center text-muted">Loading invoice details...</div>
          ) : (
            <div className="space-y-4">
              <div className="border border-border p-4 rounded bg-surface font-mono text-xs space-y-3">
                <div className="text-center space-y-1">
                  <div className="font-bold text-sm">{invoiceDetail.stores?.name}</div>
                  <div>GSTIN: {invoiceDetail.stores?.gstin}</div>
                  <div>{invoiceDetail.stores?.address_line1}, {invoiceDetail.stores?.city}</div>
                </div>

                <div className="border-t border-b border-dashed border-border py-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice: {invoiceDetail.invoice_number}</span>
                    <span>{formatDate(invoiceDetail.created_at)}</span>
                  </div>
                  <div>Customer: {invoiceDetail.customer_name}</div>
                  {invoiceDetail.customer_phone && <div>Phone: {invoiceDetail.customer_phone}</div>}
                  {invoiceDetail.customer_gstin && <div>Customer GSTIN: {invoiceDetail.customer_gstin}</div>}
                </div>

                <div className="space-y-1">
                  {invoiceDetail.items?.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-border/50">
                      <div>
                        <div>{item.item_name}</div>
                        {item.serial_number && (
                          <div className="text-[10px] text-muted">SN: {item.serial_number}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div>{formatCurrency(item.total_amount)}</div>
                        <div className="text-[10px] text-muted">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-border pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal</span>
                    <span>{formatCurrency(invoiceDetail.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST</span>
                    <span>{formatCurrency(invoiceDetail.cgst_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST</span>
                    <span>{formatCurrency(invoiceDetail.sgst_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-border">
                    <span>Grand Total</span>
                    <span>{formatCurrency(invoiceDetail.grand_total)}</span>
                  </div>
                </div>

                {invoiceDetail.payments?.length > 0 && (
                  <div className="border-t border-dashed border-border pt-2 space-y-1">
                    <span className="font-semibold">Payments:</span>
                    {invoiceDetail.payments.map((p, i) => (
                      <div key={i} className="flex justify-between text-muted">
                        <span className="uppercase">{p.payment_method}</span>
                        <span>{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedInvoiceId(null)}>
                  Close
                </Button>
                <Button variant="solid" onClick={() => window.print()}>
                  <Printer size={16} /> Print Receipt
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
