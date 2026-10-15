import { useState } from 'react';
import { Modal, Button, Input, Select } from '@/shared/ui';
import { useCreateProduct } from '../hooks/useInventory';
import { getErrorMessage } from '@/shared/lib/errors';
import { Plus } from 'lucide-react';

export function AddProductModal({ storeId, isOpen, onClose }) {
  const createProductMutation = useCreateProduct();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [isSerialized, setIsSerialized] = useState(true);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !sellingPrice) {
      setError('Product name, SKU code, and selling price are required.');
      return;
    }

    const sp = parseFloat(sellingPrice);
    const cp = parseFloat(costPrice) || 0;

    setError('');
    try {
      await createProductMutation.mutateAsync({
        store_id: storeId,
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: sku.trim().toUpperCase(),
        selling_price: sp,
        cost_price: cp,
        min_selling_price: cp,
        gst_rate: parseInt(gstRate, 10) || 18,
        is_serialized: isSerialized,
        description: description.trim() || `${name.trim()} available at Star Enterprises.`,
        is_active: true,
      });
      onClose();
      setName('');
      setSku('');
      setSellingPrice('');
      setCostPrice('');
      setDescription('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Product to Store Catalog"
      className="max-w-lg"
    >
      <form onSubmit={handleCreateSubmit} className="space-y-4 text-text min-w-0">
        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            {error}
          </div>
        )}

        <Input
          id="prod-name"
          label="Product Full Name"
          placeholder="e.g. OnePlus 12R 256GB / Sony 65-Inch Bravia OLED"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!sku) {
              setSku(`SKU-${e.target.value.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
            }
          }}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="prod-sku"
            label="Product SKU Code"
            placeholder="e.g. 1PL-12R-256"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
          <Select
            id="prod-tracking"
            label="Inventory Tracking Mode"
            value={isSerialized ? 'serialized' : 'batch'}
            onChange={(e) => setIsSerialized(e.target.value === 'serialized')}
            options={[
              { value: 'serialized', label: 'Serialized (Unique IMEI / Serial No)' },
              { value: 'batch', label: 'Quantity Batch (Non-Serialized)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            id="prod-selling-price"
            type="number"
            label="Selling Price (₹)"
            placeholder="42999"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
          <Input
            id="prod-cost-price"
            type="number"
            label="Cost Price (₹)"
            placeholder="36000"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            required
          />
          <Select
            id="prod-gst"
            label="GST Rate"
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            options={[
              { value: '18', label: '18% GST' },
              { value: '12', label: '12% GST' },
              { value: '28', label: '28% GST' },
              { value: '5', label: '5% GST' },
            ]}
          />
        </div>

        <Input
          id="prod-desc"
          label="Product Description / Specs"
          placeholder="Short specifications overview for billing and customer receipts"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="pt-2 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="solid" pending={createProductMutation.isPending} className="gap-1.5">
            <Plus size={14} /> Add Product to Catalog
          </Button>
        </div>
      </form>
    </Modal>
  );
}
