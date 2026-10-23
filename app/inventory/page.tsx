"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money, toProduct, type Product } from "../data";
import { supabase } from "../supabase";
import { AuthButton } from "../components/AuthButton";

export default function InventoryPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", category: "Kitchen", price: "", cost: "", stock: "", threshold: "5", image: null as File | null, preview: "" });

  useEffect(() => {
    void Promise.all([
      supabase.from("products").select("id, sku, name, category_id, price, stock_quantity, image_url, low_stock_threshold"),
      supabase.from("categories").select("id, name"),
    ]).then(([productResult, categoryResult]) => {
      if (productResult.error || categoryResult.error || !productResult.data || !categoryResult.data) return;
      setItems(productResult.data.map((row) => toProduct(row, categoryResult.data.find((category) => category.id === row.category_id)?.name ?? "Other")));
    });
  }, []);

  function updateStock(id: string, amount: number) {
    const updated = items.map((item) => item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item);
    setItems(updated);
    const item = updated.find((product) => product.id === id);
    if (item) void supabase.from("products").update({ stock_quantity: item.stock }).eq("id", item.id);
    setNotice("Inventory updated");
    window.setTimeout(() => setNotice(""), 1500);
  }

  async function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data: category, error: categoryError } = await supabase.from("categories").select("id").eq("name", form.category).single();
    if (categoryError || !category) { setNotice("Category could not be found"); return; }
    let imageUrl: string | null = null;
    if (form.image) {
      const extension = form.image.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("product-images").upload(path, form.image, { contentType: form.image.type, upsert: false });
      if (upload.error) { setNotice("Could not upload image"); return; }
      imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }
    const { data, error } = await supabase.from("products").insert({ sku: form.sku.trim(), name: form.name.trim(), category_id: category.id, price: Number(form.price), cost: Number(form.cost || 0), stock_quantity: Number(form.stock || 0), low_stock_threshold: Number(form.threshold || 5), image_url: imageUrl }).select("id").single();
    if (error || !data) { setNotice(error?.message.includes("duplicate") ? "SKU already exists" : "Could not add product"); return; }
    setItems((current) => [...current, { id: data.id, sku: form.sku.trim(), imageUrl, name: form.name.trim(), category: form.category, price: Number(form.price), stock: Number(form.stock || 0), lowStockThreshold: Number(form.threshold || 5), color: "sand", icon: "✦" }]);
    setForm({ sku: "", name: "", category: "Kitchen", price: "", cost: "", stock: "", threshold: "5", image: null, preview: "" });
    setShowForm(false);
    setNotice("Product added");
    window.setTimeout(() => setNotice(""), 1600);
  }

  async function deleteProduct(item: Product) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", item.id);
    if (error) { setNotice("Could not delete product"); return; }
    setItems((current) => current.filter((product) => product.id !== item.id));
    setNotice("Product deleted");
    window.setTimeout(() => setNotice(""), 1600);
  }

  const lowStock = items.filter((item) => item.stock <= item.lowStockThreshold).length;
  return <div className="app-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">S</span><span>STOCKROOM</span></Link><div className="store-status"><span className="status-dot" /> Oak &amp; Pine / Main floor</div><nav className="topnav" aria-label="Main navigation"><Link href="/">Sell</Link><Link className="active" href="/inventory">Inventory</Link><Link href="/orders">Orders</Link></nav><AuthButton /></header><main className="page-content"><div className="page-title"><div><p className="eyebrow">Stock control</p><h1>Inventory</h1><p className="page-subtitle">Keep an eye on what is moving and what needs a restock.</p></div><button className="primary-button" onClick={() => setShowForm(true)}>+ Add product</button></div><div className="inventory-stats"><div><span>Total products</span><strong>{items.length}</strong></div><div><span>Units on hand</span><strong>{items.reduce((sum, item) => sum + item.stock, 0)}</strong></div><div><span>Low stock</span><strong className="alert-number">{lowStock}</strong></div></div><div className="table-wrap"><div className="table-heading"><h2>All products</h2><span>{items.length} SKUs</span></div><div className="inventory-table"><div className="table-row table-labels"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Actions</span></div>{items.map((item) => <div className="table-row" key={`inventory-${item.id}`}><div className="table-product">{item.imageUrl ? <img className="product-thumb" src={item.imageUrl} alt="" /> : <span className={`mini-art ${item.color}`}>{item.icon}</span>}<div><strong>{item.name}</strong><small>{item.sku ?? "Supabase product"}</small></div></div><span className="muted">{item.category}</span><span>{money(item.price)}</span><span className={item.stock <= item.lowStockThreshold ? "stock-low" : "stock-good"}>{item.stock} units{item.stock <= item.lowStockThreshold && <small> Low stock</small>}</span><div className="stock-controls"><button onClick={() => updateStock(item.id, -1)} aria-label={`Remove stock from ${item.name}`}>−</button><button onClick={() => updateStock(item.id, 1)} aria-label={`Add stock to ${item.name}`}>+</button><button className="delete-button" onClick={() => deleteProduct(item)} aria-label={`Delete ${item.name}`}>×</button></div></div>)}</div></div></main>{showForm && <div className="modal-backdrop"><form className="product-form" onSubmit={addProduct}><div className="form-heading"><div><p className="eyebrow">Inventory</p><h2>Add product</h2></div><button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="Close form">×</button></div><label>SKU<input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="KIT-003" /></label><label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Product name" /></label><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["Kitchen", "Home", "Accessories", "Stationery"].map((category) => <option key={category}>{category}</option>)}</select></label><label>Product image<input accept="image/png,image/jpeg,image/webp" type="file" onChange={(event) => { const image = event.target.files?.[0] ?? null; setForm({ ...form, image, preview: image ? URL.createObjectURL(image) : "" }); }} />{form.preview && <img className="image-preview" src={form.preview} alt="Selected product preview" />}</label><div className="form-grid"><label>Price<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" /></label><label>Cost<input min="0" step="0.01" type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} placeholder="0.00" /></label><label>Stock<input min="0" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="0" /></label><label>Low stock at<input min="0" type="number" value={form.threshold} onChange={(event) => setForm({ ...form, threshold: event.target.value })} /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit">Save product</button></div></form></div>}{notice && <div className="toast">✓ {notice}</div>}</div>;
}
