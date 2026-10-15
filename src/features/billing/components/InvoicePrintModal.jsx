import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal, Button, Badge } from '@/shared/ui';
import { formatCurrency, formatDate, amountToWords } from '@/shared/lib/format';
import { Printer, FileText, Receipt, CheckCircle, Smartphone } from 'lucide-react';

/**
 * InvoicePrintModal renders both 80mm thermal receipt and normal A4 GST tax invoice,
 * providing live preview switching and isolated single-page printing via #print-portal.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {Object} props.invoiceDetail
 */
export function InvoicePrintModal({ isOpen, onClose, invoiceDetail }) {
  const [format, setFormat] = useState('80mm'); // '80mm' | 'normal'
  const [printPortalNode, setPrintPortalNode] = useState(null);

  useEffect(() => {
    let portal = document.getElementById('print-portal');
    if (!portal && typeof document !== 'undefined') {
      portal = document.createElement('div');
      portal.id = 'print-portal';
      document.body.appendChild(portal);
    }
    setPrintPortalNode(portal);
  }, []);

  if (!isOpen || !invoiceDetail) return null;

  const store = invoiceDetail.stores || {};
  const items = invoiceDetail.items || [];
  const payments = invoiceDetail.payments || [];
  const grandTotal = Number(invoiceDetail.grand_total || 0);
  const subtotal = Number(invoiceDetail.subtotal || 0);
  const cgstAmount = Number(invoiceDetail.cgst_amount || 0);
  const sgstAmount = Number(invoiceDetail.sgst_amount || 0);
  const discountAmount = Number(invoiceDetail.discount_amount || 0);

  function triggerPrint(targetFormat) {
    setFormat(targetFormat);
    // Allow React state to update before opening print dialog
    setTimeout(() => {
      document.body.classList.add('printing-portal-active');
      window.addEventListener(
        'afterprint',
        () => {
          document.body.classList.remove('printing-portal-active');
        },
        { once: true }
      );
      window.print();
    }, 100);
  }

  /* ------------------------------------------------------------- */
  /* 80mm THERMAL RECEIPT COMPONENT (Clean, single-page roll)       */
  /* ------------------------------------------------------------- */
  const thermalReceiptNode = (
    <div className="bill-container-80mm">
      <div className="text-center pb-2 border-b border-dashed border-black">
        <div className="font-bold text-sm tracking-wide uppercase">{store.name || 'STAR ENTERPRISES'}</div>
        <div>{store.address_line1}, {store.city} {store.pincode ? `- ${store.pincode}` : ''}</div>
        <div>GSTIN: {store.gstin || 'N/A'}</div>
        <div>Ph: {store.phone || 'N/A'}</div>
        <div className="font-bold pt-1 uppercase text-[10px] tracking-wider">*** TAX INVOICE ***</div>
      </div>

      <div className="py-2 border-b border-dashed border-black text-[10.5px]">
        <div className="flex justify-between">
          <span>Inv: {invoiceDetail.invoice_number}</span>
          <span>{formatDate(invoiceDetail.created_at, false)}</span>
        </div>
        <div className="flex justify-between">
          <span>Time: {formatDate(invoiceDetail.created_at, true).split(',')[1] || ''}</span>
          <span>FY: {invoiceDetail.financial_year || '2026-27'}</span>
        </div>
        <div>Customer: {invoiceDetail.customer_name}</div>
        {invoiceDetail.customer_phone && <div>Phone: {invoiceDetail.customer_phone}</div>}
        {invoiceDetail.customer_gstin && <div>GSTIN: {invoiceDetail.customer_gstin}</div>}
      </div>

      {/* Items List */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="flex justify-between font-bold text-[10px] pb-1 uppercase border-b border-black">
          <span className="w-1/2">Item</span>
          <span className="w-12 text-center">Qty</span>
          <span className="w-16 text-right">Rate</span>
          <span className="w-16 text-right">Total</span>
        </div>

        <div className="pt-1">
          {items.map((item, idx) => (
            <div key={idx} className="py-1 border-b border-dotted border-gray-400">
              <div className="font-medium">{item.item_name}</div>
              {item.serial_number && (
                <div className="text-[9.5px] text-gray-700">SN: {item.serial_number}</div>
              )}
              {item.hsn_code && (
                <div className="text-[9.5px] text-gray-700">HSN: {item.hsn_code}</div>
              )}
              <div className="flex justify-between text-[10px] pt-0.5">
                <span className="w-1/2" />
                <span className="w-12 text-center">{item.quantity}</span>
                <span className="w-16 text-right">{formatCurrency(item.unit_price)}</span>
                <span className="w-16 text-right font-medium">{formatCurrency(item.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="py-2 border-b border-dashed border-black text-[10.5px] space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal, true)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatCurrency(discountAmount, true)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>CGST:</span>
          <span>{formatCurrency(cgstAmount, true)}</span>
        </div>
        <div className="flex justify-between">
          <span>SGST:</span>
          <span>{formatCurrency(sgstAmount, true)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
          <span>GRAND TOTAL:</span>
          <span>{formatCurrency(grandTotal, true)}</span>
        </div>
      </div>

      {/* Payment details */}
      <div className="py-2 border-b border-dashed border-black text-[10px]">
        <div className="font-bold uppercase">Payment Summary:</div>
        {payments.length > 0 ? (
          payments.map((p, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="uppercase">{p.payment_method}</span>
              <span>{formatCurrency(p.amount, true)}</span>
              {p.reference_number && <span>Ref: {p.reference_number}</span>}
            </div>
          ))
        ) : (
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="uppercase">{invoiceDetail.status || 'PAID'}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-2 text-[9.5px] space-y-0.5">
        <div>Prices are inclusive of all GST.</div>
        <div>Thank you for shopping with Star Enterprises!</div>
        <div>Goods once sold subject to warranty terms.</div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------- */
  /* NORMAL BILL COMPONENT (Full A4 GST Tax Invoice)               */
  /* ------------------------------------------------------------- */
  const normalBillNode = (
    <div className="bill-container-normal">
      {/* Official Top Bar */}
      <div className="flex justify-between items-center pb-2 border-b-2 border-black">
        <div>
          <div className="text-xl font-bold tracking-tight uppercase">TAX INVOICE</div>
          <div className="text-[10px] text-gray-600">Issued under Section 31 of CGST Act, 2017</div>
        </div>
        <div className="text-right text-[10px]">
          <div className="font-semibold uppercase tracking-wider px-2 py-0.5 border border-black inline-block">
            Original For Recipient
          </div>
          <div className="pt-1 text-gray-600">Place of Supply: Maharashtra (27)</div>
        </div>
      </div>

      {/* Seller & Invoice Meta Header */}
      <div className="grid grid-cols-2 gap-4 py-3 border-b border-black text-[11px]">
        {/* Seller Info */}
        <div className="space-y-0.5">
          <div className="font-bold text-sm tracking-wide text-black">{store.name || 'STAR ENTERPRISES'}</div>
          <div>{store.address_line1}, {store.city} {store.pincode ? `- ${store.pincode}` : ''}</div>
          <div><span className="font-semibold">GSTIN:</span> {store.gstin || '27AAAAA0000A1Z5'}</div>
          <div><span className="font-semibold">State:</span> Maharashtra (State Code: 27)</div>
          <div><span className="font-semibold">Phone:</span> {store.phone || 'N/A'}</div>
          {store.email && <div><span className="font-semibold">Email:</span> {store.email}</div>}
        </div>

        {/* Invoice Meta */}
        <div className="border border-black p-2 rounded text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Invoice Number:</span>
            <span className="font-bold font-mono">{invoiceDetail.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Invoice Date:</span>
            <span>{formatDate(invoiceDetail.created_at, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Financial Year:</span>
            <span>{invoiceDetail.financial_year || '2026-27'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Payment Status:</span>
            <span className="uppercase font-semibold">{invoiceDetail.status || 'PAID'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Reverse Charge:</span>
            <span>No</span>
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="py-2.5 border-b border-black text-[11px] bg-gray-50/50">
        <div className="font-semibold text-[10px] uppercase tracking-wider text-gray-600 pb-1">
          Details of Receiver / Billed To:
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div><span className="font-semibold">Name:</span> {invoiceDetail.customer_name || 'Walk-in Customer'}</div>
            <div><span className="font-semibold">Phone:</span> {invoiceDetail.customer_phone || 'N/A'}</div>
          </div>
          <div>
            <div><span className="font-semibold">GSTIN:</span> {invoiceDetail.customer_gstin || 'Consumer / Unregistered'}</div>
            <div><span className="font-semibold">State:</span> Maharashtra (27)</div>
          </div>
        </div>
      </div>

      {/* GST Product Table */}
      <div className="pt-3">
        <table className="w-full border-collapse border border-black text-[10.5px]">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-center font-bold">
              <th className="border border-black p-1.5 w-8">#</th>
              <th className="border border-black p-1.5 text-left">Description of Goods</th>
              <th className="border border-black p-1.5 w-16">HSN/SAC</th>
              <th className="border border-black p-1.5 w-10">Qty</th>
              <th className="border border-black p-1.5 w-18 text-right">Unit Rate (₹)</th>
              <th className="border border-black p-1.5 w-20 text-right">Taxable (₹)</th>
              <th className="border border-black p-1.5 w-18 text-right">CGST</th>
              <th className="border border-black p-1.5 w-18 text-right">SGST</th>
              <th className="border border-black p-1.5 w-22 text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-black">
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5">
                  <div className="font-semibold">{item.item_name}</div>
                  {item.serial_number && (
                    <div className="text-[9.5px] font-mono text-gray-600">
                      IMEI / Serial No: {item.serial_number}
                    </div>
                  )}
                </td>
                <td className="border border-black p-1.5 text-center font-mono">{item.hsn_code || '8517'}</td>
                <td className="border border-black p-1.5 text-center">{item.quantity}</td>
                <td className="border border-black p-1.5 text-right">{formatCurrency(item.unit_price, true)}</td>
                <td className="border border-black p-1.5 text-right font-medium">
                  {formatCurrency(item.taxable_value || item.unit_price * item.quantity, true)}
                </td>
                <td className="border border-black p-1.5 text-right">
                  <div>{formatCurrency(item.cgst_amount || 0, true)}</div>
                  <div className="text-[9px] text-gray-500">{(Number(item.gst_rate || 18) / 2).toFixed(1)}%</div>
                </td>
                <td className="border border-black p-1.5 text-right">
                  <div>{formatCurrency(item.sgst_amount || 0, true)}</div>
                  <div className="text-[9px] text-gray-500">{(Number(item.gst_rate || 18) / 2).toFixed(1)}%</div>
                </td>
                <td className="border border-black p-1.5 text-right font-bold">
                  {formatCurrency(item.total_amount, true)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold bg-gray-50 border-t border-black">
              <td colSpan={3} className="border border-black p-1.5 text-right font-bold">
                Total Summary:
              </td>
              <td className="border border-black p-1.5 text-center font-bold">
                {items.reduce((acc, it) => acc + (it.quantity || 1), 0)}
              </td>
              <td className="border border-black p-1.5" />
              <td className="border border-black p-1.5 text-right font-bold">
                {formatCurrency(subtotal, true)}
              </td>
              <td className="border border-black p-1.5 text-right font-bold">
                {formatCurrency(cgstAmount, true)}
              </td>
              <td className="border border-black p-1.5 text-right font-bold">
                {formatCurrency(sgstAmount, true)}
              </td>
              <td className="border border-black p-1.5 text-right font-bold text-sm">
                {formatCurrency(grandTotal, true)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Amount in words & Final Calculation Block */}
      <div className="grid grid-cols-12 border border-t-0 border-black text-[11px]">
        <div className="col-span-7 p-2.5 border-r border-black flex flex-col justify-between">
          <div>
            <div className="font-semibold text-gray-700">Invoice Amount in Words:</div>
            <div className="font-bold text-black pt-0.5">{amountToWords(grandTotal)}</div>
          </div>
          <div className="pt-3">
            <div className="font-semibold text-gray-700">Payment Breakdown:</div>
            {payments.length > 0 ? (
              payments.map((p, i) => (
                <div key={i} className="text-gray-800">
                  Paid via <span className="font-semibold uppercase">{p.payment_method}</span>: {formatCurrency(p.amount, true)}
                  {p.reference_number ? ` (Ref: ${p.reference_number})` : ''}
                </div>
              ))
            ) : (
              <div className="text-gray-800">Paid in full (Cash / POS Terminal)</div>
            )}
          </div>
        </div>

        <div className="col-span-5 p-2.5 space-y-1">
          <div className="flex justify-between text-gray-700">
            <span>Taxable Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal, true)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Trade Discount:</span>
              <span className="font-medium">-{formatCurrency(discountAmount, true)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-700">
            <span>Central GST (CGST):</span>
            <span className="font-medium">{formatCurrency(cgstAmount, true)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>State GST (SGST):</span>
            <span className="font-medium">{formatCurrency(sgstAmount, true)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-black text-black">
            <span>Grand Total:</span>
            <span>{formatCurrency(grandTotal, true)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions & Signatures */}
      <div className="grid grid-cols-2 border border-t-0 border-black p-3 text-[10px]">
        <div className="space-y-1 pr-3">
          <div className="font-bold uppercase tracking-wider">Terms & Conditions:</div>
          <ol className="list-decimal pl-3 space-y-0.5 text-gray-600">
            <li>Goods once sold will not be exchanged or refunded without original tax invoice.</li>
            <li>Warranty on serialized electronics/mobiles is directly handled by the authorized manufacturer service centres.</li>
            <li>Star Enterprises is not liable for data loss or physical/liquid damage after purchase handover.</li>
            <li>All disputes are subject to Mumbai jurisdiction only.</li>
          </ol>
        </div>
        <div className="flex flex-col justify-between items-end pl-3 text-right">
          <div className="font-semibold">
            For <span className="font-bold">{store.name || 'STAR ENTERPRISES'}</span>
          </div>
          <div className="pt-10">
            <div className="border-t border-black w-40 pt-1 text-center font-medium">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* On-screen Dialog */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Invoice & Print Options"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          {/* Format Selection Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormat('80mm')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  format === '80mm'
                    ? 'bg-accent text-accent-fg'
                    : 'bg-bg text-muted hover:text-text'
                }`}
              >
                <Receipt size={15} />
                80mm Thermal Receipt
              </button>
              <button
                type="button"
                onClick={() => setFormat('normal')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  format === 'normal'
                    ? 'bg-accent text-accent-fg'
                    : 'bg-bg text-muted hover:text-text'
                }`}
              >
                <FileText size={15} />
                Normal Bill (A4 GST Invoice)
              </button>
            </div>

            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-mono">
              {invoiceDetail.invoice_number}
            </Badge>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-bg p-4 flex justify-center">
            {format === '80mm' ? (
              <div className="bg-white text-black p-4 rounded-xl shadow-sm border border-gray-200">
                {thermalReceiptNode}
              </div>
            ) : (
              <div className="bg-white text-black p-4 rounded-xl shadow-sm border border-gray-200 w-full overflow-x-auto">
                {normalBillNode}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="text-xs text-muted">
              Select format above to preview, then print cleanly on 1 page.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
              <Button
                variant={format === '80mm' ? 'solid' : 'outline'}
                onClick={() => triggerPrint('80mm')}
                className="gap-1.5"
              >
                <Printer size={15} /> Print 80mm
              </Button>
              <Button
                variant={format === 'normal' ? 'solid' : 'outline'}
                onClick={() => triggerPrint('normal')}
                className="gap-1.5"
              >
                <FileText size={15} /> Print Normal Bill
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden isolated print portal mounted directly to document.body */}
      {printPortalNode &&
        createPortal(
          <div id="print-document-root">
            {format === '80mm' ? thermalReceiptNode : normalBillNode}
          </div>,
          printPortalNode
        )}
    </>
  );
}
