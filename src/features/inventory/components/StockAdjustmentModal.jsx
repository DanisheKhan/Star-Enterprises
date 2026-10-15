import { useState } from 'react';
import { Modal, Button, Input, Select } from '@/shared/ui';
import { useAdjustStock } from '../hooks/useInventory';
import { getErrorMessage } from '@/shared/lib/errors';
import { Sliders } from 'lucide-react';

function StockAdjustmentForm({ product, storeId, onClose }) {
  const adjustMutation = useAdjustStock();
  const currentQty = product?.inventory?.[0]?.quantity_on_hand ?? 0;

  const [newQty, setNewQty] = useState(String(currentQty));
  const [reason, setReason] = useState('restock');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  async function handleAdjustSubmit(e) {
    e.preventDefault();
    const parsedQty = parseInt(newQty, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setError('Please provide a valid non-negative stock quantity.');
      return;
    }

    setError('');
    try {
      await adjustMutation.mutateAsync({
        storeId,
        productId: product.id,
        previousQuantity: currentQty,
        newQuantity: parsedQty,
        reason,
        notes: notes.trim() || `Adjusted from ${currentQty} to ${parsedQty}`,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleAdjustSubmit} className="space-y-4 text-text min-w-0">
      {error && (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          {error}
        </div>
      )}

      <div className="p-3.5 rounded-2xl border border-border bg-bg space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted">Current Stock on Hand:</span>
          <span className="font-semibold text-text">{currentQty} units</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>SKU Code:</span>
          <span className="font-mono text-text">{product.sku}</span>
        </div>
      </div>

      <Input
        id="new-stock-qty"
        type="number"
        label="New Verified Quantity on Hand"
        value={newQty}
        onChange={(e) => setNewQty(e.target.value)}
        required
      />

      <Select
        id="adjust-reason"
        label="Reason for Adjustment"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        options={[
          { value: 'restock', label: 'New Stock Restock / Shipment Received' },
          { value: 'audit_reconcile', label: 'Physical Store Inventory Audit Count' },
          { value: 'damage', label: 'Damaged / Defective Stock Write-Off' },
          { value: 'theft', label: 'Missing / Lost Stock Write-Off' },
          { value: 'return', label: 'Customer RMA / Store Return' },
        ]}
      />

      <Input
        id="adjust-notes"
        label="Adjustment Notes / Invoice Ref"
        placeholder="e.g. Verified by Store Owner during physical audit"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="pt-2 border-t border-border flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="solid" pending={adjustMutation.isPending} className="gap-1.5">
          <Sliders size={14} /> Update Stock Level
        </Button>
      </div>
    </form>
  );
}

export function StockAdjustmentModal({ product, storeId, isOpen, onClose }) {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${product.name}`}
      className="max-w-md"
    >
      <StockAdjustmentForm
        key={product.id}
        product={product}
        storeId={storeId}
        onClose={onClose}
      />
    </Modal>
  );
}
