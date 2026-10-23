"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money, type SavedOrder } from "../data";
import { supabase } from "../supabase";
import { AuthButton } from "../components/AuthButton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  useEffect(() => {
    void supabase.from("orders").select("id, order_number, created_at, status, total, order_items(quantity)").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error || !data) return;
      setOrders(data.map((order) => ({ id: `ORD-${String(order.order_number).padStart(6, "0")}`, dbId: order.id, createdAt: order.created_at, items: order.order_items.map((item) => ({ quantity: item.quantity } as SavedOrder["items"][number])), subtotal: 0, tax: 0, total: Number(order.total), status: order.status === "paid" ? "Paid" : "Pending" })));
    });
  }, []);
  async function deleteOrder(order: SavedOrder) {
    if (!order.dbId || !window.confirm(`Delete ${order.id}? This also removes its line items.`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", order.dbId);
    if (error) return;
    setOrders((current) => current.filter((item) => item.dbId !== order.dbId));
  }

  return <div className="app-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">S</span><span>STOCKROOM</span></Link><div className="store-status"><span className="status-dot" /> Oak &amp; Pine / Main floor</div><nav className="topnav" aria-label="Main navigation"><Link href="/">Sell</Link><Link href="/inventory">Inventory</Link><Link className="active" href="/orders">Orders</Link></nav><AuthButton /></header><main className="page-content"><div className="page-title"><div><p className="eyebrow">Sales history</p><h1>Orders</h1><p className="page-subtitle">Every sale, saved in one place.</p></div><Link className="primary-button" href="/">+ New sale</Link></div><div className="table-wrap"><div className="table-heading"><h2>Recent orders</h2><span>{orders.length} saved</span></div>{orders.length === 0 ? <div className="orders-empty"><span>◌</span><strong>No orders yet</strong><p>Completed sales from the POS will appear here.</p><Link href="/">Start a sale →</Link></div> : <div className="orders-table"><div className="table-row table-labels"><span>Order</span><span>Date</span><span>Items</span><span>Status</span><span>Total</span><span>Actions</span></div>{orders.map((order) => <div className="table-row" key={`order-${order.id}`}><strong>{order.id}</strong><span className="muted">{new Date(order.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span><span className="paid-status">{order.status}</span><strong>{money(order.total)}</strong><button className="delete-button order-delete" onClick={() => deleteOrder(order)} aria-label={`Delete ${order.id}`}>×</button></div>)}</div>}</div></main></div>;
}
