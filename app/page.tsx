"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { categories, money, products as seedProducts, type CartItem, type Product } from "./data";
import { supabase } from "./supabase";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All items");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Product[]>(seedProducts);
  const [cart, setCart] = useState<CartItem[]>([
    { ...seedProducts[0], quantity: 1 },
    { ...seedProducts[2], quantity: 2 },
  ]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void supabase.from("products").select("id, sku, name, price, stock_quantity, image_url, categories(name)").eq("active", true).then(({ data, error }) => {
      if (error || !data) return;
      setCatalog(data.map((row, index) => {
        const seed = seedProducts.find((product) => product.name === row.name);
        const categoryValue = row.categories as { name?: string } | { name?: string }[] | null;
        const category = Array.isArray(categoryValue) ? categoryValue[0]?.name : categoryValue?.name;
        return seed ? { ...seed, dbId: row.id, imageUrl: row.image_url, price: Number(row.price), stock: row.stock_quantity } : { id: index + 100, dbId: row.id, imageUrl: row.image_url, name: row.name, category: category ?? "Other", price: Number(row.price), stock: row.stock_quantity, color: "sand", icon: "✦" };
      }));
    });
  }, []);

  const visibleProducts = useMemo(() => catalog.filter((product) =>
    (activeCategory === "All items" || product.category === activeCategory) && product.name.toLowerCase().includes(query.toLowerCase())
  ), [activeCategory, catalog, query]);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: Product) {
    setCart((current) => current.some((item) => item.id === product.id)
      ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { ...product, quantity: 1 }]);
    setNotice(`${product.name} added to order`);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  }

  async function checkout() {
    const { data: dbProducts, error: productError } = await supabase.from("products").select("id, sku");
    if (productError || !dbProducts) { setNotice("Could not load products"); return; }
    const itemsWithIds = cart.map((item) => ({ ...item, dbId: item.dbId ?? dbProducts.find((product) => product.sku.endsWith(`-${String(item.id).padStart(3, "0")}`))?.id }));
    if (itemsWithIds.some((item) => !item.dbId)) { setNotice("Product link is missing"); return; }
    const { data: order, error } = await supabase.from("orders").insert({ status: "paid", subtotal, tax: subtotal * 0.0825, total: subtotal * 1.0825, payment_method: "other" }).select("id").single();
    if (error || !order) { setNotice("Could not save order"); return; }
    const { error: itemError } = await supabase.from("order_items").insert(itemsWithIds.map((item) => ({ order_id: order.id, product_id: item.dbId, quantity: item.quantity, unit_price: item.price })));
    if (itemError) { setNotice("Order created, but items need review"); return; }
    await Promise.all(itemsWithIds.map((item) => supabase.from("products").update({ stock_quantity: Math.max(0, item.stock - item.quantity) }).eq("id", item.dbId)));
    setCart([]);
    setNotice("Order saved successfully");
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/"><span className="brand-mark">S</span><span>STOCKROOM</span></Link>
        <div className="store-status"><span className="status-dot" /> Oak &amp; Pine / Main floor <span className="divider" /> <span className="muted">Thursday, Sep 03</span></div>
        <nav className="topnav" aria-label="Main navigation"><Link className="active" href="/">Sell</Link><Link href="/inventory">Inventory</Link><Link href="/orders">Orders</Link></nav>
        <button className="avatar" aria-label="Open profile">AR</button>
      </header>

      <main className="workspace">
        <section className="catalog-panel">
          <div className="section-heading"><div><p className="eyebrow">Point of sale</p><h1>Good afternoon, Alex.</h1></div><button className="icon-button" aria-label="More options">•••</button></div>
          <div className="metrics"><div><span>Today&apos;s sales</span><strong>$1,284.00</strong><small className="up">↑ 12.8% <em>vs. last Thursday</em></small></div><div><span>Orders</span><strong>38</strong><small>3 pending</small></div><div><span>Low stock</span><strong className="alert-number">4</strong><small className="alert-text">Needs attention</small></div></div>
          <div className="catalog-toolbar"><div className="search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search products" /></div><button className="filter-button">Filter <span>⌄</span></button></div>
          <nav className="category-tabs" aria-label="Product categories">{categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</nav>
          <div className="product-grid">{visibleProducts.map((product) => <button className="product-card" key={`catalog-${product.dbId ?? product.id}`} onClick={() => addToCart(product)}><div className={`product-art ${product.color}`}>{product.imageUrl ? <img className="product-image" src={product.imageUrl} alt="" /> : <span>{product.icon}</span>}<small>{product.stock} in stock</small></div><div className="product-info"><span>{product.category}</span><strong>{product.name}</strong><b>{money(product.price)}</b></div></button>)}</div>
          {visibleProducts.length === 0 && <div className="empty-state">No products match your search.</div>}
        </section>

        <aside className="order-panel"><div className="order-heading"><div><p className="eyebrow">Current order</p><h2>New sale <span>#{itemCount + 1048}</span></h2></div><button className="clear-button" onClick={() => setCart([])}>Clear</button></div><div className="customer-select"><span className="customer-icon">◎</span><div><small>Customer</small><strong>Walk-in customer</strong></div><span>⌄</span></div><div className="cart-list">{cart.map((item) => <div className="cart-item" key={`cart-${item.dbId ?? item.id}`}><div className={`mini-art ${item.color}`}>{item.icon}</div><div className="cart-details"><strong>{item.name}</strong><span>{money(item.price)} each</span><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button><b>{item.quantity}</b><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button></div></div><strong className="line-total">{money(item.price * item.quantity)}</strong></div>)}</div>{cart.length === 0 && <div className="cart-empty">Your order is empty.<br /><span>Add a product to begin.</span></div>}<div className="checkout-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Tax <small>(8.25%)</small></span><b>{money(subtotal * 0.0825)}</b></div><div className="total-row"><span>Total</span><strong>{money(subtotal * 1.0825)}</strong></div><button className="checkout-button" disabled={!cart.length} onClick={checkout}>Continue to payment <span>→</span></button></div></aside>
      </main>
      {notice && <div className="toast">✓ {notice}</div>}
    </div>
  );
}
