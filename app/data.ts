export type Product = {
  id: string;
  sku?: string;
  imageUrl?: string | null;
  name: string;
  category: string;
  price: number;
  stock: number;
  color: string;
  icon: string;
  lowStockThreshold: number;
};

export type CartItem = Product & { quantity: number };

export type SavedOrder = {
  id: string;
  dbId?: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Paid" | "Pending";
};

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  price: number | string;
  stock_quantity: number;
  category_id?: string | null;
  image_url?: string | null;
  low_stock_threshold?: number | null;
};

export const products: Product[] = [
  { id: "KIT-001", sku: "KIT-001", name: "Ceramic Pour Over", category: "Kitchen", price: 28, stock: 12, color: "clay", icon: "☕", lowStockThreshold: 5 },
  { id: "ACC-001", sku: "ACC-001", name: "Linen Market Tote", category: "Accessories", price: 34, stock: 8, color: "sage", icon: "⌁", lowStockThreshold: 5 },
  { id: "KIT-002", sku: "KIT-002", name: "Amber Glass Tumbler", category: "Kitchen", price: 18, stock: 24, color: "amber", icon: "◒", lowStockThreshold: 5 },
  { id: "STA-001", sku: "STA-001", name: "Daily Notes Journal", category: "Stationery", price: 16, stock: 6, color: "rose", icon: "✦", lowStockThreshold: 5 },
  { id: "HOM-001", sku: "HOM-001", name: "Cedar + Smoke Candle", category: "Home", price: 26, stock: 3, color: "cedar", icon: "♨", lowStockThreshold: 5 },
  { id: "HOM-002", sku: "HOM-002", name: "Woven Planter", category: "Home", price: 42, stock: 9, color: "sand", icon: "❋", lowStockThreshold: 5 },
];

const PRESENTATION_BY_SKU: Record<string, { color: string; icon: string }> = {
  "KIT-001": { color: "clay", icon: "☕" },
  "ACC-001": { color: "sage", icon: "⌁" },
  "KIT-002": { color: "amber", icon: "◒" },
  "STA-001": { color: "rose", icon: "✦" },
  "HOM-001": { color: "cedar", icon: "♨" },
  "HOM-002": { color: "sand", icon: "❋" },
};

export const DEFAULT_PRESENTATION = { color: "sand", icon: "✦" };

export function toProduct(row: ProductRow, category: string): Product {
  return {
    id: row.id,
    sku: row.sku,
    imageUrl: row.image_url ?? null,
    name: row.name,
    category,
    price: Number(row.price),
    stock: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold ?? 5,
    ...(PRESENTATION_BY_SKU[row.sku] ?? DEFAULT_PRESENTATION),
  };
}

export const categories = ["All items", "Kitchen", "Home", "Accessories", "Stationery"];
export const money = (value: number) => `$${value.toFixed(2)}`;
