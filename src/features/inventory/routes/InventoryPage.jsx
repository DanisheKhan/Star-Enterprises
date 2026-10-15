import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Button,
  Input,
  Select,
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
import { useProducts, useProductUnits, useCreateProductUnit } from '../hooks/useInventory';
import { formatCurrency } from '@/shared/lib/format';
import { getErrorMessage } from '@/shared/lib/errors';
import { Plus, AlertCircle } from 'lucide-react';

export function InventoryPage() {
  const { store } = useOutletContext();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);

  // New Unit Form State
  const [newSerial, setNewSerial] = useState('');
  const [conditionGrade, setConditionGrade] = useState('new');
  const [batteryHealth, setBatteryHealth] = useState('100');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [formError, setFormError] = useState('');

  const { data: products = [], isLoading, error } = useProducts(store?.id, {
    search,
    categoryId: selectedCategory || undefined,
  });

  const { data: units = [], isLoading: unitsLoading } = useProductUnits(
    store?.id,
    selectedProduct?.id,
    null
  );

  const createUnitMutation = useCreateProductUnit();

  async function handleAddUnit(e) {
    e.preventDefault();
    if (!newSerial.trim()) {
      setFormError('Serial / IMEI number is required.');
      return;
    }
    setFormError('');

    try {
      await createUnitMutation.mutateAsync({
        product_id: selectedProduct.id,
        store_id: store.id,
        serial_number: newSerial.trim(),
        condition_grade: conditionGrade,
        battery_health: store.code === 'mobiles' ? parseInt(batteryHealth, 10) || null : null,
        purchase_cost: parseFloat(purchaseCost) || 0,
        status: 'in_stock',
        warranty_months: 12,
      });
      setIsAddUnitOpen(false);
      setNewSerial('');
      setPurchaseCost('');
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  // Derive unique categories from products
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...Array.from(
      new Map(
        products
          .filter((p) => p.categories)
          .map((p) => [p.categories.id, { value: p.categories.id, label: p.categories.name }])
      ).values()
    ),
  ];

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted">
        Loading inventory for {store?.name}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-danger">
        {getErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text">
            {store?.name} Inventory
          </h1>
          <p className="text-sm text-muted">
            Manage catalog, serialized units (IMEI/Serial), and stock levels.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            id="search-inventory"
            label="Search Catalog"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            id="filter-category"
            label="Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
      </Card>

      {/* Products Table */}
      {products.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          No products found matching the criteria.
        </Card>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Product & SKU</TableHeaderCell>
              <TableHeaderCell>Category / Brand</TableHeaderCell>
              <TableHeaderCell>Selling Price</TableHeaderCell>
              <TableHeaderCell>Stock Status</TableHeaderCell>
              <TableHeaderCell>Tracking</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((prod) => {
              const qtyOnHand = prod.inventory?.[0]?.quantity_on_hand ?? 0;
              const isLowStock = qtyOnHand <= prod.reorder_level;

              return (
                <TableRow key={prod.id}>
                  <TableCell>
                    <div className="font-semibold text-text">{prod.name}</div>
                    <div className="text-xs text-muted font-mono">{prod.sku}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{prod.categories?.name || 'Unassigned'}</div>
                    <div className="text-xs text-muted">{prod.brands?.name || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{formatCurrency(prod.selling_price)}</div>
                    <div className="text-xs text-muted">GST {prod.gst_rate}%</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{qtyOnHand}</span>
                      {isLowStock ? (
                        <Badge variant="danger" className="text-xs">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">
                          In Stock
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {prod.is_serialized ? (
                      <Badge variant="accent">
                        Serialized ({store.code === 'mobiles' ? 'IMEI' : 'Serial'})
                      </Badge>
                    ) : (
                      <Badge variant="default">Quantity Batch</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {prod.is_serialized && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsUnitModalOpen(true);
                          }}
                        >
                          View Units
                        </Button>
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsAddUnitOpen(true);
                          }}
                        >
                          <Plus size={14} /> Add Unit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Units Listing Modal */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title={`Units for ${selectedProduct?.name}`}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Track individual serial numbers, battery health, and warranty status.
            </p>
            <Button
              variant="solid"
              size="sm"
              onClick={() => {
                setIsUnitModalOpen(false);
                setIsAddUnitOpen(true);
              }}
            >
              <Plus size={14} /> Add New Unit
            </Button>
          </div>

          {unitsLoading ? (
            <div className="py-6 text-center text-muted">Loading serialized units...</div>
          ) : units.length === 0 ? (
            <div className="py-6 text-center text-muted border border-dashed border-border rounded-2xl">
              No serialized units currently registered for this product.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Serial / IMEI</TableHeaderCell>
                  <TableHeaderCell>Condition</TableHeaderCell>
                  {store?.code === 'mobiles' && <TableHeaderCell>Battery</TableHeaderCell>}
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Warranty</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {unit.serial_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant={unit.condition_grade === 'new' ? 'success' : 'default'}>
                        {unit.condition_grade}
                      </Badge>
                    </TableCell>
                    {store?.code === 'mobiles' && (
                      <TableCell className="text-sm">
                        {unit.battery_health ? `${unit.battery_health}%` : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={
                          unit.status === 'in_stock'
                            ? 'success'
                            : unit.status === 'sold'
                            ? 'accent'
                            : 'danger'
                        }
                      >
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{unit.warranty_months} Months</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Modal>

      {/* Add New Unit Modal */}
      <Modal
        isOpen={isAddUnitOpen}
        onClose={() => {
          setIsAddUnitOpen(false);
          setFormError('');
        }}
        title={`Add Serialized Unit - ${selectedProduct?.name}`}
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          {formError && (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <Input
            id="unit-serial"
            label={store?.code === 'mobiles' ? 'IMEI Number (15 digits)' : 'Serial Number'}
            placeholder={store?.code === 'mobiles' ? 'e.g. 358941091234567' : 'e.g. SNY2026TV001'}
            value={newSerial}
            onChange={(e) => setNewSerial(e.target.value)}
            required
            autoFocus
          />

          <Select
            id="condition-grade"
            label="Condition Grade"
            options={[
              { value: 'new', label: 'Brand New (Sealed Pack)' },
              { value: 'A+', label: 'Pre-Owned Grade A+ (Like New, Flawless)' },
              { value: 'A', label: 'Pre-Owned Grade A (Minor Micro-Scratches)' },
              { value: 'B', label: 'Pre-Owned Grade B (Visible Wear & Tear)' },
              { value: 'C', label: 'Pre-Owned Grade C (Heavy Usage / Budget)' },
              { value: 'refurbished', label: 'Certified Refurbished' },
            ]}
            value={conditionGrade}
            onChange={(e) => setConditionGrade(e.target.value)}
          />

          {store?.code === 'mobiles' && (
            <Input
              id="battery-health"
              label="Battery Health Percentage (0 - 100)"
              type="number"
              min="1"
              max="100"
              value={batteryHealth}
              onChange={(e) => setBatteryHealth(e.target.value)}
            />
          )}

          <Input
            id="purchase-cost"
            label="Purchase Cost (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 45000"
            value={purchaseCost}
            onChange={(e) => setPurchaseCost(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddUnitOpen(false);
                setFormError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="solid" pending={createUnitMutation.isPending}>
              Register Unit to Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
