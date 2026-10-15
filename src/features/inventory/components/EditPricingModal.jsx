import { useState } from 'react';
import { Modal, Button, Input, Select } from '@/shared/ui';
import { useUpdatePricing } from '../hooks/useInventory';
import { getErrorMessage } from '@/shared/lib/errors';
import { Tag } from 'lucide-react';

function EditPricingForm({ product, onClose }) {
  const updatePricingMutation = useUpdatePricing();

  const [sellingPrice, setSellingPrice] = useState(String(product.selling_price || ''));
  const [costPrice, setCostPrice] = useState(String(product.cost_price || ''));
  const [minSellingPrice, setMinSellingPrice] = useState(String(product.min_selling_price || ''));
  const [gstRate, setGstRate] = useState(String(product.gst_rate || '18'));
  const [error, setError] = useState('');

  async function handlePriceSubmit(e) {
    e.preventDefault();
    const sp = parseFloat(sellingPrice);
    const cp = parseFloat(costPrice) || 0;
    const minSp = parseFloat(minSellingPrice) || cp;

    if (isNaN(sp) || sp <= 0) {
      setError('Please provide a valid selling price.');
      return;
    }

    if (minSp > sp) {
      setError('Minimum selling price cannot exceed the official selling price.');
      return;
    }

    setError('');
    try {
      await updatePricingMutation.mutateAsync({
        productId: product.id,
        sellingPrice: sp,
        costPrice: cp,
        minSellingPrice: minSp,
        gstRate: parseInt(gstRate, 10) || 18,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handlePriceSubmit} className="space-y-4 text-text min-w-0">
      {error && (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          {error}
        </div>
      )}

      <div className="p-3.5 rounded-2xl border border-border bg-bg space-y-1 text-xs">
        <div className="text-muted">SKU: <span className="font-mono text-text">{product.sku}</span></div>
        <div className="text-muted">Store: <span className="font-semibold text-text">{product.stores?.name}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="selling-price"
          type="number"
          label="Selling Price (₹)"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          required
        />
        <Input
          id="cost-price"
          type="number"
          label="Purchase Cost Price (₹)"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="min-selling-price"
          type="number"
          label="Min Floor Price (₹)"
          value={minSellingPrice}
          onChange={(e) => setMinSellingPrice(e.target.value)}
          required
        />
        <Select
          id="gst-rate"
          label="GST Tax Rate"
          value={gstRate}
          onChange={(e) => setGstRate(e.target.value)}
          options={[
            { value: '18', label: '18% GST (Mobiles & Electronics)' },
            { value: '12', label: '12% GST (Furniture & Apparel)' },
            { value: '28', label: '28% GST (Luxury Goods / ACs)' },
            { value: '5', label: '5% GST (Standard Accessories)' },
          ]}
        />
      </div>

      <div className="pt-2 border-t border-border flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="solid" pending={updatePricingMutation.isPending} className="gap-1.5">
          <Tag size={14} /> Save Pricing Changes
        </Button>
      </div>
    </form>
  );
}

export function EditPricingModal({ product, isOpen, onClose }) {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Pricing & GST: ${product.name}`}
      className="max-w-md"
    >
      <EditPricingForm key={product.id} product={product} onClose={onClose} />
    </Modal>
  );
}
