import { supabase } from '@/shared/lib/supabase';

// Fallback seed products matching the actual dual-store inventory
const FALLBACK_PRODUCTS = [
  {
    id: 'prod-mob-1',
    name: 'iPhone 15 Pro 128GB',
    slug: 'iphone-15-pro-128gb',
    sku: 'APL-IP15P-128',
    selling_price: 124999,
    mrp: 134900,
    gst_rate: 18,
    is_serialized: true,
    description: 'Brand new Apple flagship smartphone with A17 Pro chip and Aerospace-grade titanium design.',
    specs: {
      storage: '128GB',
      ram: '8GB',
      color: 'Natural Titanium',
      display: '6.1 Super Retina XDR',
      battery: '100%',
      warranty: '1 Year Apple Official',
    },
    stores: { id: 'store-1', code: 'mobiles', name: 'Star Mobiles' },
    categories: { id: 'cat-smartphones', name: 'Smartphones', slug: 'smartphones' },
    brands: { id: 'brand-apple', name: 'Apple', slug: 'apple' },
    inventory: [{ quantity_on_hand: 4 }],
  },
  {
    id: 'prod-mob-2',
    name: 'Samsung Galaxy S24 256GB',
    slug: 'samsung-s24-256gb',
    sku: 'SAM-S24-256',
    selling_price: 79999,
    mrp: 84999,
    gst_rate: 18,
    is_serialized: true,
    description: 'Galaxy AI powered compact flagship with Dynamic AMOLED 2X 120Hz display.',
    specs: {
      storage: '256GB',
      ram: '8GB',
      color: 'Onyx Black',
      display: '6.2 Dynamic AMOLED',
      battery: '100%',
      warranty: '1 Year Brand Warranty',
    },
    stores: { id: 'store-1', code: 'mobiles', name: 'Star Mobiles' },
    categories: { id: 'cat-smartphones', name: 'Smartphones', slug: 'smartphones' },
    brands: { id: 'brand-samsung', name: 'Samsung', slug: 'samsung' },
    inventory: [{ quantity_on_hand: 3 }],
  },
  {
    id: 'prod-mob-3',
    name: 'iPhone 13 128GB (Certified Pre-Owned)',
    slug: 'iphone-13-128gb-pre-owned',
    sku: 'APL-IP13-PO',
    selling_price: 38999,
    mrp: 52999,
    gst_rate: 18,
    is_serialized: true,
    description: 'Certified pre-owned iPhone 13, 52-point quality checked with 88% battery health guarantee.',
    specs: {
      storage: '128GB',
      color: 'Midnight',
      condition: 'Grade A (Flawless)',
      battery_health: 88,
      warranty: '6 Months Store Warranty',
    },
    stores: { id: 'store-1', code: 'mobiles', name: 'Star Mobiles' },
    categories: { id: 'cat-secondhand', name: 'Second-Hand Phones', slug: 'second-hand-phones' },
    brands: { id: 'brand-apple', name: 'Apple', slug: 'apple' },
    inventory: [{ quantity_on_hand: 2 }],
  },
  {
    id: 'prod-mob-4',
    name: 'Apple 20W USB-C Power Adapter',
    slug: 'apple-20w-adapter',
    sku: 'APL-20W-PWR',
    selling_price: 1900,
    mrp: 2199,
    gst_rate: 18,
    is_serialized: false,
    description: 'Original Apple 20W fast wall charger for all iPhone and iPad models.',
    specs: {
      wattage: '20W',
      type: 'USB-C PD',
      color: 'White',
      warranty: '6 Months Official',
    },
    stores: { id: 'store-1', code: 'mobiles', name: 'Star Mobiles' },
    categories: { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
    brands: { id: 'brand-apple', name: 'Apple', slug: 'apple' },
    inventory: [{ quantity_on_hand: 18 }],
  },
  {
    id: 'prod-fe-1',
    name: 'Sony Bravia 55" 4K Google TV',
    slug: 'sony-bravia-55-4k',
    sku: 'SNY-KD55-4K',
    selling_price: 64990,
    mrp: 74900,
    gst_rate: 18,
    is_serialized: true,
    description: 'Stunning 4K visual quality with Triluminos Pro color engine, Dolby Vision and Google TV.',
    specs: {
      screen_size: '55 inch (139 cm)',
      resolution: '4K Ultra HD (3840 x 2160)',
      sound: '20W Dolby Atmos',
      os: 'Google TV with Voice Remote',
      warranty: '2 Years Manufacturer On-Site',
    },
    stores: { id: 'store-2', code: 'furniture-electronics', name: 'Star Furniture & Electronics' },
    categories: { id: 'cat-tv', name: 'Televisions', slug: 'televisions' },
    brands: { id: 'brand-sony', name: 'Sony', slug: 'sony' },
    inventory: [{ quantity_on_hand: 3 }],
  },
  {
    id: 'prod-fe-2',
    name: 'LG 260L Double Door Refrigerator',
    slug: 'lg-260l-double-door',
    sku: 'LG-GL-T292',
    selling_price: 28490,
    mrp: 33990,
    gst_rate: 18,
    is_serialized: true,
    description: 'Smart inverter compressor refrigerator with express ice freezing and multi-air flow cooling.',
    specs: {
      capacity: '260 Litres',
      energy_rating: '3 Star',
      type: 'Frost Free Double Door',
      color: 'Shiny Steel',
      warranty: '1 Year Product + 10 Years Compressor',
    },
    stores: { id: 'store-2', code: 'furniture-electronics', name: 'Star Furniture & Electronics' },
    categories: { id: 'cat-fridge', name: 'Refrigerators', slug: 'refrigerators' },
    brands: { id: 'brand-lg', name: 'LG', slug: 'lg' },
    inventory: [{ quantity_on_hand: 2 }],
  },
  {
    id: 'prod-fe-3',
    name: '3-Seater Fabric Recliner Sofa',
    slug: '3-seater-fabric-recliner-sofa',
    sku: 'FUR-SOFA-3S-GRY',
    selling_price: 34999,
    mrp: 44999,
    gst_rate: 12,
    is_serialized: true,
    description: 'Ergonomic manual reclining 3-seater sofa with high density foam and suede upholstery.',
    specs: {
      dimensions: '210cm W x 90cm D x 95cm H',
      material: 'Premium Suede Fabric',
      color: 'Slate Grey',
      assembly: 'Free Doorstep Assembly',
      warranty: '3 Years Structural Warranty',
    },
    stores: { id: 'store-2', code: 'furniture-electronics', name: 'Star Furniture & Electronics' },
    categories: { id: 'cat-furniture', name: 'Living Room Furniture', slug: 'living-room-furniture' },
    brands: { id: 'brand-furn', name: 'Royal Living', slug: 'royal-living' },
    inventory: [{ quantity_on_hand: 2 }],
  },
];

/**
 * Lists all active public products across all stores with optional filtering
 *
 * @param {Object} [params]
 * @param {string} [params.storeCode] - 'mobiles' | 'furniture-electronics' | 'all'
 * @param {string} [params.categorySlug]
 * @param {string} [params.search]
 */
export async function listPublicProducts({ storeCode = 'all', categorySlug = '', search = '' } = {}) {
  try {
    let query = supabase
      .from('products')
      .select(`
        id, store_id, category_id, brand_id, name, slug, sku, description,
        is_serialized, cost_price, selling_price, min_selling_price,
        gst_rate, hsn_code, specs, is_active,
        stores (id, code, name),
        categories (id, name, slug),
        brands (id, name, slug),
        inventory (quantity_on_hand)
      `)
      .eq('is_active', true)
      .order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase query error, falling back to local catalog:', error.message);
      return filterFallbackProducts({ storeCode, categorySlug, search });
    }

    if (!data || data.length === 0) {
      return filterFallbackProducts({ storeCode, categorySlug, search });
    }

    // Filter by storeCode if specified
    let filtered = data;
    if (storeCode && storeCode !== 'all') {
      filtered = filtered.filter((p) => p.stores?.code === storeCode);
    }

    if (categorySlug) {
      filtered = filtered.filter((p) => p.categories?.slug === categorySlug);
    }

    return filtered;
  } catch (err) {
    console.warn('Network error querying catalog, using fallback catalog:', err);
    return filterFallbackProducts({ storeCode, categorySlug, search });
  }
}

function filterFallbackProducts({ storeCode, categorySlug, search }) {
  let list = [...FALLBACK_PRODUCTS];

  if (storeCode && storeCode !== 'all') {
    list = list.filter((p) => p.stores.code === storeCode);
  }

  if (categorySlug) {
    list = list.filter((p) => p.categories.slug === categorySlug);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brands.name.toLowerCase().includes(q) ||
        p.categories.name.toLowerCase().includes(q)
    );
  }

  return list;
}
