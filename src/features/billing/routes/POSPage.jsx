import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Button,
  Input,
  Card,
  Badge,
  Modal,
} from '@/shared/ui';
import { useProducts, useProductUnits } from '@/features/inventory';
import { usePlaceSale, useInvoiceDetail } from '../hooks/useBilling';
import { InvoicePrintModal } from '../components/InvoicePrintModal';
import { formatCurrency } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/errors';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Search,
  QrCode,
  CreditCard,
  Banknote,
} from 'lucide-react';

export function POSPage() {
  const { store } = useOutletContext();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'upi' | 'card'
  const [paymentReference, setPaymentReference] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Receipt Modal State
  const [completedInvoiceId, setCompletedInvoiceId] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Serial Unit Selector Modal State
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);

  const { data: products = [], isLoading } = useProducts(store?.id);

  // Instant local filtering without network round trips
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.brands?.name?.toLowerCase().includes(q) ||
        p.categories?.name?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const { data: availableUnits = [], isLoading: unitsLoading } = useProductUnits(
    store?.id,
    pendingProduct?.id,
    'in_stock',
    {
      enabled: Boolean(store?.id && pendingProduct?.id && isUnitSelectorOpen),
    }
  );

  const { data: invoiceDetail } = useInvoiceDetail(completedInvoiceId);

  const placeSaleMutation = usePlaceSale();

  // Add Product to Cart Handler
  function handleAddToCart(product) {
    if (product.is_serialized) {
      setPendingProduct(product);
      setIsUnitSelectorOpen(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id && !item.unit_id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id && !item.unit_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          unit_id: null,
          name: product.name,
          sku: product.sku,
          image_url: product.image_url,
          selling_price: product.selling_price,
          gst_rate: product.gst_rate,
          hsn_code: product.hsn_code,
          is_serialized: false,
          serial_number: null,
          quantity: 1,
          discount: 0,
        },
      ];
    });
  }

  // Select Unit for Serialized Item
  function handleSelectUnit(unit) {
    if (!pendingProduct) return;

    if (cart.some((item) => item.unit_id === unit.id)) {
      alert('This unit is already in the cart.');
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        product_id: pendingProduct.id,
        unit_id: unit.id,
        name: pendingProduct.name,
        sku: pendingProduct.sku,
        image_url: pendingProduct.image_url,
        selling_price: pendingProduct.selling_price,
        gst_rate: pendingProduct.gst_rate,
        hsn_code: pendingProduct.hsn_code,
        is_serialized: true,
        serial_number: unit.serial_number,
        condition_grade: unit.condition_grade,
        quantity: 1,
        discount: 0,
      },
    ]);

    setIsUnitSelectorOpen(false);
    setPendingProduct(null);
  }

  function handleRemoveItem(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUpdateQuantity(index, delta) {
    setCart((prev) =>
      prev
        .map((item, i) => {
          if (i !== index) return item;
          if (item.is_serialized) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean)
    );
  }

  // Calculate Totals
  const subtotal = cart.reduce((acc, item) => acc + item.selling_price * item.quantity, 0);
  const totalTax = cart.reduce((acc, item) => {
    const taxable = (item.selling_price - item.discount) * item.quantity;
    return acc + taxable * (item.gst_rate / 100);
  }, 0);
  const grandTotal = subtotal + totalTax;

  // Checkout Execution
  async function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckoutError('');

    try {
      const payload = {
        storeId: store.id,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || null,
        customerGstin: customerGstin || null,
        items: cart.map((item) => ({
          product_id: item.product_id,
          unit_id: item.unit_id,
          quantity: item.quantity,
          unit_price: item.selling_price,
          discount: item.discount || 0,
        })),
        payments: [
          {
            payment_method: paymentMode,
            amount: grandTotal,
            reference_number: paymentReference || null,
          },
        ],
      };

      const result = await placeSaleMutation.mutateAsync(payload);
      setCompletedInvoiceId(result.invoice_id);
      setIsCheckoutOpen(false);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentReference('');
      setIsReceiptOpen(true);
    } catch (err) {
      setCheckoutError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text">
            {store?.name} Billing (POS)
          </h1>
          <p className="text-sm text-muted">
            Fast checkout, barcode scan ready, atomic GST invoice generator.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* Left: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="relative">
            <Input
              id="pos-search"
              placeholder="Search by product name, SKU, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 bg-surface"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {isLoading && products.length === 0 ? (
            <div className="py-12 text-center text-muted">Loading catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-muted border border-dashed border-border rounded-2xl">
              No products found matching "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((prod) => {
                const qtyOnHand = prod.inventory?.[0]?.quantity_on_hand ?? 0;
                const inStock = qtyOnHand > 0;

                return (
                  <Card
                    key={prod.id}
                    className="p-4 flex flex-col justify-between hover:border-accent/40 transition-colors"
                  >
                    <div>
                      <div className="flex gap-3 items-start">
                        {prod.image_url && (
                          <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-border bg-surface flex items-center justify-center">
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-text line-clamp-2 min-h-10 leading-tight">
                              {prod.name}
                            </span>
                            {prod.is_serialized && (
                              <Badge variant="accent" className="text-[10px] shrink-0">
                                {store.code === 'mobiles' ? 'IMEI' : 'Serial'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted font-mono mt-0.5">{prod.sku}</p>
                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="text-base font-semibold text-text">
                              {formatCurrency(prod.selling_price)}
                            </span>
                            <span className="text-[11px] text-muted">+{prod.gst_rate}% GST</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted">Stock: {qtyOnHand}</span>
                      <Button
                        size="sm"
                        variant={inStock ? 'solid' : 'outline'}
                        disabled={!inStock}
                        onClick={() => handleAddToCart(prod)}
                      >
                        {inStock ? (
                          <>
                            <Plus size={14} /> Add to Cart
                          </>
                        ) : (
                          'Out of Stock'
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Cart & Billing Terminal (5 Cols) */}
        <div className="lg:col-span-5 min-w-0">
          <Card className="p-5 sticky top-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} />
                <h3 className="font-semibold text-text">Current Bill</h3>
              </div>
              <Badge variant="default">{cart.length} items</Badge>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-muted border border-dashed border-border rounded-2xl">
                Cart is empty. Select products from the left to start billing.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-72 overflow-y-auto divide-y divide-border min-w-0">
                  {cart.map((item, index) => (
                    <div key={index} className="py-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {item.image_url && (
                          <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-border bg-surface">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-text text-sm truncate">{item.name}</div>
                          {item.serial_number && (
                            <div className="text-xs text-muted font-mono">
                              SN: {item.serial_number} ({item.condition_grade})
                            </div>
                          )}
                          <div className="text-xs text-muted">
                            {formatCurrency(item.selling_price)} + {item.gst_rate}% GST
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {!item.is_serialized ? (
                          <div className="flex items-center border border-border rounded-full px-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(index, -1)}
                              className="px-2 py-1 text-muted hover:text-text cursor-pointer rounded-full"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(index, 1)}
                              className="px-2 py-1 text-muted hover:text-text cursor-pointer rounded-full"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted font-semibold">Qty: 1</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-muted hover:text-danger p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="pt-3 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Taxable Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Estimated GST (CGST + SGST)</span>
                    <span>{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-text pt-2 border-t border-border">
                    <span>Grand Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <Button
                  variant="solid"
                  className="w-full min-h-12 text-base"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Payment ({formatCurrency(grandTotal)})
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Serial Unit Selector Modal */}
      <Modal
        isOpen={isUnitSelectorOpen}
        onClose={() => {
          setIsUnitSelectorOpen(false);
          setPendingProduct(null);
        }}
        title={`Select Serial Unit - ${pendingProduct?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            This product is serialized. Please select the specific unit/IMEI from available stock:
          </p>

          {unitsLoading ? (
            <div className="py-6 text-center text-muted">Loading available units...</div>
          ) : availableUnits.length === 0 ? (
            <div className="py-6 text-center text-danger border border-dashed border-danger/30 rounded-2xl">
              No in-stock serialized units found for this product.
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-2xl max-h-60 overflow-y-auto">
              {availableUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="p-3 flex items-center justify-between hover:bg-bg/60 transition-colors"
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-text">
                      {unit.serial_number}
                    </div>
                    <div className="text-xs text-muted flex gap-2 mt-0.5">
                      <span>Grade: {unit.condition_grade}</span>
                      {unit.battery_health && <span>Battery: {unit.battery_health}%</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleSelectUnit(unit)}>
                    Select Unit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Checkout & Payment Collection"
        size="lg"
      >
        <form onSubmit={handleCheckout} className="space-y-5">
          {checkoutError && (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3.5 text-sm text-danger font-medium">
              {checkoutError}
            </div>
          )}

          <div className="space-y-3.5">
            <Input
              id="cust-name"
              label="Customer Name"
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                id="cust-phone"
                label="Customer Mobile (WhatsApp Invoice)"
                placeholder="e.g. 9820012345"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />

              <Input
                id="cust-gstin"
                label="Customer GSTIN (Optional B2B)"
                placeholder="e.g. 27ABCDE1234F1Z5"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2.5">
            <label className="text-xs font-semibold text-text uppercase tracking-wider block">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-sm font-semibold cursor-pointer transition-colors ${
                  paymentMode === 'cash'
                    ? 'border-accent bg-accent text-accent-fg shadow-sm'
                    : 'border-border bg-surface text-text hover:bg-bg'
                }`}
              >
                <Banknote size={22} className="mb-1.5" />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-sm font-semibold cursor-pointer transition-colors ${
                  paymentMode === 'upi'
                    ? 'border-accent bg-accent text-accent-fg shadow-sm'
                    : 'border-border bg-surface text-text hover:bg-bg'
                }`}
              >
                <QrCode size={22} className="mb-1.5" />
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-sm font-semibold cursor-pointer transition-colors ${
                  paymentMode === 'card'
                    ? 'border-accent bg-accent text-accent-fg shadow-sm'
                    : 'border-border bg-surface text-text hover:bg-bg'
                }`}
              >
                <CreditCard size={22} className="mb-1.5" />
                Card / POS
              </button>
            </div>
          </div>

          {paymentMode !== 'cash' && (
            <Input
              id="payment-ref"
              label="Transaction / UPI Reference Number"
              placeholder="e.g. UPI-1234567890"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              required
            />
          )}

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-muted block">Final Grand Total</span>
              <span className="font-bold text-xl sm:text-2xl text-text">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-5 h-11 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                pending={placeSaleMutation.isPending}
                className="px-6 h-11 text-xs font-semibold"
              >
                Complete Sale & Generate Bill
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* GST Tax Invoice & Print Modal */}
      <InvoicePrintModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoiceDetail={invoiceDetail}
      />
    </div>
  );
}
