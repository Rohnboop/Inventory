export type Product = {
  id: number;
  dbId?: string;
  imageUrl?: string | null;
  name: string;
  category: string;
  price: number;
  stock: number;
  color: string;
  icon: string;
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

export const products: Product[] = [
  { id: 1, name: "Ceramic Pour Over", category: "Kitchen", price: 28, stock: 12, color: "clay", icon: "☕" },
  { id: 2, name: "Linen Market Tote", category: "Accessories", price: 34, stock: 8, color: "sage", icon: "⌁" },
  { id: 3, name: "Amber Glass Tumbler", category: "Kitchen", price: 18, stock: 24, color: "amber", icon: "◒" },
  { id: 4, name: "Daily Notes Journal", category: "Stationery", price: 16, stock: 6, color: "rose", icon: "✦" },
  { id: 5, name: "Cedar + Smoke Candle", category: "Home", price: 26, stock: 3, color: "cedar", icon: "♨" },
  { id: 6, name: "Woven Planter", category: "Home", price: 42, stock: 9, color: "sand", icon: "❋" },
];

export const categories = ["All items", "Kitchen", "Home", "Accessories", "Stationery"];
export const money = (value: number) => `$${value.toFixed(2)}`;
export const ORDERS_KEY = "stockroom-orders";
export const PRODUCTS_KEY = "stockroom-products";
